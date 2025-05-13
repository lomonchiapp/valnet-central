import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/theme-context'
import { AuthProvider } from './components/auth/AuthProvider'
import { AppRoutes } from './routes'
import { Toaster } from './components/ui/toaster'
import { useEffect } from 'react'
import { useGlobalState } from './context/global/useGlobalState'
import { updateOverdueInvoice } from './hooks/invoices/updateOverdueInvoice'

export default function App() {
  const { subscribeToRecurringInvoices, subscribeToServiceAssignments, 
    subscribeToCitizens, subscribeToServices, subscribeToUsers, subscribeToPayments } = useGlobalState()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await updateOverdueInvoice()
      } catch (error) {
        //eslint-disable-next-line no-console
        console.error('Error updating overdue invoices:', error)
      }
    }

    initializeApp()
    
    const unsubscribeRecurringInvoices = subscribeToRecurringInvoices()
    const unsubscribeServiceAssignments = subscribeToServiceAssignments()
    const unsubscribeCitizens = subscribeToCitizens()
    const unsubscribeServices = subscribeToServices()
    const unsubscribeUsers = subscribeToUsers()
    const unsubscribePayments = subscribeToPayments()

    return () => {
      unsubscribeRecurringInvoices()
      unsubscribeServiceAssignments()
      unsubscribeCitizens()
      unsubscribeServices()
      unsubscribeUsers()
      unsubscribePayments()
    }
  }, [subscribeToRecurringInvoices, subscribeToServiceAssignments, 
    subscribeToCitizens, subscribeToServices, subscribeToUsers, subscribeToPayments])

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
} 