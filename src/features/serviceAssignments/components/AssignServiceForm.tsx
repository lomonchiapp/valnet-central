import { useState, useEffect, lazy, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Citizen, Service } from '@/types'
import { ServicePricingType } from '@/types/enums'
import { useGlobalState } from '@/context/global/useGlobalState'
import { assignService } from '@/hooks/services/serviceAssignments/assignService'
import { NumericFormat } from 'react-number-format'
import { PaymentDatePicker } from '@/components/ui/payment-date-picker'
import { ServiceAssignmentStatus } from '@/types/enums'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MapPin, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Suspense } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Sector } from '@/types/interfaces/sector'

type MeasurementUnit = 'meters' | 'inches' | 'feet' | 'centimeters'

interface AssignServiceFormProps {
  citizen: Citizen
  onClose: () => void
}

const CONVERSION_RATES: Record<MeasurementUnit, number> = {
  meters: 1,
  inches: 0.0254,
  feet: 0.3048,
  centimeters: 0.01
}

const SAN_PEDRO_COORDS = {
  lat: 18.4539,
  lng: -69.3053
}

// Lazy load del mapa
const MapComponent = lazy(() => import('@/features/clientes/components/MapComponent'))

export function AssignServiceForm({ citizen, onClose }: AssignServiceFormProps) {
  const { services, sectors } = useGlobalState()
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [monthlyPaymentAmount, setMonthlyPaymentAmount] = useState<number>(0)
  const [paymentDay, setPaymentDay] = useState<number>(1)
  const [serviceYears, setServiceYears] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [isCreatingInvoices, setIsCreatingInvoices] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [location, setLocation] = useState({
    lat: SAN_PEDRO_COORDS.lat,
    lng: SAN_PEDRO_COORDS.lng
  })
  const [address, setAddress] = useState("")
  const [openSector, setOpenSector] = useState(false)
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null)

  const convertToMeters = useCallback((value: number) => {
    const unit = (selectedService?.unit || 'meters') as MeasurementUnit
    return value * CONVERSION_RATES[unit]
  }, [selectedService?.unit])

  const calculateArea = useCallback(() => {
    const widthInMeters = convertToMeters(dimensions.width)
    const heightInMeters = convertToMeters(dimensions.height)
    return widthInMeters * heightInMeters
  }, [dimensions.width, dimensions.height, convertToMeters])


  useEffect(() => {
    if (selectedService?.pricingType === ServicePricingType.CALCULATED && selectedService.basePrice) {
      const area = calculateArea()
      const calculatedAmount = area * selectedService.basePrice
      setMonthlyPaymentAmount(calculatedAmount)
    } else if (selectedService?.basePrice) {
      setMonthlyPaymentAmount(selectedService.basePrice)
    }
  }, [selectedService?.pricingType, selectedService?.basePrice, calculateArea])



 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setIsCreatingInvoices(true)

    try {
      const paymentNumbers = serviceYears * 12

      await assignService({
        id: '',
        citizenId: citizen.id,
        citizenCode: citizen.citizenCode,
        serviceId: selectedService?.id || '',
        dimensions,
        monthlyPaymentAmount,
        paymentDay,
        paymentNumbers,
        startDate: new Date(),
        status: ServiceAssignmentStatus.PENDING,
        description: selectedService?.name
      })

      onClose()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      setLoading(false)
      setIsCreatingInvoices(false)
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    setLocation({ lat, lng })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DialogHeader>
        <DialogTitle>Asignar Servicio</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Servicio</Label>
          <Select
            onValueChange={(value) => 
              setSelectedService(services.find(s => s.id === value) ?? null)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar servicio" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedService?.pricingType === ServicePricingType.CALCULATED && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Dimensiones</Label>
                <div className="grid grid-cols-2 gap-2">
                  <NumericFormat
                    customInput={Input}
                    value={dimensions.width}
                    onValueChange={(values) => 
                      setDimensions(prev => ({...prev, width: values.floatValue || 0}))
                    }
                    placeholder="Ancho"
                    decimalScale={2}
                    required
                  />
                  <NumericFormat
                    customInput={Input}
                    value={dimensions.height}
                    onValueChange={(values) => 
                      setDimensions(prev => ({...prev, height: values.floatValue || 0}))
                    }
                    placeholder="Alto"
                    decimalScale={2}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Unidad</Label>
                <Select value={selectedService?.unit || 'meters'} onValueChange={(value) => {
                  setSelectedService(prev => prev && { ...prev, unit: value as MeasurementUnit })
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meters">Metros</SelectItem>
                    <SelectItem value="feet">Pies</SelectItem>
                    <SelectItem value="inches">Pulgadas</SelectItem>
                    <SelectItem value="centimeters">Centímetros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Precio por {selectedService.unit === 'meters' ? 'metro' : 
                           selectedService.unit === 'feet' ? 'pie' : 
                           selectedService.unit === 'inches' ? 'pulgada' : 'centímetro'} 
                cuadrado (RD$)
              </Label>
              <NumericFormat
                customInput={Input}
                value={selectedService.basePrice}
                onValueChange={(values) => 
                  setSelectedService(prev => prev && { 
                    ...prev, 
                    basePrice: values.floatValue || 0 
                  })
                }
                thousandSeparator={true}
                prefix="RD$ "
                decimalScale={2}
                required
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label>
            {selectedService?.pricingType === ServicePricingType.CALCULATED 
              ? "Monto Mensual Calculado" 
              : "Monto Mensual"} (RD$)
          </Label>
          <NumericFormat
            customInput={Input}
            value={monthlyPaymentAmount}
            onValueChange={(values) => setMonthlyPaymentAmount(values.floatValue || 0)}
            thousandSeparator={true}
            prefix="RD$ "
            decimalScale={2}
            required
            disabled={selectedService?.pricingType === ServicePricingType.CALCULATED}
          />
        </div>

        <PaymentDatePicker
          selectedDay={paymentDay}
          onChange={setPaymentDay}
        />

        <div className="grid gap-2">
          <Label>Duración del Servicio (Años)</Label>
          <Input
            type="number"
            min={1}
            value={serviceYears}
            onChange={(e) => setServiceYears(Number(e.target.value))}
            required
          />
          <p className="text-sm text-muted-foreground">
            Se generarán {serviceYears * 12} facturas
          </p>
        </div>

        <div className="space-y-2">
          <Label>Descripción</Label>
          <Input
            value={selectedService?.name}
            onChange={(e) => {
              setSelectedService(prev => prev && { ...prev, name: e.target.value })
            }}
            placeholder="Ej: Letrero principal"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Sector</Label>
          <Popover open={openSector} onOpenChange={setOpenSector}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openSector}
                className="w-full justify-between"
              >
                {selectedSector ? selectedSector.name : "Seleccionar sector..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar sector..." />
                <CommandEmpty>No se encontraron sectores.</CommandEmpty>
                <CommandGroup>
                  {sectors.map((sector) => (
                    <CommandItem
                      key={sector.id}
                      onSelect={() => {
                        setSelectedSector(sector)
                        setOpenSector(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedSector?.id === sector.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {sector.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Dirección</Label>
          <div className="flex gap-2">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
            Coordenadas actuales: {location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {isCreatingInvoices 
            ? `Creando facturas... (0/${serviceYears * 12})` 
            : loading 
              ? "Asignando servicio..." 
              : "Asignar Servicio"
          }
        </Button>
      </DialogFooter>

      <Dialog open={showMap} onOpenChange={setShowMap}>
        <DialogContent className="max-w-3xl h-[600px]">
          <DialogHeader>
            <DialogTitle>Seleccionar Ubicación</DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-[500px]">
            <Suspense fallback={<div>Cargando mapa...</div>}>
              <MapComponent
                center={[location.lat, location.lng]}
                onLocationSelect={handleMapClick}
                draggable={true}
              />
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  )
} 