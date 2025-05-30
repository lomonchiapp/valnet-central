import { useState } from 'react';
import { database, storage } from '@/firebase';
import { TipoMovimiento } from '@/types/interfaces/almacen/movimiento';
import { addDoc, collection, serverTimestamp, updateDoc, query, where, getDocs, } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { TipoArticulo } from 'shared-types';
import { getAuthState } from '@/stores/authStore';
export function useAgregarArticulo(inventarioId) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const agregarArticulo = async (data) => {
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
            // Get current user ID from auth store
            const { user } = getAuthState();
            const userId = user?.id || 'unknown';
            // Si es MATERIAL, buscar si ya existe uno con el mismo nombre en el mismo inventario
            if (data.tipo === TipoArticulo.MATERIAL && articuloPayload.nombre) {
                const articulosRef = collection(database, 'articulos');
                const q = query(articulosRef, where('idinventario', '==', inventarioId), where('nombre', '==', articuloPayload.nombre.trim()), where('tipo', '==', TipoArticulo.MATERIAL));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    // Artículo material existente encontrado
                    const articuloExistenteDoc = querySnapshot.docs[0];
                    const articuloExistenteData = articuloExistenteDoc.data();
                    const cantidadActual = Number(articuloExistenteData.cantidad) || 0;
                    const cantidadAAgregar = Number(articuloPayload.cantidad) || 0;
                    const nuevaCantidad = cantidadActual + cantidadAAgregar;
                    const { ...otrosDatosDelPayload } = articuloPayload;
                    const updateData = {
                        ...otrosDatosDelPayload, // Contiene costo, unidad, descripcion, etc. actualizados del form
                        cantidad: nuevaCantidad,
                        updatedAt: serverTimestamp(),
                        // imagenUrl ya está en otrosDatosDelPayload si se actualizó
                    };
                    await updateDoc(articuloExistenteDoc.ref, updateData);
                    // Crear registro de movimiento para la entrada
                    const movimientoData = {
                        idinventario_origen: null,
                        idinventario_destino: inventarioId,
                        idarticulo: articuloExistenteDoc.id,
                        idusuario: userId,
                        cantidad: cantidadAAgregar,
                        tipo: TipoMovimiento.ENTRADA,
                        fecha: new Date(),
                        descripcion: `Entrada de ${cantidadAAgregar} ${articuloPayload.unidad} de ${articuloPayload.nombre}`,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    };
                    const movimientoRef = await addDoc(collection(database, 'movimientos'), movimientoData);
                    // Actualizar el documento recién creado para incluir su propio ID
                    await updateDoc(movimientoRef, {
                        id: movimientoRef.id,
                    });
                    return articuloExistenteDoc.id; // Devolver ID del artículo actualizado
                }
            }
            // Si es EQUIPO, o es MATERIAL pero no se encontró (se crea nuevo)
            const docRef = await addDoc(collection(database, 'articulos'), {
                ...articuloPayload,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            // Actualizar el documento recién creado para incluir su propio ID
            await updateDoc(docRef, {
                id: docRef.id,
            });
            // Crear registro de movimiento para la entrada
            const movimientoData = {
                idinventario_origen: null,
                idinventario_destino: inventarioId,
                idarticulo: docRef.id,
                idusuario: userId,
                cantidad: articuloPayload.cantidad,
                tipo: TipoMovimiento.ENTRADA,
                fecha: new Date(),
                descripcion: `Entrada inicial de ${articuloPayload.cantidad} ${articuloPayload.unidad} de ${articuloPayload.nombre}`,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            const movimientoRef = await addDoc(collection(database, 'movimientos'), movimientoData);
            // Actualizar el documento recién creado para incluir su propio ID
            await updateDoc(movimientoRef, {
                id: movimientoRef.id,
            });
            return docRef.id;
        }
        catch (err) {
            // Log error but avoid console statement in production
            setError(err instanceof Error
                ? err
                : new Error('Error desconocido al agregar el artículo'));
            return null;
        }
        finally {
            setIsLoading(false);
        }
    };
    return { agregarArticulo, isLoading, error, progress };
}
