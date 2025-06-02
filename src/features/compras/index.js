import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
export default function Compras() {
    return (_jsxs("div", { className: 'space-y-4', children: [_jsx("h1", { className: 'text-3xl font-bold', children: "Compras" }), _jsxs("ul", { className: 'list-disc pl-6 space-y-2', children: [_jsx("li", { children: _jsx(Link, { to: '/compras/gastos', children: "Gastos / Pagos" }) }), _jsx("li", { children: _jsx(Link, { to: '/compras/pagos-recurrentes', children: "Pagos Recurrentes" }) }), _jsx("li", { children: _jsx(Link, { to: '/compras/ordenes', children: "\u00D3rdenes de Compra" }) }), _jsx("li", { children: _jsx(Link, { to: '/compras/gastos-menores', children: "Gastos Menores" }) }), _jsx("li", { children: _jsx(Link, { to: '/compras/proveedores', children: "Proveedores" }) })] })] }));
}
