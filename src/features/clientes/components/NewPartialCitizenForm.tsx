import { useState, lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddNewState } from '@/context/global/useAddNewState'
import { Citizen } from '@/types/interfaces/valnet/cliente'
import { newCitizen } from '@/hooks/citizens/newCitizen'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MapPin, Upload } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { toast } from '@/hooks/use-toast'
import { storage } from '@/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const MapComponent = lazy(() => import('./MapComponent'))

const SAN_PEDRO_COORDS = {
  lat: 18.4539,
  lng: -69.3053
}

export function NewPartialCitizenForm() {
  const { setNewCitizen } = useAddNewState()
  const [showMap, setShowMap] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const [formData, setFormData] = useState<Partial<Citizen>>({
    address: '',
    city: '',
    isDebtor: false,
    lat: SAN_PEDRO_COORDS.lat,
    lng: SAN_PEDRO_COORDS.lng,
    photoUrl: '',
    pendingInfo: true
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      lat,
      lng
    }))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const storageRef = ref(storage, `citizen-photos/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      const photoUrl = await getDownloadURL(storageRef)
      
      setFormData(prev => ({
        ...prev,
        photoUrl
      }))

      toast({
        title: "Foto subida",
        description: "La foto se ha subido correctamente"
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      toast({
        title: "Error",
        description: "Error al subir la foto",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await newCitizen(formData, true)
      setNewCitizen(false)
      toast({
        title: "Éxito",
        description: "Contribuyente registrado parcialmente"
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
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
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label>Foto de la Vivienda</Label>
                <div className="flex items-center gap-4">
                  {formData.photoUrl && (
                    <img 
                      src={formData.photoUrl} 
                      alt="Vivienda" 
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <Label 
                    htmlFor="photo" 
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? "Subiendo..." : "Subir Foto"}
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={isUploading}
                    />
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <div className="flex gap-2">
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ej: Calle Principal #123"
                    required
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
          <Button type="submit" disabled={isUploading}>
            Registrar Contribuyente
          </Button>
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