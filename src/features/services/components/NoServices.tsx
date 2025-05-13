import { IconPackage, IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useAddNewState } from '@/context/global/useAddNewState'

export const NoServices = () => {
  const { setNewService } = useAddNewState()

  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <IconPackage className="h-10 w-10 text-primary" />
        </div>
        
        <h3 className="mt-4 text-lg font-semibold">No hay servicios</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Parece que aún no tienes ningún servicio. ¡Comienza creando uno para gestionar tus servicios!
        </p>

        <Button 
          onClick={() => setNewService(true)}
          className="gap-2"
        >
          <IconPlus size={18} />
          Crear mi primer servicio
        </Button>

        <div className="mt-6 grid gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xs font-medium">1</span>
            </div>
            <span>Crea un servicio para comenzar a facturar</span>
          </div>

              <span className="text-xs font-medium">3</span>
            </div>
            <span>¡Comienza a registrar y gestionar tus servicios!</span>
          </div>
        </div>

  )
}
