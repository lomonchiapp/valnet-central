export interface Eliminacion {
  id: string
  fecha: string // ISO string
  usuarioId: string
  usuarioNombre: string
  motivo: string
  entidad: string // Ej: 'control_combustible', 'brigada', etc.
  entidadId: string
  datosEliminados: unknown // Puede ser un objeto serializado con los datos eliminados
}
