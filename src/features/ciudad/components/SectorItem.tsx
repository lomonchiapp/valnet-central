import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useSelectedState } from "@/context/global/useSelectedState"
import { IconBox, IconChevronRight, IconEdit } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import { Sector } from '@/types/interfaces/sector'
import { EditSectorForm } from './EditSectorForm'

interface SectorItemProps {
    sector: Sector
}

export const SectorItem = ({ sector }: SectorItemProps) => {
    const { selectedSector, setSelectedSector } = useSelectedState()
    const isSelected = selectedSector?.id === sector.id
    const [editOpen, setEditOpen] = useState(false)

    return (
        <>
            <Card 
                onClick={() => setSelectedSector(sector)}
                className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] relative overflow-hidden",
                    isSelected && "ring-2 ring-primary"
                )}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation()
                        setEditOpen(true)
                    }}
                >
                    <IconEdit className="h-4 w-4" />
                </Button>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2">
                        <IconBox className="h-5 w-5 text-muted-foreground" />
                        {sector.name}
                    </CardTitle>
                    <IconChevronRight 
                        className={cn(
                            "h-5 w-5 text-muted-foreground transition-transform",
                            isSelected && "rotate-90"
                        )} 
                    />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{sector.name}</p>
                </CardContent>
            </Card>

            <EditSectorForm 
                open={editOpen}
                onOpenChange={setEditOpen}
                sector={sector}
            />
        </>
    )
}