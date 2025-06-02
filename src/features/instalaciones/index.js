import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useListarInstalaciones } from '@/api/hooks';
import { Main } from '@/components/layout/main';
export default function Instalaciones() {
    const { listarInstalaciones, loading, error } = useListarInstalaciones();
    useEffect(() => {
        listarInstalaciones();
    }, [listarInstalaciones]);
    return (_jsx(_Fragment, { children: _jsxs(Main, { children: [_jsx("div", { className: 'mb-2 flex items-center justify-between space-y-2 flex-wrap', children: _jsxs("div", { children: [_jsx("h2", { className: 'text-2xl font-bold tracking-tight', children: "Instalaciones" }), _jsx("p", { className: 'text-muted-foreground', children: "Gestiona las instalaciones del servicio aqu\u00ED." })] }) }), _jsx("div", { className: '-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0', children: loading ? (_jsx("div", { className: 'w-full text-center py-8', children: "Cargando instalaciones..." })) : error ? (_jsx("div", { className: 'w-full text-center text-red-500 py-8', children: error })) : (_jsx("div", { children: _jsx("h2", { children: "Instalaciones" }) })) })] }) }));
}
