import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarRail, } from '@/components/ui/sidebar';
import { NavUser } from '@/components/layout/nav-user';
import { sidebarData } from './data/sidebar-data';
import { NavGroup } from './nav-group';
export function AppSidebar({ ...props }) {
    // Track sidebar collapse state (mantener si se usa en otro lado)
    useEffect(() => {
        const handleSidebarChange = () => {
            // No se usa collapsed, solo mantener si es necesario
        };
        handleSidebarChange();
        const observer = new MutationObserver(handleSidebarChange);
        const element = document.querySelector('[data-collapsed]');
        if (element) {
            observer.observe(element, {
                attributes: true,
                attributeFilter: ['data-collapsed'],
            });
        }
        return () => observer.disconnect();
    }, []);
    return (_jsxs(Sidebar, { collapsible: 'icon', className: 'fixed z-0 left-0 bg-white border-r border-slate-200 mt-20 shadow-sm', variant: 'floating', ...props, children: [_jsx(SidebarContent, { className: 'mt-4 px-0 overflow-y-auto scrollbar-hide', children: sidebarData.navGroups.map((props) => (_jsx(NavGroup, { ...props, itemClassName: 'text-xs px-2 py-1 gap-2 hover:bg-slate-100 hover:text-primary rounded-md transition-colors', titleClassName: 'text-[0.7rem] font-semibold text-slate-500 uppercase px-2 py-1 mb-1' }, props.title))) }), _jsx(SidebarFooter, { className: 'px-2 py-2', children: _jsx(NavUser, {}) }), _jsx(SidebarRail, {})] }));
}
