import { User } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useSelectedState } from '@/context/global/useSelectedState'

interface UserItemProps {
  user: User
}

export function UserItem({ user }: UserItemProps) {
    const { setSelectedUser } = useSelectedState()
    const { setEditMode } = useSelectedState()

    const handleEdit = () => {
        setSelectedUser(user)
        setEditMode(true)
    }

  return (
    <Card className="p-4 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
        <Badge variant="outline" className="capitalize">{user.role}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{user.email}</p>
      <p className="text-sm text-muted-foreground">{user.phone}</p>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={handleEdit}>
          <IconEdit size={16} />
        </Button>
        <Button variant="outline" size="sm" className="text-destructive" onClick={() => {}}>
          <IconTrash size={16} />
        </Button>
      </div>
    </Card>
  )
} 