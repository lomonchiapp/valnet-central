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

export interface ClienteAgrupado {
  idcliente: string
  facturas: FacturaMikrowisp[]
  totalPagado: number
  estado: 'PAGADO' | 'PENDIENTE'
}

export interface SyncMetadata {
  lastSync: string
  totalFacturas: number
  totalClientes: number
  duration: number
  success: boolean
  error?: string
  syncType: 'pagadas' | 'pendientes'
}

export interface CacheData<T> {
  data: T
  metadata: SyncMetadata
}

export interface MikrowispApiParams {
  limit?: number
  estado?: number
  idcliente?: string
  fechapago?: string
  formapago?: string
}

export interface MikrowispApiResponse {
  estado: string
  facturas?: FacturaMikrowisp[]
  mensaje?: string
  error?: string
} 