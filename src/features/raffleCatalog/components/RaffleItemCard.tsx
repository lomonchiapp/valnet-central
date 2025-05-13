import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconEdit, IconGift } from "@tabler/icons-react"
import { RaffleItem } from "@/types/interfaces/raffleItem"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface RaffleItemCardProps {
  item: RaffleItem
  onEdit: (item: RaffleItem) => void
}

export const RaffleItemCard = ({ item, onEdit }: RaffleItemCardProps) => {
  return (
    <Card className="group relative overflow-hidden hover:shadow-md transition-all duration-200">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onEdit(item)}
      >
        <IconEdit className="h-4 w-4" />
      </Button>

      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <IconGift className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">{item.name}</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="aspect-video relative rounded-md overflow-hidden mb-4">
          <img 
            src={item.image} 
            alt={item.name}
            className="object-cover w-full h-full"
          />
        </div>

        <p className="text-sm text-muted-foreground mb-4">{item.description}</p>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Valor Estimado</p>
            <p className="text-lg font-bold">{formatCurrency(item.value)}</p>
          </div>

          <div className="space-y-1 text-right">
            <p className="text-sm font-medium">Disponibles</p>
            <Badge variant={item.quantity > 0 ? "default" : "destructive"}>
              {item.quantity} unidades
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 