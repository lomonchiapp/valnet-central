import { useState, useEffect } from 'react'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { IconLock, IconLoader2 } from '@tabler/icons-react'
import { RoleUsuario, StatusUsuario, Usuario } from '@/types/interfaces/valnet/usuario'

interface UsuarioFormProps {
  usuario?: Partial<Usuario>
  onSubmit: (usuario: UsuarioFormState) => void
  isLoading?: boolean
  onCancel?: () => void
}

// Estado del formulario, similar a Usuario pero con password opcional
export type UsuarioFormState = Omit<Usuario, 'id'> & {
  password?: string
  confirmPassword?: string
}

export const UsuarioForm = ({ usuario, onSubmit, isLoading, onCancel }: UsuarioFormProps) => {
  const [form, setForm] = useState<UsuarioFormState>({
    nombres: '',
    apellidos: '',
    email: '',
    role: RoleUsuario.VENDEDOR,
    cedula: '',
    status: StatusUsuario.OFFLINE,
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    password: '',
    confirmPassword: '',
    brigadaId: '',
    updatedAt: new Date(),
    createdAt: new Date(),
  })

  useEffect(() => {
    if (usuario) {
      setForm({
        nombres: usuario.nombres || '',
        apellidos: usuario.apellidos || '',
        email: usuario.email || '',
        role: usuario.role || RoleUsuario.VENDEDOR,
        cedula: usuario.cedula || '',
        status: usuario.status || StatusUsuario.OFFLINE,
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || '',
        fechaNacimiento: usuario.fechaNacimiento || '',
        password: '',
        confirmPassword: '',
        brigadaId: usuario.brigadaId || '',
        updatedAt: usuario.updatedAt ? new Date(usuario.updatedAt) : new Date(),
        createdAt: usuario.createdAt ? new Date(usuario.createdAt) : new Date(),
      })
    }
     
  }, [usuario])

  const handleChange = (field: keyof UsuarioFormState, value: string) => {
    setForm({
      ...form,
      [field]: value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Validar contraseñas solo si se está creando o cambiando password
    if (form.password !== undefined && form.password !== form.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Las contraseñas no coinciden',
        description: 'Verifica que ambas contraseñas sean iguales'
      })
      return
    }
    // Validación básica de campos requeridos
    if (!form.nombres || !form.apellidos || !form.email || !form.password || !form.role) {
      toast({
        variant: 'destructive',
        title: 'Campos obligatorios faltantes',
        description: 'Completa todos los campos marcados con *'
      })
      return
    }
    onSubmit(form)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{usuario ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <DialogDescription>
          {usuario ? 'Edita los datos del usuario.' : 'Agregar un nuevo usuario al sistema. Todos los campos marcados con * son obligatorios.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        {/* Información Personal y Rol */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombre *</Label>
              <Input
                id="nombres"
                value={form.nombres}
                onChange={e => handleChange('nombres', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellido *</Label>
              <Input
                id="apellidos"
                value={form.apellidos}
                onChange={e => handleChange('apellidos', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol *</Label>
            <Select
              value={form.role}
              onValueChange={value => handleChange('role', value as RoleUsuario)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(RoleUsuario).map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Otros campos opcionales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cedula">Cédula</Label>
            <Input
              id="cedula"
              value={form.cedula}
              onChange={e => handleChange('cedula', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={form.telefono}
              onChange={e => handleChange('telefono', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="direccion">Dirección</Label>
          <Input
            id="direccion"
            value={form.direccion}
            onChange={e => handleChange('direccion', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
          <Input
            id="fechaNacimiento"
            type="date"
            value={form.fechaNacimiento}
            onChange={e => handleChange('fechaNacimiento', e.target.value)}
          />
        </div>
        {/* Contraseña solo en modo creación o si se quiere cambiar */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña {usuario ? '' : '*'}</Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                value={form.password || ''}
                onChange={e => handleChange('password', e.target.value)}
                required={!usuario}
              />
              <IconLock size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña {usuario ? '' : '*'}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword || ''}
              onChange={e => handleChange('confirmPassword', e.target.value)}
              required={!usuario}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <IconLoader2 size={16} className="mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              usuario ? 'Guardar Cambios' : 'Agregar Usuario'
            )}
          </Button>
        </div>
      </form>
    </>
  )
}

export default UsuarioForm 