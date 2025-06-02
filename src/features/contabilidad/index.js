import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
export default function Contabilidad() {
    return (_jsxs("div", { className: 'space-y-4', children: [_jsx("h1", { className: 'text-3xl font-bold', children: "Contabilidad" }), _jsxs("ul", { className: 'list-disc pl-6 space-y-2', children: [_jsx("li", { children: _jsx(Link, { to: '/contabilidad/diario-general', children: "Diario General" }) }), _jsx("li", { children: _jsx(Link, { to: '/contabilidad/asientos', children: "Asientos Contables" }) }), _jsx("li", { children: _jsx(Link, { to: '/contabilidad/cuentas', children: "Cuentas" }) }), _jsx("li", { children: _jsx(Link, { to: '/contabilidad/libro-diario', children: "Libro Diario" }) }), _jsx("li", { children: _jsx(Link, { to: '/contabilidad/reportes', children: "Reportes" }) })] })] }));
}
