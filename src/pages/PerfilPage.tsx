import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Camera, Mail, Phone, MapPin } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { storage } from '@/lib/firebase'
import { db } from '@/lib/firebase'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function PerfilPage() {
  const { user, setUser } = useAuthStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  if (!user) return null

  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      const storageRef = ref(storage, `avatars/${user.id}/${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      // Update user in Firestore
      const userRef = doc(db, 'usuarios', user.id)
      await updateDoc(userRef, {
        avatar: downloadURL,
      })

      // Update local state
      setUser({
        ...user,
        avatar: downloadURL,
      })

      toast({
        title: 'Avatar actualizado',
        description: 'Tu foto de perfil ha sido actualizada exitosamente',
      })
    } catch (error: unknown) {
      console.error('Error al actualizar el avatar:', error)
      toast({
        title: 'Error',
        description: 'Hubo un error al actualizar tu avatar',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='container mx-auto py-8'>
      <div className='grid gap-8'>
        {/* Header */}
        <div className='flex items-center gap-6'>
          <div className='relative'>
            <Avatar className='h-24 w-24'>
              <AvatarImage src={user.avatar} alt={user.nombres} />
              <AvatarFallback className='text-2xl bg-[#F37021] text-white'>
                {getInitials(user.nombres, user.apellidos)}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor='avatar-upload'
              className='absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100'
            >
              <Camera className='h-4 w-4 text-gray-600' />
              <input
                id='avatar-upload'
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleAvatarChange}
                disabled={isLoading}
              />
            </label>
          </div>
          <div>
            <h1 className='text-2xl font-bold'>
              {user.nombres} {user.apellidos}
            </h1>
            <p className='text-gray-500'>{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='general'>Información General</TabsTrigger>
            <TabsTrigger value='security'>Seguridad</TabsTrigger>
            <TabsTrigger value='preferences'>Preferencias</TabsTrigger>
          </TabsList>

          <TabsContent value='general'>
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu información personal y de contacto
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='nombres'>Nombres</Label>
                    <Input id='nombres' defaultValue={user.nombres} />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='apellidos'>Apellidos</Label>
                    <Input id='apellidos' defaultValue={user.apellidos} />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>Correo Electrónico</Label>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-gray-500' />
                    <Input id='email' defaultValue={user.email} disabled />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='telefono'>Teléfono</Label>
                  <div className='flex items-center gap-2'>
                    <Phone className='h-4 w-4 text-gray-500' />
                    <Input id='telefono' defaultValue={user.telefono || ''} />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='direccion'>Dirección</Label>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-gray-500' />
                    <Input id='direccion' defaultValue={user.direccion || ''} />
                  </div>
                </div>

                <div className='flex justify-end'>
                  <Button disabled={isLoading}>
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='security'>
            <Card>
              <CardHeader>
                <CardTitle>Seguridad</CardTitle>
                <CardDescription>
                  Actualiza tu contraseña y configura la seguridad de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-2'>
                  <Label htmlFor='current-password'>Contraseña Actual</Label>
                  <Input id='current-password' type='password' />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='new-password'>Nueva Contraseña</Label>
                  <Input id='new-password' type='password' />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='confirm-password'>
                    Confirmar Nueva Contraseña
                  </Label>
                  <Input id='confirm-password' type='password' />
                </div>

                <div className='flex justify-end'>
                  <Button disabled={isLoading}>
                    {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='preferences'>
            <Card>
              <CardHeader>
                <CardTitle>Preferencias</CardTitle>
                <CardDescription>
                  Configura tus preferencias de notificaciones y privacidad
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Aquí irían las preferencias del usuario */}
                <p className='text-gray-500'>Próximamente...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
