import { useForm } from "react-hook-form";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Brigada } from "@/types/interfaces/coordinacion/brigada";
import type { ControlCombustible } from "@/types/interfaces/coordinacion/controlCombustible";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { database } from "@/firebase";
import { useEffect } from "react";

interface RegistroCombustibleDialogProps {
  brigada: Brigada | null;
  registro?: ControlCombustible | null;
  modo?: 'crear' | 'editar';
  onClose?: () => void;
}

type FormValues = Omit<ControlCombustible, "id" | "createdAt" | "updatedAt" | "idbrigada"> & { fecha: string };

export default function RegistroCombustibleDialog({ brigada, registro, modo = 'crear', onClose }: RegistroCombustibleDialogProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      fecha: registro?.fecha || new Date().toISOString().slice(0, 10),
      galones: registro?.galones ?? 0,
      precio_galon: registro?.precio_galon ?? 0,
      km_inicial: registro?.km_inicial ?? 0,
      km_final: registro?.km_final ?? 0,
      referencia: registro?.referencia ?? "",
    },
  });

  useEffect(() => {
    if (brigada && modo === 'crear') {
      form.setValue('km_inicial', brigada.kilometrajeActual ?? 0);
    }
    if (registro && modo === 'editar') {
      form.setValue('km_inicial', registro.km_inicial);
    }
  }, [brigada, registro, modo, form]);

  const submitting = form.formState.isSubmitting;
  if (!brigada) return null;

  const onSubmit = async (values: FormValues) => {
    if (modo === 'editar' && registro) {
      await updateDoc(doc(database, "control_combustible", registro.id), {
        ...values,
        fecha: values.fecha,
        idbrigada: brigada.id,
        updatedAt: new Date(),
      });
      if (values.km_final !== registro.km_final) {
        await updateDoc(doc(database, "brigadas", brigada.id), {
          kilometrajeActual: values.km_final,
          updatedAt: new Date(),
        });
      }
      if (onClose) onClose();
      return;
    }
    await addDoc(collection(database, "control_combustible"), {
      ...values,
      fecha: values.fecha,
      idbrigada: brigada.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await updateDoc(doc(database, "brigadas", brigada.id), {
      kilometrajeActual: values.km_final,
      updatedAt: new Date(),
    });
    form.reset();
    if (onClose) onClose();
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{modo === 'editar' ? 'Editar registro de combustible' : 'Registrar carga de combustible'}</DialogTitle>
        <DialogDescription>
          Brigada: <span className="font-semibold">{brigada.nombre}</span>
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="galones"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Galones</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={0.01} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="precio_galon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio por galón</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={0.01} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="km_inicial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kilometraje inicial</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="km_final"
              rules={{
                validate: value =>
                  value >= form.getValues("km_inicial") || "El kilometraje final no puede ser menor al inicial"
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kilometraje final</FormLabel>
                  <FormControl>
                    <Input type="number" min={form.getValues("km_inicial")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="referencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referencia</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormDescription>Ticket, factura o referencia de la carga</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? (modo === 'editar' ? 'Guardando...' : 'Registrando...') : (modo === 'editar' ? 'Guardar cambios' : 'Registrar')}
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
            )}
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
} 