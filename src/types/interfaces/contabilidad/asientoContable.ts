export interface MovimientoCuenta {
  cuentaId: string
  debe: number
  haber: number
  descripcion?: string
}

export interface AsientoContable {
  id: string
  fecha: Date
  descripcion: string
  movimientos: MovimientoCuenta[]
  referencia?: string
  createdAt: Date
  updatedAt: Date
}
