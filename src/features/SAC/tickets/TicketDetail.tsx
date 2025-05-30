import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useParams } from 'react-router-dom';
import { useCoordinacionState } from '@/context/global/useCoordinacionState';


export default function TicketDetail() {
  const { id } = useParams()
  const { tickets } = useCoordinacionState()
  const ticket = tickets.find(ticket => ticket.id === id)

  if (!ticket) return <div>No se encontró el ticket.</div>;
  return (
    <Card className="max-w-xl mx-auto mt-8 shadow-lg">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="bg-primary/10 text-primary font-bold uppercase">
          {ticket.solicitante?.[0] || '?'}
        </Avatar>
        <div>
          <CardTitle className="text-2xl font-bold">{ticket.asunto}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">ID: {ticket.id}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div><span className="font-medium">Estado:</span> {ticket.estado}</div>
        <div><span className="font-medium">Prioridad:</span> {ticket.prioridad}</div>
        <div><span className="font-medium">Solicitante:</span> {ticket.solicitante}</div>
        <div><span className="font-medium">Fecha:</span> {ticket.fecha ? new Date(ticket.fecha).toLocaleDateString() : ''}</div>
        <div><span className="font-medium">Motivo de cierre:</span> {ticket.motivo_cierre || 'N/A'}</div>
        <div><span className="font-medium">Turno:</span> {ticket.turno}</div>
        <div><span className="font-medium">Departamento:</span> {ticket.dp}</div>
      </CardContent>
    </Card>
  );
} 