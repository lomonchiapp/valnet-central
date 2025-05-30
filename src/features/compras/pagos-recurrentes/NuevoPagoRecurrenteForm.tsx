import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

interface ConceptoForm {
  concepto: string
  precio: number
  impuesto: string
  cantidad: number
  observaciones: string
}

interface PagoRecurrenteForm {
  id?: string
  numeracion: string
  cuenta: string
  formaPago: string
  observaciones: string
  contacto: string
  fechaInicio: string
  vigenciaHasta: string
  frecuencia: string
  conceptos: ConceptoForm[]
}

const frecuencias = ['1', '3', '6', '12']
const numeraciones = ['Gasto', 'Compra', 'Servicio']
const cuentas = ['Tarjeta de crédito empresarial', 'Cuenta corriente', 'Caja chica']
const formasPago = ['Efectivo', 'Transferencia', 'Cheque']
const conceptosDisponibles = ['Vacaciones personal de venta', 'Devoluciones en ventas', 'Otros']
const impuestos = ['Impuesto 1', 'Impuesto 2', 'Ninguno']
const contactos = ['Proveedor A', 'Proveedor B', 'Proveedor C']

export default function NuevoPagoRecurrenteForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<PagoRecurrenteForm>({
    numeracion: '',
    cuenta: '',
    formaPago: '',
    observaciones: '',
    contacto: '',
    fechaInicio: '',
    vigenciaHasta: '',
    frecuencia: '',
    conceptos: [],
  })
  const [concepto, setConcepto] = useState('')
  const [precio, setPrecio] = useState('')
  const [impuesto, setImpuesto] = useState('')
  const [cantidad, setCantidad] = useState('1')
  const [obsConcepto, setObsConcepto] = useState('')

  const handleAddConcepto = () => {
    if (!concepto || !precio || !cantidad) {
      toast.error('Completa concepto, precio y cantidad')
      return
    }
    setForm({
      ...form,
      conceptos: [
        ...form.conceptos,
        {
          concepto,
          precio: Number(precio),
          impuesto,
          cantidad: Number(cantidad),
          observaciones: obsConcepto,
        },
      ],
    })
    setConcepto('')
    setPrecio('')
    setImpuesto('')
    setCantidad('1')
    setObsConcepto('')
  }

  const handleRemoveConcepto = (idx: number) => {
    setForm({
      ...form,
      conceptos: form.conceptos.filter((_, i) => i !== idx),
    })
  }

  const subtotal = form.conceptos.reduce((acc, c) => acc + c.precio * c.cantidad, 0)

  return (
    <div>
      <form className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        <div className='space-y-4'>
          <div>
            <label className='block font-medium mb-1'>Numeración *</label>
            <select className='w-full border rounded px-2 py-1' value={form.numeracion} onChange={e => setForm(f => ({ ...f, numeracion: e.target.value }))}>
              <option value=''>Selecciona</option>
              {numeraciones.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className='block font-medium mb-1'>Cuenta *</label>
            <select className='w-full border rounded px-2 py-1' value={form.cuenta} onChange={e => setForm(f => ({ ...f, cuenta: e.target.value }))}>
              <option value=''>Selecciona</option>
              {cuentas.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className='block font-medium mb-1'>Forma de pago *</label>
            <select className='w-full border rounded px-2 py-1' value={form.formaPago} onChange={e => setForm(f => ({ ...f, formaPago: e.target.value }))}>
              <option value=''>Selecciona</option>
              {formasPago.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className='block font-medium mb-1'>Observaciones</label>
            <textarea className='w-full border rounded px-2 py-1' value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} />
          </div>
        </div>
        <div className='space-y-4'>
          <div>
            <label className='block font-medium mb-1'>Contacto</label>
            <select className='w-full border rounded px-2 py-1' value={form.contacto} onChange={e => setForm(f => ({ ...f, contacto: e.target.value }))}>
              <option value=''>Selecciona</option>
              {contactos.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className='block font-medium mb-1'>Fecha de inicio *</label>
            <Input type='date' value={form.fechaInicio} onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))} />
          </div>
          <div>
            <label className='block font-medium mb-1'>Vigencia hasta</label>
            <Input type='date' value={form.vigenciaHasta} onChange={e => setForm(f => ({ ...f, vigenciaHasta: e.target.value }))} />
          </div>
          <div>
            <label className='block font-medium mb-1'>Frecuencia (meses) *</label>
            <select className='w-full border rounded px-2 py-1' value={form.frecuencia} onChange={e => setForm(f => ({ ...f, frecuencia: e.target.value }))}>
              <option value=''>Selecciona</option>
              {frecuencias.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </form>
      <div className='bg-muted rounded-lg p-4 mb-8'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concepto</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Impuesto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Observaciones</TableHead>
              <TableHead>Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {form.conceptos.map((c, i) => (
              <TableRow key={i}>
                <TableCell>{c.concepto}</TableCell>
                <TableCell>{c.precio}</TableCell>
                <TableCell>{c.impuesto}</TableCell>
                <TableCell>{c.cantidad}</TableCell>
                <TableCell>{c.observaciones}</TableCell>
                <TableCell>RD${(c.precio * c.cantidad).toFixed(2)}</TableCell>
                <TableCell>
                  <Button size='icon' variant='ghost' onClick={() => handleRemoveConcepto(i)}>
                    ✕
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <select className='w-full border rounded px-2 py-1' value={concepto} onChange={e => setConcepto(e.target.value)}>
                  <option value=''>Concepto</option>
                  {conceptosDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </TableCell>
              <TableCell>
                <Input type='number' value={precio} onChange={e => setPrecio(e.target.value)} placeholder='Precio' />
              </TableCell>
              <TableCell>
                <select className='w-full border rounded px-2 py-1' value={impuesto} onChange={e => setImpuesto(e.target.value)}>
                  <option value=''>Impuesto</option>
                  {impuestos.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </TableCell>
              <TableCell>
                <Input type='number' value={cantidad} onChange={e => setCantidad(e.target.value)} min={1} placeholder='Cantidad' />
              </TableCell>
              <TableCell>
                <Input value={obsConcepto} onChange={e => setObsConcepto(e.target.value)} placeholder='Descripción' />
              </TableCell>
              <TableCell></TableCell>
              <TableCell>
                <Button size='icon' variant='outline' onClick={handleAddConcepto}>+</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
        <div className='bg-white rounded-lg p-4 shadow border w-full md:w-1/3'>
          <div className='flex justify-between mb-2'>
            <span className='font-semibold'>Subtotal</span>
            <span>RD${subtotal.toFixed(2)}</span>
          </div>
          <div className='flex justify-between font-bold text-lg'>
            <span>Total</span>
            <span>RD${subtotal.toFixed(2)}</span>
          </div>
        </div>
        <div className='flex gap-4 mt-4 md:mt-0'>
          <Button variant='outline' type='button' onClick={onClose}>Cancelar</Button>
          <Button type='button' onClick={() => { toast.success('Pago recurrente guardado'); onClose(); }}>Guardar</Button>
        </div>
      </div>
    </div>
  )
} 