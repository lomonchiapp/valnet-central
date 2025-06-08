// Tipos globales para debugging de Firebase
declare global {
  interface Window {
    getFirebaseStats: () => {
      totalReads: number
      activeListeners: number
      recentOperations: Array<{
        operation: string
        collection: string
        timestamp: number
        docCount: number
      }>
      collectionBreakdown: Record<string, number>
    }
    getFirebaseReadCount: () => number
    resetFirebaseReadCount: () => void
    analyzeFirebaseUsage: () => void
  }
}

export {} 