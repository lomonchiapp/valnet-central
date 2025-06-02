import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useContabilidadState } from '@/context/global/useContabilidadState';
export function usePagosUnicos() {
    const [isLoading, setIsLoading] = useState(false);
    const { addPagoUnicoConMovimiento, updatePagoUnico, deletePagoUnico } = useContabilidadState();
    const validatePagoData = useCallback((pagoData) => {
        if (!pagoData.descripcion.trim()) {
            toast.error('La descripción es obligatoria');
            return false;
        }
        if (!pagoData.idproveedor) {
            toast.error('Selecciona un proveedor');
            return false;
        }
        if (!pagoData.idcuenta) {
            toast.error('Selecciona una cuenta contable');
            return false;
        }
        if (pagoData.monto <= 0) {
            toast.error('El monto debe ser mayor a 0');
            return false;
        }
        if (!pagoData.fecha) {
            toast.error('La fecha es obligatoria');
            return false;
        }
        return true;
    }, []);
    const createPago = useCallback(async (pagoData) => {
        if (!validatePagoData(pagoData))
            return null;
        setIsLoading(true);
        try {
            const newId = await addPagoUnicoConMovimiento({
                descripcion: pagoData.descripcion.trim(),
                monto: Number(pagoData.monto),
                fecha: new Date(pagoData.fecha).toISOString(),
                idcuenta: pagoData.idcuenta,
                idproveedor: pagoData.idproveedor,
            });
            const newPago = {
                id: newId,
                descripcion: pagoData.descripcion.trim(),
                monto: Number(pagoData.monto),
                fecha: new Date(pagoData.fecha).toISOString(),
                idcuenta: pagoData.idcuenta,
                idproveedor: pagoData.idproveedor,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            toast.success('Pago creado exitosamente con movimiento contable');
            return newPago;
        }
        catch (error) {
            console.error('Error al crear pago:', error);
            toast.error('Error al crear el pago');
            return null;
        }
        finally {
            setIsLoading(false);
        }
    }, [addPagoUnicoConMovimiento, validatePagoData]);
    const updatePago = useCallback(async (id, pagoData) => {
        setIsLoading(true);
        try {
            const updateData = {};
            if (pagoData.descripcion) {
                updateData.descripcion = pagoData.descripcion.trim();
            }
            if (pagoData.monto !== undefined) {
                updateData.monto = Number(pagoData.monto);
            }
            if (pagoData.fecha) {
                updateData.fecha = new Date(pagoData.fecha).toISOString();
            }
            if (pagoData.idcuenta) {
                updateData.idcuenta = pagoData.idcuenta;
            }
            if (pagoData.idproveedor) {
                updateData.idproveedor = pagoData.idproveedor;
            }
            await updatePagoUnico(id, updateData);
            // Crear el objeto actualizado para retornar
            const updatedPago = {
                id,
                descripcion: updateData.descripcion || '',
                monto: updateData.monto || 0,
                fecha: updateData.fecha || '',
                idcuenta: updateData.idcuenta || '',
                idproveedor: updateData.idproveedor || '',
                createdAt: new Date(), // Se mantendría el original en la práctica
                updatedAt: new Date(),
            };
            toast.success('Pago actualizado exitosamente');
            return updatedPago;
        }
        catch (error) {
            console.error('Error al actualizar pago:', error);
            toast.error('Error al actualizar el pago');
            return null;
        }
        finally {
            setIsLoading(false);
        }
    }, [updatePagoUnico]);
    const deletePago = useCallback(async (id) => {
        setIsLoading(true);
        try {
            await deletePagoUnico(id);
            toast.success('Pago eliminado exitosamente');
            return true;
        }
        catch (error) {
            console.error('Error al eliminar pago:', error);
            toast.error('Error al eliminar el pago');
            return false;
        }
        finally {
            setIsLoading(false);
        }
    }, [deletePagoUnico]);
    return {
        isLoading,
        createPago,
        updatePago,
        deletePago,
        validatePagoData,
    };
}
