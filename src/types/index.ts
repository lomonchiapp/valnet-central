export * from './interfaces/baseModel'
export * from './interfaces/valnet/cliente'
export * from './interfaces/valnet/usuario'
export * from './interfaces/facturacion/pago'
export * from './interfaces/facturacion/factura'
export * from './interfaces/servicio/planInternet'
export * from './interfaces/almacen/articulo'
export * from './interfaces/almacen/inventario'
export * from './interfaces/ventas/preRegistro'
export * from './interfaces/coordinacion/brigada'
export * from './interfaces/coordinacion/ticket'
export * from './interfaces/almacen/marca'
export * from './interfaces/contabilidad/cuenta'
export * from './interfaces/contabilidad/asientoContable'
export * from './interfaces/contabilidad/pagoUnico'
export * from './interfaces/contabilidad/pagoRecurrente'
export * from './interfaces/compras/ordenCompra'
export * from './interfaces/compras/gastoMenor'

export type { Usuario } from './usuario'

export type {
  Tarea,
  EstadoTarea,
  PrioridadTarea,
  ComentarioTarea,
  ArchivoAdjunto,
  FiltroTareas,
  EstadisticasTareas,
} from './tarea'

// Firebase types
export interface FirebaseUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}
