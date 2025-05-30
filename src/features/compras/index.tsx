import { Link } from 'react-router-dom'

export default function Compras() {
  return (
    <div className='space-y-4'>
      <h1 className='text-3xl font-bold'>Compras</h1>
      <ul className='list-disc pl-6 space-y-2'>
        <li><Link to='/compras/gastos'>Gastos / Pagos</Link></li>
        <li><Link to='/compras/pagos-recurrentes'>Pagos Recurrentes</Link></li>
        <li><Link to='/compras/ordenes'>Órdenes de Compra</Link></li>
        <li><Link to='/compras/gastos-menores'>Gastos Menores</Link></li>
        <li><Link to='/compras/proveedores'>Proveedores</Link></li>
      </ul>
    </div>
  )
} 