import { BaseModel } from '../baseModel'

export interface NotaArticulo extends BaseModel {
  idarticulo: string
  idusuario: string
  contenido: string
  tipo: 'general' | 'mantenimiento' | 'instalacion' | 'reparacion' | 'otro'
  fecha: Date
}

