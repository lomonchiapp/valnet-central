import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavItem } from '@/components/layout/nav-item';
export const NavGroup = ({ title, items, itemClassName = '', titleClassName = '', }) => {
    const [expanded, setExpanded] = useState(true);
    return (_jsxs("div", { className: 'mb-4', children: [_jsxs(Button, { variant: 'ghost', className: `w-full flex justify-between items-center font-medium ${titleClassName}`, onClick: () => setExpanded(!expanded), children: [_jsx("span", { children: title }), expanded ? (_jsx(ChevronDown, { className: 'h-4 w-4' })) : (_jsx(ChevronRight, { className: 'h-4 w-4' }))] }), expanded && (_jsx("div", { className: 'mt-2 space-y-1', children: items.map((item) => {
                    if (!item.url)
                        return null;
                    return (_jsx(NavItem, { title: item.title, url: item.url, icon: item.icon, badge: item.badge, className: itemClassName }, item.url));
                }) }))] }));
};
NavGroup.displayName = 'NavGroup';
