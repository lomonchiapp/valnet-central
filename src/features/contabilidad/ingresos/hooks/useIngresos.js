import { useState, useCallback } from 'react';
import { TipoIngreso } from '@/types/interfaces/contabilidad/ingreso';
import { toast } from 'sonner';
import { useContabilidadState } from '@/context/global/useContabilidadState';
export function useIngresos() {
    const [isLoading, setIsLoading] = useState(false);
    const { addIngresoConMovimiento, updateIngreso: updateIngresoContext, deleteIngreso: deleteIngresoContext, } = useContabilidadState();
    const validateIngresoData = useCallback((ingresoData) => {
        if (!ingresoData.descripcion.trim()) {
            toast.error('La descripción es obligatoria');
            return false;
        }
        if (!ingresoData.tipo) {
            toast.error('Selecciona un tipo de ingreso');
            return false;
        }
        if (!ingresoData.idcuenta) {
            toast.error('Selecciona una cuenta contable');
            return false;
        }
        if (ingresoData.monto <= 0) {
            toast.error('El monto debe ser mayor a 0');
            return false;
        }
        if (!ingresoData.fecha) {
            toast.error('La fecha es obligatoria');
            return false;
        }
        return true;
    }, []);
    const createIngreso = useCallback(async (ingresoData) => {
        if (!validateIngresoData(ingresoData))
            return null;
        setIsLoading(true);
        try {
            const newId = await addIngresoConMovimiento({
                descripcion: ingresoData.descripcion.trim(),
                monto: Number(ingresoData.monto),
                fecha: new Date(ingresoData.fecha).toISOString(),
                idcuenta: ingresoData.idcuenta,
                tipo: ingresoData.tipo,
                referencia: ingresoData.referencia?.trim(),
                notas: ingresoData.notas?.trim(),
            });
            const newIngreso = {
                id: newId,
                descripcion: ingresoData.descripcion.trim(),
                monto: Number(ingresoData.monto),
                fecha: new Date(ingresoData.fecha).toISOString(),
                idcuenta: ingresoData.idcuenta,
                tipo: ingresoData.tipo,
                referencia: ingresoData.referencia?.trim(),
                notas: ingresoData.notas?.trim(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            toast.success('Ingreso registrado exitosamente con movimiento contable');
            return newIngreso;
        }
        catch (error) {
            console.error('Error al crear ingreso:', error);
            toast.error('Error al registrar el ingreso');
            return null;
        }
        finally {
            setIsLoading(false);
        }
    }, [addIngresoConMovimiento, validateIngresoData]);
    const updateIngreso = useCallback(async (id, ingresoData) => {
        setIsLoading(true);
        try {
            const updateData = {};
            if (ingresoData.descripcion) {
                updateData.descripcion = ingresoData.descripcion.trim();
            }
            if (ingresoData.monto !== undefined) {
                updateData.monto = Number(ingresoData.monto);
            }
            if (ingresoData.fecha) {
                updateData.fecha = new Date(ingresoData.fecha).toISOString();
            }
            if (ingresoData.idcuenta) {
                updateData.idcuenta = ingresoData.idcuenta;
            }
            if (ingresoData.tipo) {
                updateData.tipo = ingresoData.tipo;
            }
            if (ingresoData.referencia !== undefined) {
                updateData.referencia = ingresoData.referencia?.trim();
            }
            if (ingresoData.notas !== undefined) {
                updateData.notas = ingresoData.notas?.trim();
            }
            await updateIngresoContext(id, updateData);
            // Crear el objeto actualizado para retornar
            const updatedIngreso = {
                id,
                descripcion: updateData.descripcion || '',
                monto: updateData.monto || 0,
                fecha: updateData.fecha || '',
                idcuenta: updateData.idcuenta || '',
                tipo: updateData.tipo || TipoIngreso.OTRO,
                referencia: updateData.referencia,
                notas: updateData.notas,
                createdAt: new Date(), // Se mantendría el original en la práctica
                updatedAt: new Date(),
            };
            toast.success('Ingreso actualizado exitosamente');
            return updatedIngreso;
        }
        catch (error) {
            console.error('Error al actualizar ingreso:', error);
            toast.error('Error al actualizar el ingreso');
            return null;
        }
        finally {
            setIsLoading(false);
        }
    }, [updateIngresoContext]);
    const deleteIngreso = useCallback(async (id) => {
        setIsLoading(true);
        try {
            await deleteIngresoContext(id);
            toast.success('Ingreso eliminado exitosamente');
            return true;
        }
        catch (error) {
            console.error('Error al eliminar ingreso:', error);
            toast.error('Error al eliminar el ingreso');
            return false;
        }
        finally {
            setIsLoading(false);
        }
    }, [deleteIngresoContext]);
    return {
        isLoading,
        createIngreso,
        updateIngreso,
        deleteIngreso,
        validateIngresoData,
    };
}
