import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import * as cron from 'node-cron'
import { config } from 'dotenv'
import facturasRouter from './routes/facturas'
import { FileService } from './services/FileService'

// Cargar variables de entorno
config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware de seguridad y optimización
app.use(helmet())
app.use(compression())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`)
  next()
})

// Rutas de la API
app.use('/api/facturas', facturasRouter)

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  })
})

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '🧾 Backend de Facturas ValNet',
    version: '1.0.0',
    status: 'Operacional',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      facturas: {
        pagadas: '/api/facturas/pagadas',
        pendientes: '/api/facturas/pendientes',
        cliente: '/api/facturas/cliente/:id',
        status: '/api/facturas/status',
        sync: '/api/facturas/sync'
      }
    }
  })
})

// Middleware de manejo de errores
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error no manejado:', error)
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    timestamp: new Date().toISOString()
  })
})

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
    timestamp: new Date().toISOString()
  })
})

// Instancia global del servicio de archivos para cron jobs
let fileService: FileService

// Configurar cron job para sincronización automática
const syncInterval = process.env.SYNC_INTERVAL_MINUTES || '30'
console.log(`⏰ Configurando sincronización automática cada ${syncInterval} minutos`)

cron.schedule(`*/${syncInterval} * * * *`, async () => {
  try {
    console.log('🔄 Iniciando sincronización automática programada...')
    
    if (!fileService) {
      fileService = new FileService()
    }
    
    await fileService.forceSyncAll()
    console.log('✅ Sincronización automática completada')
    
  } catch (error) {
    console.error('❌ Error en sincronización automática:', error)
  }
}, {
  scheduled: true,
  timezone: 'America/Mexico_City'
})

// Iniciar el servidor
app.listen(PORT, () => {
  console.log('🚀 =========================================')
  console.log(`🚀 Backend de Facturas ValNet`)
  console.log(`🚀 Puerto: ${PORT}`)
  console.log(`🚀 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🚀 Sincronización: cada ${syncInterval} minutos`)
  console.log(`🚀 Directorio de datos: ${process.env.DATA_DIR || './data'}`)
  console.log('🚀 =========================================')
  
  // Inicializar servicio de archivos al arrancar
  fileService = new FileService()
  
  console.log('✅ Servidor iniciado correctamente')
})

// Manejo graceful de cierre del servidor
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminando servidor...')
  process.exit(0)
})

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
}) 