import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Link } from 'react-router-dom';
export const NavGroup = ({ title, items }) => {
    return (_jsxs("div", { className: 'mb-4', children: [_jsx("div", { className: 'px-4 py-2 text-xs font-bold uppercase text-muted-foreground tracking-wider', children: title }), _jsx("ul", { className: 'space-y-1', children: items.map((item) => (_jsxs("li", { children: ['url' in item && item.url ? (_jsxs(Link, { to: item.url, className: 'flex items-center gap-2 px-4 py-2 rounded hover:bg-accent transition-colors', children: [item.icon &&
                                    React.createElement(item.icon, { className: 'w-4 h-4' }), _jsx("span", { children: item.title }), item.badge && (_jsx("span", { className: 'ml-auto bg-primary text-xs px-2 py-0.5 rounded-full', children: item.badge }))] })) : (_jsxs("div", { className: 'px-4 py-2 text-muted-foreground flex items-center gap-2', children: [item.icon &&
                                    React.createElement(item.icon, { className: 'w-4 h-4' }), _jsx("span", { children: item.title }), item.badge && (_jsx("span", { className: 'ml-auto bg-primary text-xs px-2 py-0.5 rounded-full', children: item.badge }))] })), 'items' in item &&
                            Array.isArray(item.items) &&
                            item.items.length > 0 && (_jsx("ul", { className: 'ml-4 border-l border-muted-foreground/20 pl-2 mt-1 space-y-1', children: item.items.map((subitem) => (_jsx("li", { children: _jsxs(Link, { to: subitem.url, className: 'flex items-center gap-2 px-2 py-1 rounded hover:bg-accent transition-colors text-sm', children: [subitem.icon &&
                                            React.createElement(subitem.icon, {
                                                className: 'w-3 h-3',
                                            }), _jsx("span", { children: subitem.title }), subitem.badge && (_jsx("span", { className: 'ml-auto bg-primary text-xs px-2 py-0.5 rounded-full', children: subitem.badge }))] }) }, subitem.title))) }))] }, item.title))) })] }));
};
NavGroup.displayName = 'NavGroup';
