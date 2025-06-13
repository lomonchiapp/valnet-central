#!/usr/bin/env node

import { config } from 'dotenv'
import { FileService } from '../services/FileService'

// Cargar variables de entorno
config()

async function main() {
  console.log('🚀 ==========================================')
  console.log('🚀 Script de Sincronización de Facturas')
  console.log('🚀 ==========================================')
  
  const fileService = new FileService()
  
  try {
    const startTime = Date.now()
    
    console.log('⏰ Iniciando sincronización completa...')
    
    // Ejecutar sincronización de ambos tipos
    await fileService.forceSyncAll()
    
    const duration = Date.now() - startTime
    
    console.log('✅ ==========================================')
    console.log(`✅ Sincronización completada en ${duration}ms`)
    console.log('✅ ==========================================')
    
    // Mostrar estadísticas finales
    const status = await fileService.getSyncStatus()
    
    console.log('\n📊 ESTADÍSTICAS FINALES:')
    console.log('─────────────────────────────────────────')
    
    if (status.pagadas) {
      console.log(`📋 FACTURAS PAGADAS:`)
      console.log(`   - Total facturas: ${status.pagadas.totalFacturas}`)
      console.log(`   - Total clientes: ${status.pagadas.totalClientes}`)
      console.log(`   - Última sync: ${status.pagadas.lastSync}`)
      console.log(`   - Duración: ${status.pagadas.duration}ms`)
      console.log(`   - Estado: ${status.pagadas.success ? '✅ OK' : '❌ ERROR'}`)
      if (status.pagadas.error) {
        console.log(`   - Error: ${status.pagadas.error}`)
      }
    }
    
    if (status.pendientes) {
      console.log(`📋 FACTURAS PENDIENTES:`)
      console.log(`   - Total facturas: ${status.pendientes.totalFacturas}`)
      console.log(`   - Total clientes: ${status.pendientes.totalClientes}`)
      console.log(`   - Última sync: ${status.pendientes.lastSync}`)
      console.log(`   - Duración: ${status.pendientes.duration}ms`)
      console.log(`   - Estado: ${status.pendientes.success ? '✅ OK' : '❌ ERROR'}`)
      if (status.pendientes.error) {
        console.log(`   - Error: ${status.pendientes.error}`)
      }
    }
    
    console.log('\n🎉 Sincronización completada exitosamente!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ ==========================================')
    console.error('❌ Error durante la sincronización:', error)
    console.error('❌ ==========================================')
    
    if (error instanceof Error) {
      console.error(`❌ Mensaje: ${error.message}`)
      console.error(`❌ Stack: ${error.stack}`)
    }
    
    process.exit(1)
  }
}

// Manejo de señales para terminar gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Sincronización interrumpida por el usuario')
  process.exit(1)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Sincronización terminada')
  process.exit(1)
})

// Ejecutar script
if (require.main === module) {
  main()
} 