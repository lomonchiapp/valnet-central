import { BaseModel } from '../baseModel'

export enum TipoIngreso {
  VENTA_SERVICIO = 'VENTA_SERVICIO',
  VENTA_PRODUCTO = 'VENTA_PRODUCTO',
  INTERES = 'INTERES',
  COMISION = 'COMISION',
  OTRO = 'OTRO',
}

export interface Ingreso extends BaseModel {
  descripcion: string // Descripción del ingreso
  monto: number // Monto del ingreso
  fecha: string // Fecha del ingreso (ISO string)
  idcuenta: string // ID de la cuenta contable donde entra el dinero
  tipo: TipoIngreso // Tipo de ingreso
  referencia?: string // Referencia externa (factura, recibo, etc.)
  notas?: string // Notas adicionales
} 