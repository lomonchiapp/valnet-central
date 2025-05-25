import { useEffect, useState } from "react"
import { PlusCircle, PackageIcon, PenIcon, Trash2 } from "lucide-react"
import { useCoordinacionState } from "@/context/global/useCoordinacionState"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { InventarioBrigadaDialog } from "./components/InventarioBrigadaDialog"
import RegistroCombustibleDialog from "./components/RegistroCombustibleDialog"
import { NuevaBrigadaForm, NuevaBrigadaFormValues } from "./components/NuevaBrigadaForm"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import { useCrearBrigada } from "./hooks/useCrearBrigada"
import { useUpdateBrigada } from "./hooks/useUpdateBrigada"
import { useBorrarBrigada } from "./hooks/useBorrarBrigada"
import type { Brigada } from "@/types/interfaces/coordinacion/brigada"

export default function Brigadas() {
  const { subscribeToBrigadas, brigadas } = useCoordinacionState()
  const [openInventario, setOpenInventario] = useState(false)
  const [openRegistro, setOpenRegistro] = useState(false)
  const [selectedBrigada, setSelectedBrigada] = useState<Brigada | null>(null)
  const [openBrigadaDialog, setOpenBrigadaDialog] = useState(false)
  const [editBrigada, setEditBrigada] = useState<Brigada | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [brigadaAEliminar, setBrigadaAEliminar] = useState<Brigada | null>(null)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [deleteMotivo, setDeleteMotivo] = useState("")
  const [deleting, setDeleting] = useState(false)
  const crearBrigada = useCrearBrigada()
  const actualizarBrigada = useUpdateBrigada()
  const borrarBrigada = useBorrarBrigada()

  useEffect(() => {
    const unsubscribe = subscribeToBrigadas()
    return () => unsubscribe()
  }, [subscribeToBrigadas])

  const handleOpenInventario = (brigada: Brigada) => {
    setSelectedBrigada(brigada)
    setOpenInventario(true)
  }
  const handleOpenRegistro = (brigada: Brigada) => {
    setSelectedBrigada(brigada)
    setOpenRegistro(true)
  }
  const handleOpenNuevaBrigada = () => {
    setEditBrigada(null)
    setOpenBrigadaDialog(true)
  }
  const handleOpenEditarBrigada = (brigada: Brigada) => {
    setEditBrigada(brigada)
    setOpenBrigadaDialog(true)
  }
  const handleGuardarBrigada = async (values: NuevaBrigadaFormValues) => {
    if (editBrigada) {
      await actualizarBrigada(editBrigada.id, values)
    } else {
      await crearBrigada(values)
    }
    setOpenBrigadaDialog(false)
  }
  const handleOpenDeleteBrigada = (brigada: Brigada) => {
    setBrigadaAEliminar(brigada)
    setDeleteDialogOpen(true)
  }
  const handleDeleteBrigada = async () => {
    if (brigadaAEliminar && user) {
      setDeleting(true)
      await borrarBrigada({
        brigada: brigadaAEliminar,
        motivo: deleteMotivo,
        usuario: user,
      })
      setDeleting(false)
      setDeleteDialogOpen(false)
      setBrigadaAEliminar(null)
      setDeleteMotivo("")
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestión de Brigadas</h1>
          <p className="text-muted-foreground">Administra brigadas y control de combustible</p>
        </div>
        <Button onClick={handleOpenNuevaBrigada} className="gap-2"><PlusCircle className="w-5 h-5" /> Nueva brigada</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {brigadas.map((brigada) => (
          <div
            key={brigada.id}
            className="border rounded-lg p-4 flex flex-col gap-2 shadow-sm bg-white cursor-pointer group"
            onClick={e => {
              // Evitar navegación si se hace click en un botón de acción
              if ((e.target as HTMLElement).closest('button')) return
              navigate(`/coordinacion/brigadas/${brigada.id}`)
            }}
          >
            <div className="font-bold text-lg flex items-center gap-2">
              {brigada.nombre}
              <button
                className="ml-2 text-primary hover:text-primary/80"
                title="Ver inventario de brigada"
                onClick={e => { e.stopPropagation(); handleOpenInventario(brigada) }}
              >
                <PackageIcon className="w-5 h-5" />
              </button>
              <button
                className="ml-2 text-blue-600 hover:text-blue-800"
                title="Editar brigada"
                onClick={e => { e.stopPropagation(); handleOpenEditarBrigada(brigada) }}
              >
                <PenIcon className="w-4 h-4" />
              </button>
              <button
                className="ml-2 text-red-600 hover:text-red-800"
                title="Eliminar brigada"
                onClick={e => { e.stopPropagation(); handleOpenDeleteBrigada(brigada) }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-muted-foreground">Matrícula: {brigada.matricula}</div>
            <div className="text-xs text-muted-foreground">Kilometraje actual: {brigada.kilometrajeActual ?? 0} km</div>
            <div className="flex gap-2 mt-2">
              <button
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={e => { e.stopPropagation(); handleOpenRegistro(brigada) }}
                title="Registrar carga de combustible"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Dialog de Inventario */}
      <InventarioBrigadaDialog
        open={openInventario}
        onOpenChange={setOpenInventario}
        inventarioId={selectedBrigada?.inventarioId || null}
        brigadaNombre={selectedBrigada?.nombre || ""}
      />
      {/* Dialog de Registro de Combustible */}
      <Dialog open={openRegistro} onOpenChange={setOpenRegistro}>
        {selectedBrigada && (
          <RegistroCombustibleDialog 
            brigada={selectedBrigada} 
            onClose={() => setOpenRegistro(false)}
          />
        )}
      </Dialog>
      {/* Dialog de Nueva/Editar Brigada */}
      <Dialog open={openBrigadaDialog} onOpenChange={setOpenBrigadaDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editBrigada ? 'Editar brigada' : 'Nueva brigada'}</DialogTitle>
            <DialogDescription>
              {editBrigada ? 'Edita los datos de la brigada.' : 'Registra una nueva brigada.'}
            </DialogDescription>
          </DialogHeader>
          <NuevaBrigadaForm
            onSubmit={handleGuardarBrigada}
            onNewInventoryClick={() => {}}
            {...(editBrigada && { defaultValues: editBrigada })}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenBrigadaDialog(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog de eliminar brigada */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar brigada</DialogTitle>
            <DialogDescription>Por favor, indica el motivo de la eliminación. Esta acción quedará registrada.</DialogDescription>
          </DialogHeader>
          <input
            className="w-full border rounded px-2 py-1 mt-2"
            placeholder="Motivo de la eliminación"
            value={deleteMotivo}
            onChange={e => setDeleteMotivo(e.target.value)}
            disabled={deleting}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteBrigada} disabled={!deleteMotivo || deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
