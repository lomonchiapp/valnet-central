import { useState, lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddNewState } from '@/context/global/useAddNewState'
import { Citizen } from '@/types/interfaces/valnet/cliente'
import { newCitizen } from '@/hooks/citizens/newCitizen'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MapPin, HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { toast } from '@/hooks/use-toast'

// Lazy load del mapa para Vite
const MapComponent = lazy(() => import('./MapComponent'))

const SAN_PEDRO_COORDS = {
  lat: 18.4539,
  lng: -69.3053
}

const formatCedula = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 10) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 10)}-${numbers.slice(10)}`
}

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 10)
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`
}

export function NewCitizenForm() {
  const { setNewCitizen } = useAddNewState()
  const [showMap, setShowMap] = useState(false)
  
  const [formData, setFormData] = useState<Partial<Citizen>>({
    firstName: '',
    lastName: '',
    cedula: '',
    email: '',
    phone: '',
    telephone: '',
    address: '',
    city: '',
    isDebtor: false,
    lat: SAN_PEDRO_COORDS.lat,
    lng: SAN_PEDRO_COORDS.lng,
  })


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'cedula') {
      setFormData(prev => ({ ...prev, cedula: formatCedula(value) }))
    } else if (name === 'phone' || name === 'telephone') {
      setFormData(prev => ({ ...prev, [name]: formatPhone(value) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      lat,
      lng
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await newCitizen(formData, false)
      setNewCitizen(false)
      toast({
        title: "Éxito",
        description: "Contribuyente registrado exitosamente"
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error al guardar:", error)
      toast({
        title: "Error",
        description: "Error al guardar el contribuyente",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Nombre
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 ml-2 inline" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ingrese el nombre del contribuyente</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Ej: Juan"
                  required
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cedula">
                  Cédula
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 ml-2 inline" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Formato: 000-0000000-0</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="cedula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  placeholder="000-0000000-0"
                  maxLength={13}
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Teléfono Principal
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 ml-2 inline" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Formato: (809) 000-0000</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(809) 000-0000"
                  maxLength={14}
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">
                  Teléfono Alternativo
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 ml-2 inline" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Formato: (809) 000-0000</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  placeholder="(809) 000-0000"
                  maxLength={14}
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>

              <div className="space-y-2 col-span-full">
                <Label htmlFor="address">Dirección</Label>
                <div className="flex gap-2">
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ej: Calle Principal #123"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMap(true)}
                    className="whitespace-nowrap"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Ubicar en Mapa
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Coordenadas actuales: {formData.lat?.toFixed(4)}, {formData.lng?.toFixed(4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setNewCitizen(false)}
          >
            Cancelar
          </Button>
          <Button type="submit">Guardar Contribuyente</Button>
        </div>
      </motion.form>

      <Dialog open={showMap} onOpenChange={setShowMap}>
        <DialogContent className="max-w-3xl h-[600px]">
          <DialogHeader>
            <DialogTitle>Seleccionar Ubicación</DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-[500px]">
            <Suspense fallback={<div>Cargando mapa...</div>}>
              <MapComponent
                center={[formData.lat ?? 0, formData.lng ?? 0]}
                onLocationSelect={handleMapClick}
                draggable={true}
              />
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
