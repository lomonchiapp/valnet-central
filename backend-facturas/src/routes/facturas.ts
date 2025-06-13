import { Router, Request, Response } from 'express'
import { FileService } from '../services/FileService'

const router = Router()
const fileService = new FileService()

// GET /api/facturas/pagadas
router.get('/pagadas', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const search = req.query.search as string || ''

    console.log(`📄 GET /pagadas - Página: ${page}, Límite: ${limit}, Búsqueda: "${search}"`)

    const clientesAgrupados = await fileService.getFacturasPagadas()
    
    // Filtrar por búsqueda si se proporciona
    let clientesFiltrados = clientesAgrupados
    if (search.trim()) {
      clientesFiltrados = clientesAgrupados.filter(cliente => 
        cliente.idcliente.toLowerCase().includes(search.toLowerCase()) ||
        cliente.facturas.some(f => 
          f.id.includes(search) || 
          f.legal.toString().includes(search)
        )
      )
    }

    // Paginación
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const clientesPaginados = clientesFiltrados.slice(startIndex, endIndex)

    // Calcular estadísticas
    const totalFacturas = clientesFiltrados.reduce((sum, cliente) => sum + cliente.facturas.length, 0)
    const totalPagado = clientesFiltrados.reduce((sum, cliente) => sum + cliente.totalPagado, 0)

    res.json({
      success: true,
      data: {
        clientes: clientesPaginados,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(clientesFiltrados.length / limit),
          totalClientes: clientesFiltrados.length,
          limit,
          hasNextPage: endIndex < clientesFiltrados.length,
          hasPrevPage: page > 1
        },
        statistics: {
          totalFacturas,
          totalPagado: Math.round(totalPagado * 100) / 100
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error en GET /pagadas:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      timestamp: new Date().toISOString()
    })
  }
})

// GET /api/facturas/pendientes
router.get('/pendientes', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const search = req.query.search as string || ''

    console.log(`📄 GET /pendientes - Página: ${page}, Límite: ${limit}, Búsqueda: "${search}"`)

    const clientesAgrupados = await fileService.getFacturasPendientes()
    
    let clientesFiltrados = clientesAgrupados
    if (search.trim()) {
      clientesFiltrados = clientesAgrupados.filter(cliente => 
        cliente.idcliente.toLowerCase().includes(search.toLowerCase()) ||
        cliente.facturas.some(f => 
          f.id.includes(search) || 
          f.legal.toString().includes(search)
        )
      )
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const clientesPaginados = clientesFiltrados.slice(startIndex, endIndex)

    const totalFacturas = clientesFiltrados.reduce((sum, cliente) => sum + cliente.facturas.length, 0)
    const totalPendiente = clientesFiltrados.reduce((sum, cliente) => sum + cliente.totalPagado, 0)

    res.json({
      success: true,
      data: {
        clientes: clientesPaginados,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(clientesFiltrados.length / limit),
          totalClientes: clientesFiltrados.length,
          limit,
          hasNextPage: endIndex < clientesFiltrados.length,
          hasPrevPage: page > 1
        },
        statistics: {
          totalFacturas,
          totalPendiente: Math.round(totalPendiente * 100) / 100
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error en GET /pendientes:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      timestamp: new Date().toISOString()
    })
  }
})

// GET /api/facturas/cliente/:id
router.get('/cliente/:id', async (req: Request, res: Response) => {
  try {
    const clienteId = req.params.id
    const tipo = req.query.tipo as string || 'pagadas' // 'pagadas' | 'pendientes'

    console.log(`👤 GET /cliente/${clienteId} - Tipo: ${tipo}`)

    const clientesAgrupados = tipo === 'pendientes' 
      ? await fileService.getFacturasPendientes()
      : await fileService.getFacturasPagadas()

    const cliente = clientesAgrupados.find(c => c.idcliente === clienteId)

    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: `Cliente ${clienteId} no encontrado`,
        timestamp: new Date().toISOString()
      })
    }

    res.json({
      success: true,
      data: cliente,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error en GET /cliente:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      timestamp: new Date().toISOString()
    })
  }
})

// GET /api/facturas/status
router.get('/status', async (req: Request, res: Response) => {
  try {
    console.log('📊 GET /status')
    
    const status = await fileService.getSyncStatus()
    
    res.json({
      success: true,
      data: {
        status,
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.version
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error en GET /status:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      timestamp: new Date().toISOString()
    })
  }
})

// POST /api/facturas/sync
router.post('/sync', async (req: Request, res: Response) => {
  try {
    console.log('🔄 POST /sync - Iniciando sincronización manual')
    
    // Ejecutar sincronización en background
    fileService.forceSyncAll().catch(error => {
      console.error('❌ Error en sincronización background:', error)
    })
    
    res.json({
      success: true,
      message: 'Sincronización iniciada en background',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error en POST /sync:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      timestamp: new Date().toISOString()
    })
  }
})

export default router 