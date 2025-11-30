import { Articulo, TipoArticulo, Unidad } from 'shared-types'
import { database } from '@/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

/**
 * Clave única para identificar un artículo material
 * Un material se identifica por: SKU (Código) O nombre + unidad + marca + modelo (dentro del mismo inventario)
 */
export interface ArticuloKey {
  codigo?: string
  nombre: string
  unidad: Unidad
  marca: string
  modelo: string
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
  warning?: string
  duplicateArticle?: Articulo
}

/**
 * Reglas de negocio para el inventario
 */
export const INVENTARIO_RULES = {
  // El SKU es el identificador principal si existe
  USE_SKU_VALIDATION: true,

  // Si no hay SKU, se usa la clave compuesta: nombre + unidad + marca + modelo
  MATERIAL_IDENTIFIER: ['nombre', 'unidad', 'marca', 'modelo'],
  
  // Un equipo se identifica únicamente por: serial (debe ser único globalmente)
  EQUIPO_IDENTIFIER: ['serial'],
  
  // Validaciones de cantidad
  MIN_CANTIDAD: 0,
  MAX_CANTIDAD: 999999,
  
  // Validaciones de costo
  MIN_COSTO: 0,
  MAX_COSTO: 999999999,
  
  // Validaciones de nombre
  MIN_NOMBRE_LENGTH: 1,
  MAX_NOMBRE_LENGTH: 200,
  
  // Validaciones de descripción
  MAX_DESCRIPCION_LENGTH: 1000,
  
  // Validaciones de serial (equipos)
  MIN_SERIAL_LENGTH: 1,
  MAX_SERIAL_LENGTH: 100,

  // Validaciones de Código/SKU
  MIN_CODIGO_LENGTH: 3,
  MAX_CODIGO_LENGTH: 50,
} as const

/**
 * Normaliza un string para comparación (trim, lowercase)
 */
function normalizeString(str: string | undefined | null): string {
  return (str || '').trim().toLowerCase()
}

/**
 * Genera una clave única para un artículo material
 */
export function generateMaterialKey(articulo: Partial<Articulo>): ArticuloKey {
  return {
    codigo: articulo.codigo ? normalizeString(articulo.codigo) : undefined,
    nombre: normalizeString(articulo.nombre),
    unidad: articulo.unidad || Unidad.UNIDAD,
    marca: normalizeString(articulo.marca) || 'generica',
    modelo: normalizeString(articulo.modelo) || 'generico',
  }
}

/**
 * Valida los datos básicos de un artículo antes de crear/actualizar
 */
export function validateArticuloData(articulo: Partial<Articulo>): ValidationResult {
  // Validar nombre
  if (!articulo.nombre || articulo.nombre.trim().length < INVENTARIO_RULES.MIN_NOMBRE_LENGTH) {
    return {
      isValid: false,
      error: `El nombre es obligatorio y debe tener al menos ${INVENTARIO_RULES.MIN_NOMBRE_LENGTH} carácter(es)`,
    }
  }

  if (articulo.nombre.trim().length > INVENTARIO_RULES.MAX_NOMBRE_LENGTH) {
    return {
      isValid: false,
      error: `El nombre no puede exceder ${INVENTARIO_RULES.MAX_NOMBRE_LENGTH} caracteres`,
    }
  }

  // Validar Código/SKU si existe
  if (articulo.codigo && articulo.codigo.trim().length > 0) {
    if (articulo.codigo.trim().length < INVENTARIO_RULES.MIN_CODIGO_LENGTH) {
      return {
        isValid: false,
        error: `El Código/SKU debe tener al menos ${INVENTARIO_RULES.MIN_CODIGO_LENGTH} caracteres`,
      }
    }
    if (articulo.codigo.trim().length > INVENTARIO_RULES.MAX_CODIGO_LENGTH) {
      return {
        isValid: false,
        error: `El Código/SKU no puede exceder ${INVENTARIO_RULES.MAX_CODIGO_LENGTH} caracteres`,
      }
    }
  }

  // Validar tipo
  if (!articulo.tipo || !Object.values(TipoArticulo).includes(articulo.tipo)) {
    return {
      isValid: false,
      error: 'El tipo de artículo es obligatorio y debe ser MATERIAL o EQUIPO',
    }
  }

  // Validaciones específicas por tipo
  if (articulo.tipo === TipoArticulo.MATERIAL) {
    // Validar cantidad
    if (articulo.cantidad === undefined || articulo.cantidad < INVENTARIO_RULES.MIN_CANTIDAD) {
      return {
        isValid: false,
        error: `La cantidad debe ser mayor o igual a ${INVENTARIO_RULES.MIN_CANTIDAD}`,
      }
    }

    if (articulo.cantidad > INVENTARIO_RULES.MAX_CANTIDAD) {
      return {
        isValid: false,
        error: `La cantidad no puede exceder ${INVENTARIO_RULES.MAX_CANTIDAD}`,
      }
    }

    // Validar unidad
    if (!articulo.unidad || !Object.values(Unidad).includes(articulo.unidad)) {
      return {
        isValid: false,
        error: 'La unidad de medida es obligatoria para materiales',
      }
    }

    // Validar costo
    if (articulo.costo === undefined || articulo.costo < INVENTARIO_RULES.MIN_COSTO) {
      return {
        isValid: false,
        error: `El costo debe ser mayor o igual a ${INVENTARIO_RULES.MIN_COSTO}`,
      }
    }

    if (articulo.costo > INVENTARIO_RULES.MAX_COSTO) {
      return {
        isValid: false,
        error: `El costo no puede exceder ${INVENTARIO_RULES.MAX_COSTO}`,
      }
    }

    // Validar cantidad mínima si está definida
    if (articulo.cantidad_minima !== undefined) {
      if (articulo.cantidad_minima < INVENTARIO_RULES.MIN_CANTIDAD) {
        return {
          isValid: false,
          error: `La cantidad mínima debe ser mayor o igual a ${INVENTARIO_RULES.MIN_CANTIDAD}`,
        }
      }
    }
  } else if (articulo.tipo === TipoArticulo.EQUIPO) {
    // Validar serial (obligatorio para equipos)
    if (!articulo.serial || articulo.serial.trim().length < INVENTARIO_RULES.MIN_SERIAL_LENGTH) {
      return {
        isValid: false,
        error: `El serial es obligatorio para equipos y debe tener al menos ${INVENTARIO_RULES.MIN_SERIAL_LENGTH} carácter(es)`,
      }
    }

    if (articulo.serial.trim().length > INVENTARIO_RULES.MAX_SERIAL_LENGTH) {
      return {
        isValid: false,
        error: `El serial no puede exceder ${INVENTARIO_RULES.MAX_SERIAL_LENGTH} caracteres`,
      }
    }

    // Validar cantidad (debe ser 1 para equipos)
    if (articulo.cantidad !== undefined && articulo.cantidad !== 1) {
      return {
        isValid: false,
        error: 'Los equipos deben tener cantidad igual a 1',
      }
    }
  }

  // Validar descripción si está presente
  if (articulo.descripcion && articulo.descripcion.length > INVENTARIO_RULES.MAX_DESCRIPCION_LENGTH) {
    return {
      isValid: false,
      error: `La descripción no puede exceder ${INVENTARIO_RULES.MAX_DESCRIPCION_LENGTH} caracteres`,
    }
  }

  return { isValid: true }
}

/**
 * Busca artículos duplicados en un inventario específico
 * Prioridad de búsqueda:
 * 1. Código/SKU (si existe) -> Debe ser único en el inventario
 * 2. Para MATERIALES (si no hay SKU): nombre + unidad + marca + modelo
 * 3. Para EQUIPOS: serial (globalmente)
 */
export async function findDuplicateArticle(
  articulo: Partial<Articulo>,
  inventarioId: string,
  excludeArticleId?: string
): Promise<Articulo | null> {
  const articulosRef = collection(database, 'articulos')

  // 1. Búsqueda por Código/SKU (Prioridad Alta)
  if (articulo.codigo && articulo.codigo.trim().length > 0) {
    // El código debe ser único DENTRO DEL MISMO INVENTARIO para materiales
    // (Puede haber el mismo SKU en diferentes inventarios)
    const qCodigo = query(
      articulosRef,
      where('idinventario', '==', inventarioId),
      where('codigo', '==', articulo.codigo.trim())
    )
    
    const snapshotCodigo = await getDocs(qCodigo)
    const duplicatesCodigo = snapshotCodigo.docs
      .filter(doc => !excludeArticleId || doc.id !== excludeArticleId)
      .map(doc => ({ id: doc.id, ...doc.data() } as Articulo))

    if (duplicatesCodigo.length > 0) {
      return duplicatesCodigo[0]
    }
  }

  // 2. Búsqueda por Identidad Específica (Fallback si no hay código o no se encontró)
  if (articulo.tipo === TipoArticulo.MATERIAL) {
    // Buscar material por nombre + unidad + marca + modelo en el mismo inventario
    const conditions = [
      where('idinventario', '==', inventarioId),
      where('tipo', '==', TipoArticulo.MATERIAL),
      where('nombre', '==', articulo.nombre?.trim()),
      where('unidad', '==', articulo.unidad),
    ]

    // Agregar marca y modelo si están disponibles
    if (articulo.marca) {
      conditions.push(where('marca', '==', articulo.marca))
    }
    if (articulo.modelo) {
      conditions.push(where('modelo', '==', articulo.modelo))
    }

    const q = query(articulosRef, ...conditions)
    const snapshot = await getDocs(q)

    // Filtrar manualmente por marca y modelo si no se incluyeron en la query (caso vacío/genérico)
    const duplicates = snapshot.docs
      .filter(doc => {
        if (excludeArticleId && doc.id === excludeArticleId) return false

        const data = doc.data() as Articulo
        
        // Si no se especificó marca en la query, comparar manualmente
        if (!articulo.marca) {
          const marcaMatch = !data.marca || normalizeString(data.marca) === 'generica'
          if (!marcaMatch) return false
        }

        // Si no se especificó modelo en la query, comparar manualmente
        if (!articulo.modelo) {
          const modeloMatch = !data.modelo || normalizeString(data.modelo) === 'generico'
          if (!modeloMatch) return false
        }

        return true
      })
      .map(doc => ({ id: doc.id, ...doc.data() } as Articulo))

    return duplicates.length > 0 ? duplicates[0] : null
  } else if (articulo.tipo === TipoArticulo.EQUIPO) {
    // Buscar equipo por serial (globalmente, no solo en el inventario)
    if (!articulo.serial) {
      return null
    }

    const qSerial = query(
      articulosRef,
      where('tipo', '==', TipoArticulo.EQUIPO),
      where('serial', '==', articulo.serial.trim())
    )

    const snapshotSerial = await getDocs(qSerial)
    const duplicatesSerial = snapshotSerial.docs
      .filter(doc => !excludeArticleId || doc.id !== excludeArticleId)
      .map(doc => ({ id: doc.id, ...doc.data() } as Articulo))

    return duplicatesSerial.length > 0 ? duplicatesSerial[0] : null
  }

  return null
}

/**
 * Valida Consistencia Global (Opcional pero recomendado)
 * Verifica si un SKU usado ya existe en OTROS inventarios y si los datos coinciden.
 */
export async function validateGlobalConsistency(
  articulo: Partial<Articulo>
): Promise<{ consistent: boolean, message?: string, suggestedData?: Partial<Articulo> }> {
  if (!articulo.codigo || articulo.codigo.trim().length === 0) return { consistent: true }

  const articulosRef = collection(database, 'articulos')
  // Buscar cualquier artículo con el mismo código en todo el sistema
  const q = query(articulosRef, where('codigo', '==', articulo.codigo.trim()))
  const snapshot = await getDocs(q)

  if (!snapshot.empty) {
    // Tomar el primer artículo encontrado como referencia "Maestra"
    const masterData = snapshot.docs[0].data() as Articulo
    
    const nombreCoincide = normalizeString(articulo.nombre) === normalizeString(masterData.nombre)
    const marcaCoincide = normalizeString(articulo.marca) === normalizeString(masterData.marca)
    const modeloCoincide = normalizeString(articulo.modelo) === normalizeString(masterData.modelo)

    if (!nombreCoincide || !marcaCoincide || !modeloCoincide) {
      return {
        consistent: false,
        message: `El código "${articulo.codigo}" ya existe en el sistema asociado a "${masterData.nombre}" (${masterData.marca} ${masterData.modelo}). ¿Deseas usar esos datos?`,
        suggestedData: {
          nombre: masterData.nombre,
          marca: masterData.marca,
          modelo: masterData.modelo,
          unidad: masterData.unidad,
          descripcion: masterData.descripcion
        }
      }
    }
  }

  return { consistent: true }
}

/**
 * Valida si se puede crear un artículo nuevo sin duplicados
 */
export async function validateNewArticle(
  articulo: Partial<Articulo>,
  inventarioId: string
): Promise<ValidationResult> {
  // Primero validar datos básicos
  const basicValidation = validateArticuloData(articulo)
  if (!basicValidation.isValid) {
    return basicValidation
  }

  // Buscar duplicados
  const duplicate = await findDuplicateArticle(articulo, inventarioId)

  if (duplicate) {
    if (articulo.tipo === TipoArticulo.MATERIAL) {
      return {
        isValid: false,
        error: `Ya existe un material en este inventario con los mismos datos (SKU o Nombre+Marca). Use "Agregar Stock".`,
        duplicateArticle: duplicate,
      }
    } else {
      return {
        isValid: false,
        error: `Ya existe un equipo con el serial "${articulo.serial}". El serial debe ser único.`,
        duplicateArticle: duplicate,
      }
    }
  }

  return { isValid: true }
}

/**
 * Valida si se puede actualizar un artículo sin crear duplicados
 */
export async function validateUpdateArticle(
  articulo: Partial<Articulo> & { id: string },
  inventarioId: string
): Promise<ValidationResult> {
  const basicValidation = validateArticuloData(articulo)
  if (!basicValidation.isValid) {
    return basicValidation
  }

  const duplicate = await findDuplicateArticle(articulo, inventarioId, articulo.id)

  if (duplicate) {
    if (articulo.tipo === TipoArticulo.MATERIAL) {
      return {
        isValid: false,
        error: `Ya existe otro material en este inventario con los mismos datos (SKU o Nombre+Marca).`,
        duplicateArticle: duplicate,
      }
    } else {
      return {
        isValid: false,
        error: `Ya existe otro equipo con el serial "${articulo.serial}". El serial debe ser único.`,
        duplicateArticle: duplicate,
      }
    }
  }

  return { isValid: true }
}

/**
 * Valida una transferencia de material
 */
export async function validateTransfer(
  articulo: Articulo,
  inventarioDestinoId: string
): Promise<ValidationResult> {
  if (articulo.tipo === TipoArticulo.MATERIAL) {
    // Buscar material en destino con la misma clave
    const duplicate = await findDuplicateArticle(articulo, inventarioDestinoId)

    if (duplicate) {
      return {
        isValid: true,
        warning: `Ya existe el material en destino. Se sumará la cantidad transferida.`,
        duplicateArticle: duplicate,
      }
    }
    return { isValid: true }
  } else if (articulo.tipo === TipoArticulo.EQUIPO) {
    const duplicate = await findDuplicateArticle(articulo, inventarioDestinoId)

    if (duplicate) {
      return {
        isValid: false,
        error: `Ya existe un equipo con el serial "${articulo.serial}" en el inventario destino.`,
        duplicateArticle: duplicate,
      }
    }
    return { isValid: true }
  }
  return { isValid: true }
}

/**
 * Valida una salida de artículo
 */
export function validateSalida(articulo: Articulo, cantidad: number): ValidationResult {
  if (articulo.tipo === TipoArticulo.MATERIAL) {
    if (cantidad <= 0) return { isValid: false, error: 'La cantidad debe ser mayor a 0' }
    if (cantidad > articulo.cantidad) return { isValid: false, error: `Stock insuficiente. Disponible: ${articulo.cantidad}` }
  } else if (articulo.tipo === TipoArticulo.EQUIPO) {
    if (cantidad !== 1) return { isValid: false, error: 'Equipos solo de 1 en 1' }
    if (articulo.cantidad < 1) return { isValid: false, error: 'Equipo no disponible' }
  }
  return { isValid: true }
}
