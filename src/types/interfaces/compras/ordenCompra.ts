import { BaseModel } from '../baseModel'

export enum EstadoOrdenCompra {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  PAGADA = 'PAGADA',
}

export interface ItemOrdenCompra {
  descripcion: string
  cantidad: number
  precioUnitario: number
}

export interface OrdenCompra extends BaseModel {
  proveedorId: string
  fecha: Date
  items: ItemOrdenCompra[]
  total: number
  estado: EstadoOrdenCompra
}
