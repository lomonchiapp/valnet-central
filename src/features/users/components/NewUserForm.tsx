import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { UserRole } from '@/types/enums'
import { toast } from '@/hooks/use-toast'
import { addUser } from '@/hooks/users/addUser'

interface NewUserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NewUserForm = ({ open, onOpenChange }: NewUserFormProps) => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    role: UserRole.USER, // Asigna un rol por defecto
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // eslint-disable-next-line no-console
      console.log('Nuevo usuario:', user)
      await addUser(user.email, user.password, {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      })
       
      onOpenChange(false)
      toast({
        title: "Usuario agregado",
        description: "El usuario ha sido agregado exitosamente"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al agregar el usuario",
        description: error instanceof Error ? error.message : "Error desconocido"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Usuario</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={user.firstName}
              onChange={(e) => setUser({...user, firstName: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Apellido</Label>
            <Input
              value={user.lastName}
              onChange={(e) => setUser({...user, lastName: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              value={user.phone}
              onChange={(e) => setUser({...user, phone: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={user.email}
              onChange={(e) => setUser({...user, email: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Contraseña</Label>
            <Input
              type="password"
              value={user.password}
              onChange={(e) => setUser({...user, password: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <select
              value={user.role}
              onChange={(e) => setUser({...user, role: e.target.value as UserRole})}
              className="w-full border rounded p-2"
              required
            >
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Agregar Usuario</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
