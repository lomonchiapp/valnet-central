import { BaseModel } from '../baseModel'

export interface Proveedor extends BaseModel {
  nombre: string
  direccion: string
  telefono: string
  email: string
  contacto: string
}
