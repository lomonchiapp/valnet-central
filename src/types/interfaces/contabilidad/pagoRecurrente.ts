import { BaseModel } from '../baseModel'

export enum FrecuenciaPago {
  DIARIO = 'DIARIO',
  SEMANAL = 'SEMANAL',
  MENSUAL = 'MENSUAL',
  ANUAL = 'ANUAL',
}

export enum EstadoPagoRecurrente {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export interface PagoRecurrente extends BaseModel {
  descripcion: string // Descripción del pago recurrente
  monto: number // Monto a pagar
  frecuencia: FrecuenciaPago // Frecuencia del pago
  fechaInicio: string // Fecha de inicio del pago recurrente (ISO string)
  fechaProximoPago: string // Fecha del próximo pago (ISO string)
  fechaFin?: string // Fecha de finalización (opcional)
  estado: EstadoPagoRecurrente // Estado del pago recurrente
  metodoPago?: string // Método de pago (opcional)
  notas?: string // Notas adicionales (opcional)
  idcuenta: string // ID de la cuenta contable
}
