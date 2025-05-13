import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UserItem } from './components/UserItem'
import UsersProvider from './context/users-context'
import { useGlobalState } from '@/context/global/useGlobalState'
import { useAddNewState } from '@/context/global/useAddNewState'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { NewUserForm } from './components/NewUserForm'

export default function Users() {
  const { users } = useGlobalState()
  const { newUser, setNewUser } = useAddNewState()

  return (
    <UsersProvider>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Usuarios</h2>
            <p className='text-muted-foreground'>
              Gestiona tus usuarios y sus roles aquí.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {users.map((user) => (
            <UserItem
              key={user.id}
              user={user}
            />
          ))}
        </div>
        <Dialog open={newUser} onOpenChange={setNewUser}>
          <DialogContent>
            <NewUserForm open={newUser} onOpenChange={setNewUser} />
          </DialogContent>
        </Dialog>
      </Main>
    </UsersProvider>
  )
}
