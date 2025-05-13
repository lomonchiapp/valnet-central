import { useState } from "react";
import { addDoc, collection, doc, serverTimestamp, updateDoc, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from "@/firebase";
import { TipoArticulo, Unidad } from "shared-types";

export interface NuevoArticuloData {
  nombre: string;
  descripcion: string;
  tipo: TipoArticulo;
  cantidad: number;
  costo: number;
  unidad: Unidad;
  marca: string;
  modelo: string;
  serial: string;
  ubicacion: string;
  imagenUrl?: string;
  garantia?: number;
  mac?: string;
  codigoBarras?: string;
  categoriaEquipo?: string;
  wirelessKey?: string;
}

interface AgregarArticuloParams extends NuevoArticuloData {
  imagen?: File | null;
}

export function useAgregarArticulo(inventarioId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const agregarArticulo = async (data: AgregarArticuloParams): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      let imagenUrl = data.imagenUrl;
      
      // Upload image if provided
      if (data.imagen) {
        const imageRef = ref(storage, `articulos/${inventarioId}/${Date.now()}-${data.imagen.name}`);
        await uploadBytes(imageRef, data.imagen);
        imagenUrl = await getDownloadURL(imageRef);
        setProgress(100);
      }
      
      // Create article data compatible with Articulo type from shared-types
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { imagen, ...articuloDataParaGuardar } = data;
      
      const articuloPayload = {
        ...articuloDataParaGuardar,
        imagenUrl,
        idinventario: inventarioId,
        // If it's equipment, set quantity to 1
        cantidad: data.tipo === TipoArticulo.EQUIPO ? 1 : Number(data.cantidad),
        ...(data.categoriaEquipo && { categoriaEquipo: data.categoriaEquipo }),
        ...(data.wirelessKey && { wirelessKey: data.wirelessKey }),
      };

      // Si es MATERIAL, buscar si ya existe uno con el mismo nombre en el mismo inventario
      if (data.tipo === TipoArticulo.MATERIAL && articuloPayload.nombre) {
        const articulosRef = collection(database, 'articulos');
        const q = query(
          articulosRef,
          where('idinventario', '==', inventarioId),
          where('nombre', '==', articuloPayload.nombre.trim()),
          where('tipo', '==', TipoArticulo.MATERIAL)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Artículo material existente encontrado
          const articuloExistenteDoc = querySnapshot.docs[0];
          const articuloExistenteData = articuloExistenteDoc.data();
          const cantidadActual = Number(articuloExistenteData.cantidad) || 0;
          const cantidadAAgregar = Number(articuloPayload.cantidad) || 0;
          const nuevaCantidad = cantidadActual + cantidadAAgregar;

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { idinventario: payloadIdInventario, nombre: payloadNombre, tipo: payloadTipo, ...otrosDatosDelPayload } = articuloPayload;

          const updateData = {
            ...otrosDatosDelPayload, // Contiene costo, unidad, descripcion, etc. actualizados del form
            cantidad: nuevaCantidad,
            updatedAt: serverTimestamp(),
            // imagenUrl ya está en otrosDatosDelPayload si se actualizó
          };

          await updateDoc(articuloExistenteDoc.ref, updateData);
          return articuloExistenteDoc.id; // Devolver ID del artículo actualizado
        }
      }
      
      // Si es EQUIPO, o es MATERIAL pero no se encontró (se crea nuevo)
      const docRef = await addDoc(collection(database, 'articulos'), {
        ...articuloPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (err) {
      // Log error but avoid console statement in production
      setError(err instanceof Error ? err : new Error('Error desconocido al agregar el artículo'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { agregarArticulo, isLoading, error, progress };
} 