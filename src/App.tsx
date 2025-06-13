import { useEffect, useRef } from 'react'
import { database } from '@/firebase'
import { AppRoutes } from '@/routes'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { BrowserRouter } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { WallNetGlobalPanel } from '@/features/wallnet/components/WallNetGlobalPanel'
import { ThemeProvider } from './context/theme-context'

function WallNetGlobalNotifier() {
  const { toast } = useToast()
  const { user } = useAuthStore()
  const lastNotified = useRef<{ id: string; createdAt: number } | null>(null)

  useEffect(() => {
    if (!lastNotified.current) {
      const stored = localStorage.getItem('wallnet_last_notified')
      if (stored) {
        try {
          lastNotified.current = JSON.parse(stored)
        } catch {
          /* ignore parse error */
        }
      }
    }
    const q = query(
      collection(database, 'wallNetPosts'),
      orderBy('createdAt', 'desc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
      if (docs.length === 0) return
      const first = docs[0]
      const data = first.data()
      const last = lastNotified.current
      if (
        user &&
        data.userId !== user.id &&
        (!last ||
          (first.id !== last.id && data.createdAt > (last.createdAt || 0)))
      ) {
        toast({
          title: 'Nueva publicación en WallNet',
          description: `${data.userName}: ${data.content?.slice(0, 80)}`,
          duration: 7000,
          variant: 'default',
          action: (
            <ToastAction
              altText='Ver publicación'
              onClick={() => {
                window.location.href = '/valnet/wallnet'
              }}
            >
              Ver
            </ToastAction>
          ),
        })
        lastNotified.current = { id: first.id, createdAt: data.createdAt }
        localStorage.setItem(
          'wallnet_last_notified',
          JSON.stringify({ id: first.id, createdAt: data.createdAt })
        )
      }
    })
    return () => unsubscribe()
  }, [toast, user])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
        <AuthProvider>
          <WallNetGlobalNotifier />
          <WallNetGlobalPanel />
          <AppRoutes />
          <Toaster />
          
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
