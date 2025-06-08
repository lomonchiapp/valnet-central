// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const database = getFirestore(app)
export const storage = getStorage(app)
export const FIREBASE_APP = initializeApp(firebaseConfig)
export const FIREBASE_AUTH = getAuth(FIREBASE_APP)

// ========================================================================================
// FIREBASE READS MONITOR - SOLO DESARROLLO (Simplified)
// ========================================================================================

if (import.meta.env.DEV) {
  let readCount = 0
  let listenerCount = 0
  let lastLogTime = Date.now()
  const readOperations: Array<{
    operation: string
    collection: string
    timestamp: number
    docCount: number
  }> = []

  // Logger para operaciones de Firebase
  const logFirebaseOperation = (operation: string, collection: string, docCount: number = 1) => {
    readCount += docCount
    const now = Date.now()
    
    // Guardar operación para análisis
    readOperations.push({
      operation,
      collection,
      timestamp: now,
      docCount
    })

    // Mantener solo las últimas 100 operaciones
    if (readOperations.length > 100) {
      readOperations.shift()
    }

    // Log cada 20 lecturas o cada 5 segundos
    if (readCount % 20 === 0 || now - lastLogTime > 5000) {
      console.group(`🔥 Firebase Reads Monitor`)
      console.warn(`📊 Total reads: ${readCount} | Active listeners: ${listenerCount}`)
      console.info(`📍 Last operation: ${operation} on "${collection}" (${docCount} docs)`)
      
      // Mostrar colecciones más consultadas recientemente
      const recentOps = readOperations.filter(op => now - op.timestamp < 30000)
      const collectionCounts = recentOps.reduce((acc, op) => {
        acc[op.collection] = (acc[op.collection] || 0) + op.docCount
        return acc
      }, {} as Record<string, number>)
      
      if (Object.keys(collectionCounts).length > 0) {
        console.table(collectionCounts)
      }
      console.groupEnd()
      lastLogTime = now
    }
  }

  // ===== INTERCEPTAR FETCH SOLAMENTE =====
  // Enfoque más simple que funciona de manera confiable
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    const [url] = args
    if (typeof url === 'string' && url.includes('firestore.googleapis.com')) {
      try {
        const urlObj = new URL(url)
        const pathSegments = urlObj.pathname.split('/').filter(Boolean)
        
        // Extraer colección del path
        let collection = 'unknown'
        if (pathSegments.length >= 6) {
          collection = pathSegments[5] // documents/projects/{projectId}/databases/(default)/documents/{collection}
        }
        
        const result = await originalFetch.apply(window, args)
        
        // Si es una query/listen request
        if (url.includes(':listen') || url.includes(':batchGet')) {
          console.log(`🎯 Firebase Listener/Query to: ${collection}`)
          listenerCount++
          logFirebaseOperation('LISTEN', collection, 1)
        } else if (url.includes(':runQuery')) {
          console.log(`🔍 Firebase Query to: ${collection}`)
          logFirebaseOperation('QUERY', collection, 1)
        } else {
          console.log(`📡 Firebase API call to: ${collection}`)
          logFirebaseOperation('API_CALL', collection, 1)
        }
        
        return result
      } catch (error) {
        console.error('Error intercepting Firebase call:', error)
        return originalFetch.apply(window, args)
      }
    }
    
    return originalFetch.apply(window, args)
  }

  // ===== DETECTAR WEBSOCKETS DE FIRESTORE =====
  // Guardamos referencia al WebSocket original para evitar warning
  const OriginalWebSocket = window.WebSocket
  window.WebSocket = class extends WebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      super(url, protocols)
      
      if (url.toString().includes('firestore.googleapis.com')) {
        console.log('🌐 Firestore WebSocket connection established')
        
        // Interceptar mensajes
        this.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data && data.targetChange) {
              console.log('📡 Firestore WebSocket message received')
              logFirebaseOperation('WEBSOCKET', 'realtime', 1)
            }
          } catch {
            // Ignorar errores de parsing
          }
        })
      }
    }
    
    // Mantener compatibilidad con WebSocket original
    static get CONNECTING() { return OriginalWebSocket.CONNECTING }
    static get OPEN() { return OriginalWebSocket.OPEN }
    static get CLOSING() { return OriginalWebSocket.CLOSING }
    static get CLOSED() { return OriginalWebSocket.CLOSED }
  }

  // Funciones globales para debugging
  window.getFirebaseStats = () => {
    const recentOps = readOperations.slice(-20)
    const stats = {
      totalReads: readCount,
      activeListeners: listenerCount,
      recentOperations: recentOps,
      collectionBreakdown: readOperations.reduce((acc, op) => {
        acc[op.collection] = (acc[op.collection] || 0) + op.docCount
        return acc
      }, {} as Record<string, number>)
    }
    
    console.group('📊 Firebase Complete Stats')
    console.log('Total reads:', stats.totalReads)
    console.log('Estimated active listeners:', stats.activeListeners)
    console.log('Collection breakdown:', stats.collectionBreakdown)
    console.log('Recent operations:', stats.recentOperations)
    console.groupEnd()
    
    return stats
  }

  window.getFirebaseReadCount = () => readCount

  window.resetFirebaseReadCount = () => {
    readCount = 0
    readOperations.length = 0
    console.log('🔄 Firebase read counter reset')
  }

  window.analyzeFirebaseUsage = () => {
    console.group('🔍 Firebase Usage Analysis')
    
    const suspiciousPatterns = []
    const now = Date.now()
    
    // Detectar lecturas excesivas en corto tiempo
    const recentOps = readOperations.filter(op => now - op.timestamp < 10000)
    if (recentOps.length > 30) {
      suspiciousPatterns.push(`High frequency reads: ${recentOps.length} in last 10 seconds`)
    }
    
    // Detectar misma colección consultada repetidamente
    const collectionFreq = recentOps.reduce((acc, op) => {
      acc[op.collection] = (acc[op.collection] || 0) + op.docCount
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(collectionFreq).forEach(([collection, count]) => {
      if (count > 20) {
        suspiciousPatterns.push(`"${collection}" read ${count} times recently`)
      }
    })
    
    // Mostrar resultados
    if (suspiciousPatterns.length > 0) {
      console.warn('🚨 Suspicious patterns detected:')
      suspiciousPatterns.forEach(pattern => console.warn(`  - ${pattern}`))
    } else {
      console.log('✅ No suspicious patterns detected')
    }
    
    console.log('\n📈 Recent usage breakdown by collection:')
    console.table(collectionFreq)
    
    console.groupEnd()
  }

  // Auto-análisis cada 30 segundos si hay lecturas excesivas
  setInterval(() => {
    if (readCount > 50) {
      window.analyzeFirebaseUsage()
    }
  }, 30000)

  // Log inicial
  console.log('🔥 Firebase Development Monitor enabled (Simplified)')
  console.log('Monitoring: HTTP requests and WebSocket connections')
  console.log('Available commands:')
  console.log('  - getFirebaseStats(): Get complete statistics')
  console.log('  - getFirebaseReadCount(): Get total read count')
  console.log('  - resetFirebaseReadCount(): Reset counters')
  console.log('  - analyzeFirebaseUsage(): Analyze for suspicious patterns')
}
