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

export enum MetodoPago {
  TRANSFERENCIA = 'TRANSFERENCIA',
  EFECTIVO = 'EFECTIVO',
  CHEQUE = 'CHEQUE',
  TARJETA = 'TARJETA',
}

export enum TipoMonto {
  FIJO = 'FIJO',
  VARIABLE = 'VARIABLE', // por ejemplo la factura de la luz...
}

export interface PagoRecurrente extends BaseModel {
  idcuenta: string // ID de la cuenta contable
  idproveedor: string // ID del proveedor
  descripcion: string // Descripción del pago recurrente
  tipoMonto: TipoMonto // Tipo de monto
  monto: number // Monto a pagar
  fechaInicio: string // Fecha de inicio del pago recurrente (ISO string)
  frecuencia: FrecuenciaPago // Frecuencia del pago
  fechaProximoPago: string // Fecha del próximo pago (ISO string)
  fechaFin?: string // Fecha de finalización (opcional)
  estado: EstadoPagoRecurrente // Estado del pago recurrente
  metodoPago?: string // Método de pago (opcional)
  notas?: string // Notas adicionales (opcional)
  ultimoMonto?: number // Último monto pagado (para pagos variables)
  ultimaFechaPago?: string // Última fecha de pago (ISO string)
}
