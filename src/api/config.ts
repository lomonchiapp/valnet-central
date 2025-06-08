// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD 
    ? 'http://38.57.232.66:3031' // URL directa en producción
    : '/mikrowisp-api' // Proxy en desarrollo
)
export const API_TOKEN = import.meta.env.VITE_MIKROWISP_TOKEN

// Validación de seguridad
if (!API_TOKEN) {
  console.error('❌ VITE_MIKROWISP_TOKEN no está configurado')
  console.error('🔧 Configura la variable de entorno VITE_MIKROWISP_TOKEN')
}

// API Endpoints
export const ENDPOINTS = {
  FACTURAS: '/api/v1/GetInvoices',
  LISTA_INSTALACIONES: '/api/v1/ListInstall',
  CLIENTE_DETALLES: '/api/v1/GetClientsDetails',
  CLIENTE_TICKETS: '/api/v1/ListTicket',
  NUEVO_PREREGISTRO: '/api/v1/NewPreRegistro',
  NUEVO_TICKET: '/api/v1/NewTicket',
}
