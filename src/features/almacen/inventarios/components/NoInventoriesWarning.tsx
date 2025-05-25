import { Warehouse } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface NoInventoriesWarningProps {
    onCreateClick: () => void
}

export const NoInventoriesWarning = ({ onCreateClick }: NoInventoriesWarningProps) => (
    <div className="text-center py-10 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
      <Warehouse className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">Aún no tienes inventarios creados</h2>
      <p className="text-md text-gray-600 dark:text-gray-400 max-w-md mb-1">
        Para comenzar a gestionar tus productos, es fundamental crear un <strong>Inventario Principal</strong> (tipo Local).
      </p>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Este inventario centralizará todos tus artículos inicialmente. Luego, podrás crear inventarios específicos para brigadas y otros locales.
      </p>
      <Button onClick={onCreateClick} className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <PlusCircle className="mr-2 h-4 w-4" /> Crear Inventario Principal (Local)
      </Button>
    </div>
  );