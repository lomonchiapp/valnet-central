import { Timestamp } from 'firebase/firestore'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: 'admin' | 'vendedor' | 'soporte' | 'brigada'
  estado: 'activo' | 'inactivo'
  ultimoAcceso: Timestamp
  fechaCreacion: Timestamp
}

export interface Inventario {
  id: string
  nombre: string
  descripcion: string
  stock: number
  threshold: number
  categoria: string
  precio: number
  proveedor: string
  ultimaActualizacion: Timestamp
}

export interface Ticket {
  id: string
  titulo: string
  descripcion: string
  estado: 'abierto' | 'en_proceso' | 'cerrado'
  prioridad: 'baja' | 'media' | 'alta' | 'urgente'
  cliente: {
    id: string
    nombre: string
    email: string
  }
  asignadoA?: string
  fechaCreacion: Timestamp
  ultimaActualizacion: Timestamp
}

export interface Brigada {
  id: string
  nombre: string
  miembros: {
    id: string
    nombre: string
    rol: string
  }[]
  estado: 'activo' | 'inactivo' | 'descanso'
  tareas: {
    id: string
    descripcion: string
    estado: 'pendiente' | 'en_proceso' | 'completada'
    fechaAsignacion: Timestamp
  }[]
  ubicacion?: {
    latitud: number
    longitud: number
  }
}

export interface Pago {
  id: string
  cliente: {
    id: string
    nombre: string
    email: string
  }
  monto: number
  concepto: string
  estado: 'pendiente' | 'pagado' | 'vencido'
  fechaVencimiento: Timestamp
  fechaPago?: Timestamp
  metodoPago?: string
  referencia?: string
}

export interface MetricasSistema {
  usuariosActivos: number
  inventarioTotal: number
  ticketsAbiertos: number
  brigadasActivas: number
  pagosPendientes: number
  ingresosMensuales: number
  tendencias: {
    usuarios: number
    inventario: number
    tickets: number
    brigadas: number
    pagos: number
    ingresos: number
  }
} 