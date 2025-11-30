import { z } from 'zod'
import { TipoArticulo, Unidad } from 'shared-types'

export const articuloBaseSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  marca: z.string().min(1, 'La marca es obligatoria'),
  modelo: z.string().min(1, 'El modelo es obligatorio'),
  ubicacion: z.string().optional(),
  imagenUrl: z.string().optional(),
  costo: z.number().min(0, 'El costo no puede ser negativo'),
})

export const materialSchema = articuloBaseSchema.extend({
  tipo: z.literal(TipoArticulo.MATERIAL),
  cantidad: z.number().min(1, 'La cantidad debe ser al menos 1'),
  unidad: z.nativeEnum(Unidad, { errorMap: () => ({ message: 'Seleccione una unidad válida' }) }),
  cantidad_minima: z.number().min(0).optional(),
  imagen: z.any().optional(), // Para manejar el archivo en el formulario
  marca: z.string().optional(), // Marca opcional para materiales, se asignará GENERICA si no se proporciona
})

export const equipoSchema = articuloBaseSchema.extend({
  tipo: z.literal(TipoArticulo.EQUIPO),
  serial: z.string().min(3, 'El serial es obligatorio (min 3 caracteres)'),
  mac: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{12})$/, {
    message: 'Formato MAC inválido (ej: AA:BB:CC:DD:EE:FF)',
  }),
  wirelessKey: z.string().optional(),
  garantia: z.number().min(0).optional(),
  imagen: z.any().optional(),
})

// Esquema para entrada masiva de equipos (base + lista seriales)
export const equiposMasivosSchema = articuloBaseSchema.omit({ serial: true, mac: true, wirelessKey: true }).extend({
  tipo: z.literal(TipoArticulo.EQUIPO),
  seriales: z.string().min(1, 'Ingrese al menos un serial'), // String multilinea
  prefijoMac: z.string().optional(), // Para autogenerar MACs
  imagen: z.any().optional(),
})

export type MaterialFormValues = z.infer<typeof materialSchema>
export type EquipoFormValues = z.infer<typeof equipoSchema>
export type EquiposMasivosFormValues = z.infer<typeof equiposMasivosSchema>

