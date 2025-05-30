import { Link } from 'react-router-dom'

export default function Contabilidad() {
  return (
    <div className='space-y-4'>
      <h1 className='text-3xl font-bold'>Contabilidad</h1>
      <ul className='list-disc pl-6 space-y-2'>
        <li><Link to='/contabilidad/diario-general'>Diario General</Link></li>
        <li><Link to='/contabilidad/asientos'>Asientos Contables</Link></li>
        <li><Link to='/contabilidad/cuentas'>Cuentas</Link></li>
        <li><Link to='/contabilidad/libro-diario'>Libro Diario</Link></li>
        <li><Link to='/contabilidad/reportes'>Reportes</Link></li>
      </ul>
    </div>
  )
} 