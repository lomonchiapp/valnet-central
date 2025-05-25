import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconTrash, IconReceipt, IconPlug } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSelectedState } from '@/context/global/useSelectedState'
import { Citizen } from '@/types'
import { deleteCitizen } from '@/hooks/citizens/deleteCitizen'
import { AssignServiceForm } from '../../serviceAssignments/components/AssignServiceForm'
import { ViewInvoicesDialog } from './ViewInvoicesDialog'

interface DataTableRowActionsProps {
  row: Row<Citizen>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setSelectedCitizen, setEditMode } = useSelectedState()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showInvoicesDialog, setShowInvoicesDialog] = useState(false)

  const handleDelete = () => {
    deleteCitizen(row.original as unknown as Citizen)
    setShowDeleteDialog(false)
  }
  
  const handleEdit = () => {
    setSelectedCitizen(row.original as unknown as Citizen)
    setEditMode(true)
  }

  const citizen = row.original as unknown as Citizen

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={handleEdit}
          >
            Editar
            <DropdownMenuShortcut>
              <IconEdit size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowAssignDialog(true)}
          >
            Asignar Servicio
            <DropdownMenuShortcut>
              <IconPlug size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowInvoicesDialog(true)}
          >
            Ver Facturas
            <DropdownMenuShortcut>
              <IconReceipt size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className='!text-red-500'
          >
            Eliminar
            <DropdownMenuShortcut>
              <IconTrash size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar al contribuyente{' '}
              <span className="font-semibold">
                {row.original.firstName} {row.original.lastName}
              </span>?
              <br />
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <AssignServiceForm 
            citizen={row.original as unknown as Citizen}
            onClose={() => setShowAssignDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <ViewInvoicesDialog
        open={showInvoicesDialog}
        onOpenChange={setShowInvoicesDialog}
        citizenId={citizen.id}
      />
    </>
  )
}
