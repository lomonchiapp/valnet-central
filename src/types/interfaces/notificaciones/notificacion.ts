import { BaseModel } from '../baseModel'

export enum TipoNotificacion {
  PAGO_RECURRENTE = 'PAGO_RECURRENTE',
  PAGO_VENCIDO = 'PAGO_VENCIDO',
  PAGO_PROXIMO = 'PAGO_PROXIMO',
}

export enum EstadoNotificacion {
  PENDIENTE = 'PENDIENTE',
  LEIDA = 'LEIDA',
  ARCHIVADA = 'ARCHIVADA',
}

export interface Notificacion extends BaseModel {
  tipo: TipoNotificacion
  estado: EstadoNotificacion
  titulo: string
  mensaje: string
  idOrigen: string // ID del pago recurrente
  fechaNotificacion: string // Fecha en que se debe mostrar la notificación
  fechaVencimiento?: string // Fecha de vencimiento del pago
  leidaPor?: string[] // IDs de los usuarios que han leído la notificación
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA'
  accion?: {
    tipo: 'IR_A_PAGO' | 'IR_A_CUENTA'
    id: string
  }
}
