import { BaseModel } from '../baseModel'
import { Cliente } from '../valnet/cliente'

export enum EstadoFactura {
  PAGADA = 'Pagada',
  NO_PAGADA = 'No Pagada',
  ANULADA = 'Anulada',
}

export interface FacturaMikrowisp {
  id: string
  legal: number
  idcliente: string
  emitido: string
  vencimiento: string
  total: string
  estado: string
  cobrado: string
  impuesto: string
  oxxo_referencia: string
  barcode_cobro_digital: string
  fechapago: string
  subtotal: string
  subtotal2: string
  total2: string
  impuesto2: string
  formapago: string
}

export interface Factura extends FacturaMikrowisp, BaseModel {
  cliente: Cliente
}
