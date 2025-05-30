import { database } from '@/firebase'
import type { Brigada } from '@/types/interfaces/coordinacion/brigada'
import type { Eliminacion } from '@/types/valnet/eliminacion'
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore'
import { toast } from 'sonner'

interface Params {
  brigada: Brigada
  motivo: string
  usuario: { id: string; nombres?: string; email?: string }
}

export function useBorrarBrigada() {
  return async ({ brigada, motivo, usuario }: Params) => {
    try {
      const eliminacion: Omit<Eliminacion, 'id'> = {
        fecha: new Date().toISOString(),
        usuarioId: usuario.id,
        usuarioNombre: usuario.nombres || usuario.email || 'Usuario',
        motivo,
        entidad: 'brigada',
        entidadId: brigada.id,
        datosEliminados: brigada,
      }
      await addDoc(collection(database, 'eliminaciones'), eliminacion)
      await deleteDoc(doc(database, 'brigadas', brigada.id))
    } catch (error) {
      //eslint-disable-next-line no-console
      console.error(error)
      toast.error('Error al eliminar la brigada')
    }
  }
}
