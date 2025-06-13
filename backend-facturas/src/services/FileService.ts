import fs from 'fs/promises'
import path from 'path'
import { FacturaMikrowisp, ClienteAgrupado, SyncMetadata, CacheData } from '../types'
import { MikrowispApi } from './MikrowispApi'

export class FileService {
  private dataDir: string
  private facturasPageadasFile: string
  private facturasPendientesFile: string
  private metaFile: string
  private mikrowisp: MikrowispApi

  constructor() {
    this.dataDir = path.resolve(process.env.DATA_DIR || './data')
    this.facturasPageadasFile = path.join(this.dataDir, 'facturas-pagadas.json')
    this.facturasPendientesFile = path.join(this.dataDir, 'facturas-pendientes.json')
    this.metaFile = path.join(this.dataDir, 'sync-meta.json')
    
    this.mikrowisp = new MikrowispApi(
      process.env.MIKROWISP_API_URL || 'https://demo.mikrosystem.net/api/v1',
      process.env.MIKROWISP_TOKEN || ''
    )

    this.init()
  }

  private async init() {
    await this.ensureDataDir()
    console.log('📁 FileService inicializado')
  }

  async getFacturasPagadas(): Promise<ClienteAgrupado[]> {
    try {
      // Verificar si existe el archivo y si está actualizado
      const meta = await this.getSyncMeta('pagadas')
      const now = new Date()
      const lastSync = new Date(meta?.lastSync || 0)
      const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60)
      const syncInterval = Number(process.env.SYNC_INTERVAL_MINUTES) || 30

      // Si los datos tienen menos del intervalo configurado, usar cache
      if (diffMinutes < syncInterval && await this.fileExists(this.facturasPageadasFile)) {
        console.log('📁 Cargando facturas pagadas desde archivo (cache válido)')
        const data = await fs.readFile(this.facturasPageadasFile, 'utf-8')
        const cacheData: CacheData<ClienteAgrupado[]> = JSON.parse(data)
        return cacheData.data
      }

      // Si no, sincronizar
      console.log('🔄 Cache expirado o no existe, sincronizando facturas pagadas...')
      return await this.syncFacturasPagadas()

    } catch (error) {
      console.error('❌ Error obteniendo facturas pagadas:', error)
      throw error
    }
  }

  async getFacturasPendientes(): Promise<ClienteAgrupado[]> {
    try {
      const meta = await this.getSyncMeta('pendientes')
      const now = new Date()
      const lastSync = new Date(meta?.lastSync || 0)
      const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60)
      const syncInterval = Number(process.env.SYNC_INTERVAL_MINUTES) || 30

      if (diffMinutes < syncInterval && await this.fileExists(this.facturasPendientesFile)) {
        console.log('📁 Cargando facturas pendientes desde archivo (cache válido)')
        const data = await fs.readFile(this.facturasPendientesFile, 'utf-8')
        const cacheData: CacheData<ClienteAgrupado[]> = JSON.parse(data)
        return cacheData.data
      }

      console.log('🔄 Cache expirado o no existe, sincronizando facturas pendientes...')
      return await this.syncFacturasPendientes()

    } catch (error) {
      console.error('❌ Error obteniendo facturas pendientes:', error)
      throw error
    }
  }

  private async syncFacturasPagadas(): Promise<ClienteAgrupado[]> {
    const startTime = Date.now()
    
    try {
      console.log('🚀 Iniciando sincronización de facturas PAGADAS...')
      
      const facturas = await this.mikrowisp.cargarTodasLasFacturas(0) // 0 = pagadas
      const clientesAgrupados = this.agruparPorCliente(facturas, 'PAGADO')
      const duration = Date.now() - startTime
      
      // Crear objeto de cache con metadata
      const cacheData: CacheData<ClienteAgrupado[]> = {
        data: clientesAgrupados,
        metadata: {
          lastSync: new Date().toISOString(),
          totalFacturas: facturas.length,
          totalClientes: clientesAgrupados.length,
          duration,
          success: true,
          syncType: 'pagadas'
        }
      }
      
      // Guardar datos
      await fs.writeFile(
        this.facturasPageadasFile, 
        JSON.stringify(cacheData, null, 2)
      )
      
      // Actualizar metadata global
      await this.updateSyncMeta('pagadas', cacheData.metadata)

      console.log(`✅ ${facturas.length} facturas PAGADAS sincronizadas en ${duration}ms`)
      console.log(`👥 ${clientesAgrupados.length} clientes agrupados`)
      
      return clientesAgrupados

    } catch (error) {
      const duration = Date.now() - startTime
      const errorMeta: SyncMetadata = {
        lastSync: new Date().toISOString(),
        totalFacturas: 0,
        totalClientes: 0,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        syncType: 'pagadas'
      }
      
      await this.updateSyncMeta('pagadas', errorMeta)
      
      console.error('❌ Error sincronizando facturas pagadas:', error)
      throw error
    }
  }

  private async syncFacturasPendientes(): Promise<ClienteAgrupado[]> {
    const startTime = Date.now()
    
    try {
      console.log('🚀 Iniciando sincronización de facturas PENDIENTES...')
      
      const facturas = await this.mikrowisp.cargarTodasLasFacturas(1) // 1 = pendientes
      const clientesAgrupados = this.agruparPorCliente(facturas, 'PENDIENTE')
      const duration = Date.now() - startTime
      
      const cacheData: CacheData<ClienteAgrupado[]> = {
        data: clientesAgrupados,
        metadata: {
          lastSync: new Date().toISOString(),
          totalFacturas: facturas.length,
          totalClientes: clientesAgrupados.length,
          duration,
          success: true,
          syncType: 'pendientes'
        }
      }
      
      await fs.writeFile(
        this.facturasPendientesFile, 
        JSON.stringify(cacheData, null, 2)
      )
      
      await this.updateSyncMeta('pendientes', cacheData.metadata)

      console.log(`✅ ${facturas.length} facturas PENDIENTES sincronizadas en ${duration}ms`)
      console.log(`👥 ${clientesAgrupados.length} clientes agrupados`)
      
      return clientesAgrupados

    } catch (error) {
      const duration = Date.now() - startTime
      const errorMeta: SyncMetadata = {
        lastSync: new Date().toISOString(),
        totalFacturas: 0,
        totalClientes: 0,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        syncType: 'pendientes'
      }
      
      await this.updateSyncMeta('pendientes', errorMeta)
      
      console.error('❌ Error sincronizando facturas pendientes:', error)
      throw error
    }
  }

  private agruparPorCliente(facturas: FacturaMikrowisp[], estado: 'PAGADO' | 'PENDIENTE'): ClienteAgrupado[] {
    const agrupado: Record<string, ClienteAgrupado> = {}
    
    facturas.forEach(factura => {
      const id = factura.idcliente || 'SIN_ID'
      
      if (!agrupado[id]) {
        agrupado[id] = {
          idcliente: id,
          facturas: [],
          totalPagado: 0,
          estado
        }
      }
      
      agrupado[id].facturas.push(factura)
      agrupado[id].totalPagado += Number(factura.total) || 0
    })
    
    // Ordenar de mayor a menor por cantidad de facturas
    return Object.values(agrupado).sort((a, b) => b.facturas.length - a.facturas.length)
  }

  private async getSyncMeta(type: 'pagadas' | 'pendientes'): Promise<SyncMetadata | null> {
    try {
      if (!await this.fileExists(this.metaFile)) {
        return null
      }
      
      const data = await fs.readFile(this.metaFile, 'utf-8')
      const allMeta = JSON.parse(data)
      return allMeta[type] || null
      
    } catch (error) {
      console.warn('⚠️ Error leyendo metadata:', error)
      return null
    }
  }

  private async updateSyncMeta(type: 'pagadas' | 'pendientes', meta: SyncMetadata): Promise<void> {
    try {
      let allMeta: Record<string, SyncMetadata> = {}
      
      if (await this.fileExists(this.metaFile)) {
        const data = await fs.readFile(this.metaFile, 'utf-8')
        allMeta = JSON.parse(data)
      }
      
      allMeta[type] = meta
      
      await fs.writeFile(this.metaFile, JSON.stringify(allMeta, null, 2))
      
    } catch (error) {
      console.error('❌ Error actualizando metadata:', error)
    }
  }

  async getSyncStatus(): Promise<Record<string, SyncMetadata | null>> {
    return {
      pagadas: await this.getSyncMeta('pagadas'),
      pendientes: await this.getSyncMeta('pendientes')
    }
  }

  // Método para forzar sincronización manual
  async forceSyncAll(): Promise<void> {
    console.log('🔄 Forzando sincronización completa...')
    
    await Promise.allSettled([
      this.syncFacturasPagadas(),
      this.syncFacturasPendientes()
    ])
    
    console.log('✅ Sincronización completa finalizada')
  }

  private async ensureDataDir(): Promise<void> {
    try {
      await fs.access(this.dataDir)
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true })
      console.log(`📁 Directorio de datos creado: ${this.dataDir}`)
    }
  }

  private async fileExists(filepath: string): Promise<boolean> {
    try {
      await fs.access(filepath)
      return true
    } catch {
      return false
    }
  }
} 