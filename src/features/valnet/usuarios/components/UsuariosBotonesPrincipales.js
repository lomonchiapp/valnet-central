import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { IconUserPlus, IconMailForward, IconFileExport, IconFileImport, IconSearch, } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export function UsuariosBotonesPrincipales({ setOpen, }) {
    const [busqueda, setBusqueda] = useState('');
    return (_jsxs("div", { className: 'flex flex-wrap items-center gap-3', children: [_jsxs("div", { className: 'relative flex-1 min-w-[200px]', children: [_jsx(IconSearch, { size: 18, className: 'absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground' }), _jsx(Input, { placeholder: 'Buscar usuarios...', className: 'pl-9 max-w-xs', value: busqueda, onChange: (e) => setBusqueda(e.target.value) })] }), _jsxs("div", { className: 'flex flex-wrap items-center gap-2', children: [_jsxs(Button, { variant: 'default', className: 'gap-2', onClick: () => setOpen('agregar'), children: [_jsx(IconUserPlus, { size: 18 }), _jsx("span", { children: "Nuevo Usuario" })] }), _jsxs(Button, { variant: 'outline', className: 'gap-2', onClick: () => setOpen('invitar'), children: [_jsx(IconMailForward, { size: 18 }), _jsx("span", { children: "Invitar" })] }), _jsxs("div", { className: 'flex gap-1', children: [_jsx(Button, { variant: 'outline', size: 'icon', title: 'Importar usuarios', children: _jsx(IconFileImport, { size: 18 }) }), _jsx(Button, { variant: 'outline', size: 'icon', title: 'Exportar usuarios', children: _jsx(IconFileExport, { size: 18 }) })] })] })] }));
}
