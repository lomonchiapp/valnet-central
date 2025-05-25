import { useState } from 'react'
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IconLoader2, IconMail } from '@tabler/icons-react'
import { useUsuarios } from '../context/usuarios-context'
import { toast } from '@/hooks/use-toast'
import { Textarea } from '@/components/ui/textarea'

export function UsuariosInvitarDialog() {
  const { setOpen, isLoading, setIsLoading } = useUsuarios()
  const [emails, setEmails] = useState('')
  const [role, setRole] = useState('vendedor')
  const [mensaje, setMensaje] = useState('')
  
  const handleInvitar = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación básica
    if (!emails.trim()) {
      toast({
        variant: "destructive",
        title: "Error al enviar invitaciones",
        description: "Ingresa al menos un correo electrónico"
      })
      return
    }
    
    try {
      setIsLoading(true)
      // Simulación de invitación - Reemplazar con lógica real
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsLoading(false)
      setOpen(null)
      toast({
        title: "Invitaciones enviadas",
        description: "Las invitaciones han sido enviadas exitosamente"
      })
    } catch (error) {
      setIsLoading(false)
      toast({
        variant: "destructive",
        title: "Error al enviar invitaciones",
        description: error instanceof Error ? error.message : "Error desconocido"
      })
    }
  }

  return (
    <form onSubmit={handleInvitar}>
      <DialogHeader>
        <DialogTitle>Invitar Usuarios</DialogTitle>
        <DialogDescription>
          Envía invitaciones por correo electrónico para que nuevos usuarios se unan a la plataforma.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="emails">
            Correos electrónicos <span className="text-muted-foreground">(separados por comas)</span>
          </Label>
          <Textarea
            id="emails"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="usuario1@ejemplo.com, usuario2@ejemplo.com"
            className="h-24"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rol para los invitados</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vendedor">Vendedor</SelectItem>
              <SelectItem value="cajero">Cajero</SelectItem>
              <SelectItem value="inventario">Inventario</SelectItem>
              <SelectItem value="soporte">Soporte</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mensaje">Mensaje personalizado (opcional)</Label>
          <Textarea
            id="mensaje"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe un mensaje personalizado para la invitación..."
            className="h-24"
          />
        </div>

        <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground">
          <p>
            Los usuarios invitados recibirán un correo electrónico con un enlace para registrarse.
            El enlace caducará después de 7 días.
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button 
          type="button"
          variant="outline" 
          onClick={() => setOpen(null)}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <IconLoader2 size={16} className="animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <IconMail size={16} />
              Enviar Invitaciones
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
} 