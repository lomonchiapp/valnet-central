export interface Usuario {
  id: string
  nombres: string
  apellidos: string
  email: string
  rol: string
  avatar?: string
  telefono?: string
  direccion?: string
  empresa?: string
  cargo?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
} 