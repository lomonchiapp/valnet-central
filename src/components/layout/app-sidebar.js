import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, } from '@/components/ui/sidebar';
import { NavUser } from '@/components/layout/nav-user';
import { sidebarData } from './data/sidebar-data';
import { NavGroup } from './nav-group';
import icon from '/images/icon.png';
import logo from '/valdesk-logo.png';
export function AppSidebar({ ...props }) {
    const [collapsed, setCollapsed] = useState(false);
    // Track sidebar collapse state
    useEffect(() => {
        const handleSidebarChange = () => {
            // Check if sidebar has the data-collapsed="true" attribute
            const sidebarElement = document.querySelector('[data-collapsed]');
            if (sidebarElement) {
                const isCollapsed = sidebarElement.getAttribute('data-collapsed') === 'true';
                setCollapsed(isCollapsed);
            }
        };
        // Initial check
        handleSidebarChange();
        // Set up a MutationObserver to watch for changes to the data-collapsed attribute
        const observer = new MutationObserver(handleSidebarChange);
        const sidebarElement = document.querySelector('[data-collapsed]');
        if (sidebarElement) {
            observer.observe(sidebarElement, {
                attributes: true,
                attributeFilter: ['data-collapsed'],
            });
        }
        return () => observer.disconnect();
    }, []);
    return (_jsxs(Sidebar, { collapsible: 'icon', variant: 'floating', ...props, children: [_jsx(SidebarHeader, { children: collapsed ? (_jsx("img", { src: icon, alt: 'icon', className: 'w-10 h-10 mx-auto' })) : (_jsx("img", { src: logo, alt: 'logo', className: 'w-48 h-auto pl-4' })) }), _jsx(SidebarContent, { children: sidebarData.navGroups.map((props) => (_jsx(NavGroup, { ...props }, props.title))) }), _jsx(SidebarFooter, { children: _jsx(NavUser, {}) }), _jsx(SidebarRail, {})] }));
}
