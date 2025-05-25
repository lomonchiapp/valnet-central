import { Button } from "@/components/ui/button"
import { LocationMapDialog } from "./location-map-dialog"
import { IconMapPin } from "@tabler/icons-react"
import { useState } from "react"

export function LocationCell({ lat, lng, address }: { lat?: number, lng?: number, address: string }) {
    const [open, setOpen] = useState(false)
  
    if (!lat || !lng) {
      return <span className="text-muted-foreground">Sin ubicación</span>
    }
  
    return (
      <>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-2"
        >
          <IconMapPin size={16} />
          Ver en el mapa
        </Button>
        <LocationMapDialog
          open={open}
          onOpenChange={setOpen}
          lat={lat}
          lng={lng}
          address={address}
        />
      </>
    )
  }