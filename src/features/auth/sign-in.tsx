import { useState, useEffect } from 'react'
import { database } from '@/firebase'
import { FIREBASE_AUTH } from '@/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [user, navigate, location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      )
      // Actualizar status a 'Online' en Firestore
      const { user } = userCredential
      await updateDoc(doc(database, 'usuarios', user.uid), { status: 'Online' })
      // La redirección se manejará en el useEffect cuando el usuario se actualice
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al iniciar sesión:', error)
      toast({
        variant: 'destructive',
        title: 'Error al iniciar sesión',
        description: 'Credenciales inválidas. Por favor, intente de nuevo.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen max-h-screen w-full flex'>
      {/* Panel izquierdo - Imagen */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className='hidden lg:block w-1/2 relative'
      >
        <div className='absolute inset-0 bg-gradient-to-r from-[#006680]/80 to-[#006680]/80 mix-blend-multiply' />
        <img
          src='/images/bglogin.jpg'
          alt='bglogin'
          className='h-full w-full object-cover'
        />
        <div className='absolute inset-0 flex flex-col justify-center items-center text-white p-12'></div>
      </motion.div>

      {/* Panel derecho - Formulario */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full lg:w-1/2 flex items-center justify-center p-8 bg-white'
      >
        <div className='w-full max-w-md space-y-8'>
          <div className='text-center'>
            <motion.img
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              src='/valdesk-logo.png'
              alt='Logo'
              className='h-16 mx-auto mb-8'
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className='text-gray-500'
            >
              Ingrese sus credenciales para acceder al sistema
            </motion.p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            onSubmit={handleSubmit}
            className='mt-8 space-y-6'
          >
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Correo Valnet
                </label>
                <Input
                  required
                  type='email'
                  placeholder='correo@valnetrd.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='h-12'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Contraseña
                </label>
                <Input
                  required
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='h-12'
                />
              </div>
            </div>

            <Button
              type='submit'
              className='w-full h-12 bg-[#005BAA] hover:bg-[#0c4373] transition-colors'
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='flex items-center space-x-2'
                >
                  <div className='w-5 h-5 border-t-2 border-white rounded-full animate-spin' />
                  <span>Valnetizando...</span>
                </motion.div>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  )
}
