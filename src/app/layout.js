import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { NotificacionesDropdown } from '@/features/notificaciones/components/NotificacionesDropdown';
export default function RootLayout({ children, }) {
    return (_jsx("html", { lang: 'es', children: _jsx("body", { children: _jsx("div", { className: 'min-h-screen bg-background', children: _jsxs("div", { className: 'flex', children: [_jsx(AppSidebar, {}), _jsxs("div", { className: 'flex-1', children: [_jsx("header", { className: 'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', children: _jsxs("div", { className: 'container flex h-14 items-center', children: [_jsx("div", { className: 'mr-4 flex', children: _jsx(Link, { to: '/', className: 'mr-6 flex items-center space-x-2', children: _jsx("span", { className: 'font-bold', children: "Valnet Central" }) }) }), _jsx("div", { className: 'flex flex-1 items-center justify-between space-x-2 md:justify-end', children: _jsx("div", { className: 'w-full flex-1 md:w-auto md:flex-none', children: _jsx(NotificacionesDropdown, {}) }) })] }) }), _jsx("main", { className: 'flex-1 space-y-4 p-8 pt-6', children: children })] })] }) }) }) }));
}
