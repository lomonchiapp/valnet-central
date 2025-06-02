import { BaseModel } from '../baseModel'

export interface PagoUnico extends BaseModel {
  descripcion: string // Descripción del pago
  monto: number // Monto a pagar
  fecha: string // Fecha del pago (ISO string)
  idcuenta: string // ID de la cuenta contable
  idproveedor: string // ID del proveedor
}
