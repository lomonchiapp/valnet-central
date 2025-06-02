import { BaseModel } from '../baseModel'

export enum TipoMovimiento {
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO',
}

export enum OrigenMovimiento {
  PAGO_RECURRENTE = 'PAGO_RECURRENTE',
  PAGO_UNICO = 'PAGO_UNICO',
  GASTO_MENOR = 'GASTO_MENOR',
  AJUSTE = 'AJUSTE',
  REVERSA_PAGO = 'REVERSA_PAGO',
  INGRESO = 'INGRESO',
}

export interface MovimientoCuenta extends BaseModel {
  idcuenta: string // ID de la cuenta contable
  tipo: TipoMovimiento // Tipo de movimiento (débito o crédito)
  monto: number // Monto del movimiento
  fecha: string // Fecha del movimiento (ISO string)
  descripcion: string // Descripción del movimiento
  origen: OrigenMovimiento // Origen del movimiento
  idOrigen: string // ID del documento que originó el movimiento
  balanceAnterior: number // Balance de la cuenta antes del movimiento
  balanceNuevo: number // Balance de la cuenta después del movimiento
  notas?: string // Notas adicionales
} 