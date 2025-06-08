import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface FirebaseStats {
  totalReads: number
  activeListeners: number
  collectionBreakdown: Record<string, number>
}

export function FirebaseMonitor() {
  const [stats, setStats] = useState<FirebaseStats>({
    totalReads: 0,
    activeListeners: 0,
    collectionBreakdown: {}
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!import.meta.env.DEV) return

    const updateStats = () => {
      if (window.getFirebaseStats) {
        const currentStats = window.getFirebaseStats()
        setStats({
          totalReads: currentStats.totalReads,
          activeListeners: currentStats.activeListeners,
          collectionBreakdown: currentStats.collectionBreakdown
        })
      }
    }

    // Actualizar cada 2 segundos
    updateStats()
    const interval = setInterval(updateStats, 2000)

    return () => clearInterval(interval)
  }, [])

  // Mostrar automáticamente si hay muchas lecturas
  useEffect(() => {
    if (stats.totalReads > 50) {
      setIsVisible(true)
    }
  }, [stats.totalReads])

  if (!import.meta.env.DEV) return null

  return (
    <>
      {/* Botón flotante para mostrar/ocultar */}
      {!isVisible && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setIsVisible(true)}
            size="sm"
            variant="outline"
            className={`${
              stats.totalReads > 100 ? 'animate-pulse bg-red-100 border-red-400' : ''
            }`}
          >
            🔥 {stats.totalReads} reads
          </Button>
        </div>
      )}

      {/* Panel de estadísticas */}
      {isVisible && (
        <div className="fixed bottom-4 right-4 z-50 w-80">
          <Card className="border-orange-200 bg-orange-50 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-orange-800 text-sm flex items-center gap-2">
                  🔥 Firebase Monitor
                  <Badge variant="outline" className="text-xs">DEV</Badge>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="h-6 w-6 p-0"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 text-xs">
              {/* Métricas principales */}
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    stats.totalReads > 1000 ? 'text-red-600' : 
                    stats.totalReads > 100 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {stats.totalReads}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Reads</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    stats.activeListeners > 10 ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {stats.activeListeners}
                  </div>
                  <div className="text-xs text-muted-foreground">Listeners</div>
                </div>
              </div>

              {/* Breakdown por colección */}
              {Object.keys(stats.collectionBreakdown).length > 0 && (
                <div>
                  <div className="font-medium text-xs mb-1">Top Collections:</div>
                  <div className="space-y-1">
                    {Object.entries(stats.collectionBreakdown)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([collection, count]) => (
                        <div key={collection} className="flex justify-between items-center">
                          <span className="truncate">{collection}</span>
                          <Badge 
                            variant={count > 50 ? "destructive" : count > 20 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {count}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-1 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs flex-1"
                  onClick={() => {
                    console.group('🔍 Firebase Analysis')
                    window.analyzeFirebaseUsage()
                    console.groupEnd()
                  }}
                >
                  Analyze
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs flex-1"
                  onClick={() => {
                    window.resetFirebaseReadCount()
                    setStats(prev => ({ ...prev, totalReads: 0, collectionBreakdown: {} }))
                  }}
                >
                  Reset
                </Button>
              </div>

              {/* Alerta si hay lecturas excesivas */}
              {stats.totalReads > 500 && (
                <div className="bg-red-100 border border-red-400 rounded p-2 text-red-800">
                  <div className="font-bold text-xs">⚠️ High Read Count!</div>
                  <div className="text-xs">Check console for analysis</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
} 