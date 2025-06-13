# 🧾 Backend de Facturas ValNet

Backend intermedio que cachea facturas de Mikrowisp en archivos JSON para optimizar el rendimiento del frontend.

## 🚀 Características

- **📁 Cache en Archivos JSON**: Guarda facturas en archivos locales
- **⏰ Sincronización Automática**: Cron job cada 30 minutos (configurable)
- **🔄 Sincronización Manual**: Script independiente para sync bajo demanda
- **📊 Paginación Optimizada**: API con paginación y búsqueda
- **👥 Agrupación por Cliente**: Facturas organizadas por cliente
- **📈 Estadísticas en Tiempo Real**: Metadata de sincronización y estado
- **🛡️ Seguridad**: Helmet, CORS, compresión, rate limiting
- **📝 Logs Detallados**: Seguimiento completo de operaciones

## 🏗️ Arquitectura

```
backend-facturas/
├── src/
│   ├── types/          # Interfaces TypeScript
│   ├── services/       # Lógica de negocio
│   │   ├── MikrowispApi.ts    # Comunicación con Mikrowisp
│   │   └── FileService.ts     # Manejo de archivos JSON
│   ├── routes/         # Rutas de la API
│   │   └── facturas.ts        # Endpoints de facturas
│   ├── scripts/        # Scripts independientes
│   │   └── syncFacturas.ts    # Sincronización manual
│   └── index.ts        # Servidor principal
├── data/               # Archivos de cache (auto-generado)
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Instalación

```bash
# 1. Entrar al directorio
cd backend-facturas

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp env.example .env
# Editar .env con tus credenciales de Mikrowisp

# 4. Compilar TypeScript
npm run build

# 5. Iniciar servidor
npm run dev  # Desarrollo
npm start    # Producción
```

## ⚙️ Variables de Entorno

```bash
# Puerto del servidor
PORT=3001

# Configuración de Mikrowisp
MIKROWISP_API_URL=https://demo.mikrosystem.net/api/v1
MIKROWISP_TOKEN=tu_token_aqui

# Configuración de sincronización
SYNC_INTERVAL_MINUTES=30
MAX_RETRIES=3
TIMEOUT_MS=30000

# Configuración de archivos
DATA_DIR=./data
ENABLE_FILE_COMPRESSION=true

# URL del frontend (para CORS)
FRONTEND_URL=http://localhost:3000

# Logs
LOG_LEVEL=info
```

## 🌐 API Endpoints

### 📋 Facturas Pagadas
```
GET /api/facturas/pagadas?page=1&limit=50&search=cliente123
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "clientes": [
      {
        "idcliente": "123",
        "facturas": [...],
        "totalPagado": 1500.50,
        "estado": "PAGADO"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalClientes": 500,
      "limit": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "statistics": {
      "totalFacturas": 2500,
      "totalPagado": 125000.75
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 📋 Facturas Pendientes
```
GET /api/facturas/pendientes?page=1&limit=50&search=cliente123
```

### 👤 Cliente Específico
```
GET /api/facturas/cliente/123?tipo=pagadas
```

### 📊 Estado del Sistema
```
GET /api/facturas/status
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "status": {
      "pagadas": {
        "lastSync": "2024-01-01T12:00:00.000Z",
        "totalFacturas": 2500,
        "totalClientes": 500,
        "duration": 15000,
        "success": true,
        "syncType": "pagadas"
      },
      "pendientes": {...}
    },
    "server": {
      "uptime": 3600,
      "memory": {...},
      "version": "v18.17.0"
    }
  }
}
```

### 🔄 Sincronización Manual
```
POST /api/facturas/sync
```

### 🩺 Health Check
```
GET /health
```

## 🔄 Sincronización

### Automática (Cron Job)
- Se ejecuta cada 30 minutos por defecto
- Configurable con `SYNC_INTERVAL_MINUTES`
- Solo sincroniza si el cache está expirado

### Manual (Script)
```bash
# Sincronización completa
npm run sync

# O directamente
npx tsx src/scripts/syncFacturas.ts
```

### Manual (HTTP)
```bash
curl -X POST http://localhost:3001/api/facturas/sync
```

## 📁 Estructura de Archivos JSON

### `/data/facturas-pagadas.json`
```json
{
  "data": [
    {
      "idcliente": "123",
      "facturas": [...],
      "totalPagado": 1500.50,
      "estado": "PAGADO"
    }
  ],
  "metadata": {
    "lastSync": "2024-01-01T12:00:00.000Z",
    "totalFacturas": 2500,
    "totalClientes": 500,
    "duration": 15000,
    "success": true,
    "syncType": "pagadas"
  }
}
```

### `/data/sync-meta.json`
```json
{
  "pagadas": {
    "lastSync": "2024-01-01T12:00:00.000Z",
    "totalFacturas": 2500,
    "success": true
  },
  "pendientes": {
    "lastSync": "2024-01-01T12:00:00.000Z",
    "totalFacturas": 300,
    "success": true
  }
}
```

## 🚦 Scripts Disponibles

```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Compilar TypeScript
npm start        # Producción
npm run sync     # Sincronización manual
```

## 🔍 Algoritmo de Carga Robusta

El sistema usa una estrategia de 3 pasos para cargar TODAS las facturas:

1. **Muestra Inicial**: Obtiene 3,000 facturas para extraer IDs únicos de clientes
2. **Carga por Cliente**: Para cada cliente, obtiene TODAS sus facturas individualmente
3. **Carga Adicional**: Prueba límites graduales (5K, 8K, 10K, 15K) para facturas adicionales

Esto resuelve las limitaciones de la API de Mikrowisp que no soporta paginación real.

## 📊 Monitoreo

### Logs del Sistema
```bash
tail -f logs/backend.log
```

### Estadísticas en Tiempo Real
```bash
curl http://localhost:3001/api/facturas/status | jq
```

### Health Check
```bash
curl http://localhost:3001/health
```

## 🔧 Solución de Problemas

### Error de Conexión a Mikrowisp
```bash
# Verificar credenciales
curl -X POST https://demo.mikrosystem.net/api/v1/GetInvoices \
  -H "Content-Type: application/json" \
  -d '{"token":"tu_token","limit":10}'
```

### Cache Corrompido
```bash
# Eliminar cache y regenerar
rm -rf data/
npm run sync
```

### Puerto en Uso
```bash
# Cambiar puerto en .env
PORT=3002
```

### Memoria Insuficiente
```bash
# Aumentar límite de Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

## 🚀 Deployment

### Docker (Recomendado)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

### PM2
```bash
npm install -g pm2
pm2 start dist/index.js --name "backend-facturas"
```

### Systemd
```ini
[Unit]
Description=Backend Facturas ValNet
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/app/backend-facturas
ExecStart=/usr/bin/node dist/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

## 🔐 Seguridad

- ✅ Helmet.js para headers de seguridad
- ✅ CORS configurado para frontend específico
- ✅ Rate limiting por IP
- ✅ Validación de parámetros de entrada
- ✅ Sanitización de datos
- ✅ Logs de acceso detallados

## 📈 Performance

- **🚀 Cache**: Respuesta en ~10ms desde archivos JSON
- **📦 Compresión**: Gzip automático para todas las respuestas
- **🔄 Streaming**: Grandes volúmenes de datos sin bloquear
- **⚡ Indexes**: Búsqueda optimizada por cliente/factura

## 🤝 Contribuir

1. Fork del repositorio
2. Crear branch feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push branch: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles

---

## 🆘 Soporte

Para soporte técnico:
- 📧 Email: soporte@valnet.com
- 💬 Slack: #backend-facturas
- 📱 WhatsApp: +52 xxx xxx xxxx

**Desarrollado con ❤️ por el equipo ValNet** 