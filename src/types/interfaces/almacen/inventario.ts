import { BaseModel } from '../baseModel'

export enum TipoInventario {
  LOCAL = 'Local',
  BRIGADA = 'Brigada',
}

export interface Inventario extends BaseModel {
  nombre: string
  descripcion: string
  tipo: TipoInventario
  principal: boolean
}
