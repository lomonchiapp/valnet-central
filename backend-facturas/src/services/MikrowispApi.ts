import axios, { AxiosInstance } from 'axios'
import { MikrowispApiParams, MikrowispApiResponse, FacturaMikrowisp } from '../types'

export class MikrowispApi {
  private client: AxiosInstance
  private token: string

  constructor(apiUrl: string, token: string) {
    this.token = token
    this.client = axios.create({
      baseURL: apiUrl,
      timeout: Number(process.env.TIMEOUT_MS) || 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  async listarFacturas(params: MikrowispApiParams = {}): Promise<MikrowispApiResponse> {
    try {
      const requestBody = {
        token: this.token,
        limit: params.limit,
        estado: params.estado !== undefined ? params.estado : 1,
        idcliente: params.idcliente || '',
        fechapago: params.fechapago || '',
        formapago: params.formapago || ''
      }

      console.log(`🔄 Llamando API Mikrowisp con: ${JSON.stringify(requestBody)}`)

      const response = await this.client.post<MikrowispApiResponse>(
        '/GetInvoices',
        requestBody
      )

      return response.data

    } catch (error) {
      console.error('❌ Error en API Mikrowisp:', error)
      throw new Error(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  async cargarTodasLasFacturas(estado: number): Promise<FacturaMikrowisp[]> {
    console.log(`🚀 Iniciando carga robusta de facturas (estado: ${estado})...`)
    
    try {
      // PASO 1: Obtener muestra inicial para extraer IDs de clientes únicos
      console.log('📋 PASO 1: Obteniendo muestra de facturas para extraer clientes...')
      const muestraInicial = await this.listarFacturas({ 
        limit: 3000, 
        estado 
      })
      
      if (!muestraInicial || !muestraInicial.facturas) {
        throw new Error('No se pudo obtener muestra inicial de facturas')
      }
      
      // Extraer IDs únicos de clientes de la muestra
      const idsClientesMuestra = [...new Set(
        muestraInicial.facturas
          .map(f => f.idcliente)
          .filter(id => id && id.trim() !== '')
      )]
      
      console.log(`📊 Encontrados ${idsClientesMuestra.length} clientes únicos en muestra inicial`)
      console.log(`📦 Facturas en muestra: ${muestraInicial.facturas.length}`)
      
      // PASO 2: Para cada cliente, obtener TODAS sus facturas
      const todasFacturas: FacturaMikrowisp[] = []
      const clientesProcesados = new Set<string>()
      
      for (let i = 0; i < idsClientesMuestra.length; i++) {
        const idCliente = idsClientesMuestra[i]
        
        try {
          console.log(`👤 Procesando cliente ${i + 1}/${idsClientesMuestra.length}: ${idCliente}`)
          
          const factrasCliente = await this.listarFacturas({
            limit: 5000, // Límite alto por cliente individual
            estado,
            idcliente: idCliente
          })
          
          if (factrasCliente && factrasCliente.facturas && Array.isArray(factrasCliente.facturas)) {
            const facturasFiltradas = factrasCliente.facturas.filter(f => 
              !todasFacturas.some(tf => tf.id === f.id)
            )
            
            todasFacturas.push(...facturasFiltradas)
            clientesProcesados.add(idCliente)
            
            if (facturasFiltradas.length > 0) {
              console.log(`✅ Cliente ${idCliente}: ${facturasFiltradas.length} facturas agregadas`)
            }
          }
          
          // Delay para no sobrecargar la API
          await this.sleep(100)
          
        } catch (error) {
          console.warn(`⚠️ Error procesando cliente ${idCliente}:`, error)
        }
      }
      
      // PASO 3: Intento de carga adicional con límite gradual
      console.log('🔄 PASO 3: Intentando carga adicional con límites graduales...')
      
      const limitesGraduales = [5000, 8000, 10000, 15000]
      
      for (const limite of limitesGraduales) {
        try {
          console.log(`🎯 Probando límite: ${limite}`)
          
          const factrasAdicionales = await this.listarFacturas({
            limit: limite,
            estado
          })
          
          if (factrasAdicionales && factrasAdicionales.facturas) {
            const facturasFiltradas = factrasAdicionales.facturas.filter(f => 
              !todasFacturas.some(tf => tf.id === f.id)
            )
            
            if (facturasFiltradas.length > 0) {
              todasFacturas.push(...facturasFiltradas)
              console.log(`🎉 Límite ${limite}: ${facturasFiltradas.length} facturas adicionales encontradas`)
            } else {
              console.log(`✅ Límite ${limite}: No hay facturas adicionales, carga completa`)
              break
            }
          }
          
          // Delay entre intentos
          await this.sleep(200)
          
        } catch (error) {
          console.warn(`⚠️ Error con límite ${limite}:`, error)
          break // Si falla un límite, no intentar límites más altos
        }
      }
      
      console.log(`🎉 CARGA ROBUSTA COMPLETA: ${todasFacturas.length} facturas cargadas`)
      console.log(`👥 Clientes procesados: ${clientesProcesados.size}`)
      
      return todasFacturas
      
    } catch (error) {
      console.error('❌ Error en carga robusta:', error)
      throw error
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
} 