import React, { useState, createContext, useContext } from 'react'
import { User } from '../data/schema'

type UsuariosDialogType = 'invitar' | 'agregar' | 'editar' | 'eliminar'

interface UsuariosContextType {
  open: UsuariosDialogType | null
  setOpen: (str: UsuariosDialogType | null) => void
  currentUser: User | null
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const UsuariosContext = createContext<UsuariosContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function UsuariosProvider({ children }: Props) {
  const [open, setOpen] = useState<UsuariosDialogType | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  return (
    <UsuariosContext.Provider value={{ 
      open, 
      setOpen, 
      currentUser, 
      setCurrentUser,
      isLoading,
      setIsLoading
    }}>
      {children}
    </UsuariosContext.Provider>
  )
}

export const useUsuarios = () => {
  const usuariosContext = useContext(UsuariosContext)

  if (!usuariosContext) {
    throw new Error('useUsuarios debe usarse dentro de <UsuariosProvider>')
  }

  return usuariosContext
} 