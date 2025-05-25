import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import WallNetFeed from '@/features/valnet/wallNet/WallNetFeed'
import { TicketIcon, HandshakeIcon, AlertCircle } from 'lucide-react'

// Mock data para métricas y tickets recientes
const metrics = [
  { label: 'Tickets Abiertos', value: 12, icon: <TicketIcon className="h-4 w-4 text-muted-foreground" /> },
  { label: 'Tickets Cerrados', value: 34, icon: <HandshakeIcon className="h-4 w-4 text-muted-foreground" /> },
  { label: 'Tickets Urgentes', value: 2, icon: <AlertCircle className="h-4 w-4 text-red-500" /> },
]

const recentTickets = [
  { id: 1, subject: 'Internet lento', status: 'Abierto', date: '2024-06-01', user: 'Juan Pérez' },
  { id: 2, subject: 'Sin servicio', status: 'Cerrado', date: '2024-05-30', user: 'Ana Torres' },
  { id: 3, subject: 'Problema de facturación', status: 'Abierto', date: '2024-05-29', user: 'Carlos Ruiz' },
]

function WallNetDashboardWidget() {
  return (
    <Card className="bg-gradient-to-b from-[#005BAA] to-[#003366]">
      <CardHeader className="flex justify-end items-end mr-2">
        <img src="/wallnet-white.png" alt="WallNet" className="w-28" />
      </CardHeader>
      <CardContent>
        <WallNetFeed maxPosts={5} />
      </CardContent>
    </Card>
  )
}

function SacDashboard() {
  return (
    <div className="space-y-6">
      {/* Métricas rápidas */}
      <div className="grid gap-4 md:grid-cols-7">
        <div className="md:col-span-5 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {metrics.map((m) => (
              <Card key={m.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">{m.label}</CardTitle>
                  {m.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{m.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tickets recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Tickets Recientes</CardTitle>
              <CardDescription>Últimos tickets atendidos o abiertos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTickets.map(ticket => (
                  <div key={ticket.id} className="flex justify-between items-center p-2 border-b">
                    <div>
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">{ticket.user}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold ${ticket.status === 'Abierto' ? 'text-green-600' : 'text-gray-500'}`}>{ticket.status}</span>
                      <p className="text-xs text-muted-foreground">{ticket.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full">Ver todos los tickets</Button>
            </CardFooter>
          </Card>
        </div>
        {/* Feed WallNet en columna derecha */}
        <div className="md:col-span-2">
          <WallNetDashboardWidget />
        </div>
      </div>
    </div>
  )
}

export { SacDashboard, WallNetDashboardWidget }
export default SacDashboard 