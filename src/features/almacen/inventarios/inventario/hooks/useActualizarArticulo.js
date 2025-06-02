import { useState } from 'react';
import { database } from '@/firebase';
import { TipoMovimiento } from '@/types/interfaces/almacen/movimiento';
import { doc, updateDoc, serverTimestamp, addDoc, collection, getDoc, } from 'firebase/firestore';
import { getAuthState } from '@/stores/authStore';
export function useActualizarArticulo() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const actualizarArticulo = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const { id, ...updateData } = data;
            const articuloRef = doc(database, 'articulos', id);
            // Get current user ID from auth store
            const { user } = getAuthState();
            const userId = user?.id || 'unknown';
            // Update the article document
            await updateDoc(articuloRef, {
                ...updateData,
                updatedAt: serverTimestamp(),
            });
            // Get the full article data for the movement description
            const articuloSnapshot = await getDoc(articuloRef);
            const articuloData = articuloSnapshot.data();
            // Create movement record for the edit
            const movimientoData = {
                idinventario_origen: articuloData.idinventario,
                idinventario_destino: articuloData.idinventario,
                idarticulo: id,
                idusuario: userId,
                cantidad: 1, // For equipment edits, quantity is always 1
                tipo: TipoMovimiento.TRANSFERENCIA, // Using TRANSFERENCIA type for edits
                fecha: new Date(),
                descripcion: generateMovementDescription(updateData, articuloData),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            const movimientoRef = await addDoc(collection(database, 'movimientos'), movimientoData);
            // Update the newly created document to include its own ID
            await updateDoc(movimientoRef, {
                id: movimientoRef.id,
            });
            return true;
        }
        catch (err) {
            setError(err instanceof Error
                ? err
                : new Error('Error desconocido al actualizar el artículo'));
            return false;
        }
        finally {
            setIsLoading(false);
        }
    };
    // Helper function to generate a descriptive message for the movement
    const generateMovementDescription = (updateData, articuloData) => {
        const changes = [];
        if (updateData.ubicacion) {
            changes.push(`ubicación a "${updateData.ubicacion}"`);
        }
        if (updateData.costo !== undefined) {
            changes.push(`costo a ${updateData.costo}`);
        }
        if (updateData.serial) {
            changes.push(`número de serie a "${updateData.serial}"`);
        }
        if (updateData.mac) {
            changes.push(`MAC a "${updateData.mac}"`);
        }
        if (updateData.wirelessKey) {
            changes.push(`clave wireless a "${updateData.wirelessKey}"`);
        }
        if (updateData.garantia !== undefined) {
            changes.push(`garantía a ${updateData.garantia} meses`);
        }
        if (updateData.descripcion) {
            changes.push(`descripción actualizada`);
        }
        if (updateData.codigoBarras) {
            changes.push(`código de barras a "${updateData.codigoBarras}"`);
        }
        if (changes.length === 0) {
            return `Edición de ${articuloData.nombre}`;
        }
        return `Edición de ${articuloData.nombre}: ${changes.join(', ')}`;
    };
    return { actualizarArticulo, isLoading, error };
}
