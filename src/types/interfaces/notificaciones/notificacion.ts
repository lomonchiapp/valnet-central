import { RoleUsuario } from '@/types'
import { BaseModel } from '../baseModel'

export enum TipoNotificacion {
  // Pagos
  PAGO_RECURRENTE = 'PAGO_RECURRENTE',
  PAGO_VENCIDO = 'PAGO_VENCIDO',
  PAGO_PROXIMO = 'PAGO_PROXIMO',

  // Tareas
  TAREA_ASIGNADA = 'TAREA_ASIGNADA',
  TAREA_VENCIDA = 'TAREA_VENCIDA',
  TAREA_COMPLETADA = 'TAREA_COMPLETADA',
  TAREA_COMENTARIO = 'TAREA_COMENTARIO',

  // WallNet
  WALLNET_MENSAJE = 'WALLNET_MENSAJE',
  WALLNET_MENCION = 'WALLNET_MENCION',
  WALLNET_REACCION = 'WALLNET_REACCION',

  // Inventario
  INVENTARIO_STOCK_BAJO = 'INVENTARIO_STOCK_BAJO',
  INVENTARIO_STOCK_CRITICO = 'INVENTARIO_STOCK_CRITICO',
  INVENTARIO_NUEVO_PRODUCTO = 'INVENTARIO_NUEVO_PRODUCTO',

  // Brigadas
  BRIGADA_ASIGNACION = 'BRIGADA_ASIGNACION',
  BRIGADA_COMPLETADA = 'BRIGADA_COMPLETADA',
  BRIGADA_CANCELADA = 'BRIGADA_CANCELADA',

  // Clientes
  CLIENTE_NUEVO = 'CLIENTE_NUEVO',
  CLIENTE_REACTIVACION = 'CLIENTE_REACTIVACION',
  CLIENTE_SUSPENSION = 'CLIENTE_SUSPENSION',

  // Sistema
  SISTEMA_ACTUALIZACION = 'SISTEMA_ACTUALIZACION',
  SISTEMA_MANTENIMIENTO = 'SISTEMA_MANTENIMIENTO',
  SISTEMA_ERROR = 'SISTEMA_ERROR',

  // Ventas
  VENTA_NUEVA = 'VENTA_NUEVA',
  VENTA_CANCELADA = 'VENTA_CANCELADA',
  META_CUMPLIDA = 'META_CUMPLIDA',

  // General
  RECORDATORIO = 'RECORDATORIO',
  MENSAJE_DIRECTO = 'MENSAJE_DIRECTO',
  ANUNCIO = 'ANUNCIO',
}

export enum EstadoNotificacion {
  PENDIENTE = 'PENDIENTE',
  LEIDA = 'LEIDA',
  ARCHIVADA = 'ARCHIVADA',
}

export enum PrioridadNotificacion {
  ALTA = 'ALTA',
  MEDIA = 'MEDIA',
  BAJA = 'BAJA',
  CRITICA = 'CRITICA',
}

export enum CategoriaNotificacion {
  PAGOS = 'PAGOS',
  TAREAS = 'TAREAS',
  WALLNET = 'WALLNET',
  INVENTARIO = 'INVENTARIO',
  BRIGADAS = 'BRIGADAS',
  CLIENTES = 'CLIENTES',
  SISTEMA = 'SISTEMA',
  VENTAS = 'VENTAS',
  GENERAL = 'GENERAL',
}

export interface AccionNotificacion {
  tipo: 'NAVEGACION' | 'MODAL' | 'ACCION_DIRECTA' | 'ENLACE_EXTERNO'
  destino: string // ruta, ID del modal, función, URL
  parametros?: Record<string, string | number | boolean>
  textoBoton?: string
}

export interface MetadatosNotificacion {
  // Campos dinámicos según el tipo
  entidadId?: string // ID de la entidad relacionada (tarea, pago, etc.)
  entidadTipo?: string // tipo de entidad (tarea, pago, producto, etc.)
  usuarioOrigen?: string // usuario que generó la notificación
  fechaVencimiento?: string // fecha límite relevante
  monto?: number // para notificaciones de pagos/ventas
  cantidad?: number // para inventario
  ubicacion?: string // para brigadas
  tags?: string[] // etiquetas adicionales
  datos?: Record<string, string | number | boolean | string[]> // datos adicionales específicos
}

export interface Notificacion extends BaseModel {
  tipo: TipoNotificacion
  categoria: CategoriaNotificacion
  estado: EstadoNotificacion
  prioridad: PrioridadNotificacion

  // Contenido
  titulo: string
  mensaje: string
  descripcion?: string // descripción más detallada

  // Destinatarios
  idUsuarioDestino: string // usuario principal destinatario
  idUsuariosAdicionales?: string[] // usuarios adicionales que pueden ver
  roles?: RoleUsuario[] // roles que pueden ver la notificación

  // Fechas
  fechaNotificacion: string // cuándo se creó
  fechaMostrar?: string // cuándo mostrarla (para programadas)
  fechaExpiracion?: string // cuándo expira
  fechaLeida?: string // cuándo fue leída

  // Metadata y acciones
  metadatos: MetadatosNotificacion
  accion?: AccionNotificacion

  // Control
  leidaPor?: string[] // usuarios que la han leído (para notificaciones grupales)
  silenciada?: boolean // si el usuario la silenció
  fijada?: boolean // si está fijada en la parte superior

  // Agrupación
  grupoId?: string // para agrupar notificaciones relacionadas
  esResumen?: boolean // si es un resumen de múltiples notificaciones
}
