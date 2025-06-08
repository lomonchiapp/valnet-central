import { useState } from 'react'
import { PackageIcon, PlusCircle, ArrowLeft } from 'lucide-react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useCoordinacionState } from '@/context/global/useCoordinacionState'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import CombustiblePanel from './components/CombustiblePanel'
import { InventarioBrigadaDialog } from './components/InventarioBrigadaDialog'
import RegistroCombustibleDialog from './components/RegistroCombustibleDialog'

function RegistroCombustibleForm({
  brigadaId,
  onCancel,
}: {
  brigadaId: string
  onCancel: () => void
}) {
  // TODO: Implementar formulario real
  return (
    <Card className='max-w-xl mx-auto mt-8 shadow-lg'>
      <CardHeader>
        <CardTitle>Registrar carga de combustible</CardTitle>
        <CardDescription>Brigada ID: {brigadaId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='mb-4'>(Aquí va el formulario...)</div>
        <Button variant='outline' onClick={onCancel}>
          Cancelar
        </Button>
      </CardContent>
    </Card>
  )
}

export default function BrigadaDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { brigadas } = useCoordinacionState()
  const brigada = brigadas.find((brigada) => brigada.id === id)
  const [openInventario, setOpenInventario] = useState(false)
  const [openRegistro, setOpenRegistro] = useState(false)

  // Detectar si estamos en la ruta de nuevo registro
  const isNuevo = location.pathname.endsWith('/nuevo')

  if (!brigada) return <div>No se encontró la brigada.</div>

  if (isNuevo) {
    return (
      <RegistroCombustibleForm
        brigadaId={brigada.id}
        onCancel={() => navigate(-1)}
      />
    )
  }

  return (
    <Card className='max-w-4xl w-full mx-auto mt-8 shadow-lg p-2 md:p-6 relative'>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='absolute top-4 left-4 z-10'
              onClick={() => navigate('/coordinacion/brigadas')}
            >
              <ArrowLeft className='w-4 h-4 mr-1' /> Volver
            </Button>
          </TooltipTrigger>
          <TooltipContent>Volver a brigadas</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <CardHeader className='flex flex-row items-center gap-4 justify-between'>
        <div>
          <CardTitle className='text-2xl font-bold'>{brigada.nombre}</CardTitle>
          <CardDescription className='text-sm text-muted-foreground'>
            ID: {brigada.id}
          </CardDescription>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => setOpenInventario(true)}
            title='Ver inventario'
          >
            <PackageIcon className='w-5 h-5 mr-1' /> Inventario
          </Button>
          <Button onClick={() => setOpenRegistro(true)} className='gap-1'>
            <PlusCircle className='w-4 h-4' /> Agregar registro
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <CombustiblePanel brigada={brigada} />
      </CardContent>
      {/* Dialog de Inventario */}
        <InventarioBrigadaDialog
          open={openInventario}
          onOpenChange={setOpenInventario}
          inventarioId={brigada.inventarioId || null}
          brigadaNombre={brigada.nombre || ''}
        />
      {/* Dialog de Registro de Combustible */}
        <RegistroCombustibleDialog
          brigada={brigada}
          open={openRegistro}
          onOpenChange={setOpenRegistro}
          modo='crear'
        />
      {/* Dialog de Registro de Combustible */}
    </Card>
  )
}
