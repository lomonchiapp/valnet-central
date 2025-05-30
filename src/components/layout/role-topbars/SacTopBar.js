import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ClipboardPlus, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
export function SacTopBar() {
    const navigate = useNavigate();
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: 'flex-1', children: [_jsx("h2", { className: 'text-xl font-medium text-white', children: "Servicio al Cliente" }), _jsx("p", { className: 'text-sm text-muted-foreground text-slate-300', children: "Gesti\u00F3n de pre-registros y atenci\u00F3n al cliente" })] }), _jsxs("div", { className: 'flex gap-3', children: [_jsxs(Button, { style: { backgroundColor: '#F37021', borderColor: '#F37021' }, className: 'hover:bg-orange-500 text-white', onClick: () => navigate('/ventas/pre-registros/nuevo'), children: [_jsx(ClipboardPlus, { className: 'mr-2 h-4 w-4' }), "Nuevo Pre-Registro"] }), _jsxs(Button, { variant: 'secondary', className: 'bg-white hover:bg-gray-100 text-[#005BAA]', onClick: () => navigate('/ventas/pre-registros'), children: [_jsx(List, { className: 'mr-2 h-4 w-4 text-[#005BAA]' }), "Ver Pre-Registros"] })] })] }));
}
