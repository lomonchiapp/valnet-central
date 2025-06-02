import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Link } from 'react-router-dom';
export function NavItem({ title, url, icon, badge, className = '', }) {
    return (_jsxs(Link, { to: url, className: `flex items-center gap-2 px-4 py-2 rounded hover:bg-accent transition-colors ${className}`, children: [icon && React.createElement(icon, { className: 'w-4 h-4' }), _jsx("span", { children: title }), badge && (_jsx("span", { className: 'ml-auto bg-primary text-xs px-2 py-0.5 rounded-full', children: badge }))] }));
}
