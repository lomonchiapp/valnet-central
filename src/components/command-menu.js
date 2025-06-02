import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { IconDeviceLaptop, IconMoon, IconSun } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/context/search-context';
import { useTheme } from '@/context/theme-context';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, } from '@/components/ui/command';
import { sidebarData } from './layout/data/sidebar-data';
import { ScrollArea } from './ui/scroll-area';
export function CommandMenu() {
    const navigate = useNavigate();
    const { setTheme } = useTheme();
    const { open, setOpen } = useSearch();
    const runCommand = React.useCallback((command) => {
        setOpen(false);
        command();
    }, [setOpen]);
    return (_jsxs(CommandDialog, { modal: true, open: open, onOpenChange: setOpen, children: [_jsx(CommandInput, { placeholder: 'Type a command or search...' }), _jsx(CommandList, { children: _jsxs(ScrollArea, { type: 'hover', className: 'h-72 pr-1', children: [_jsx(CommandEmpty, { children: "No results found." }), sidebarData.navGroups.map((group) => (_jsx(CommandGroup, { heading: group.title, children: group.items.map((navItem, i) => {
                                if (navItem.url)
                                    return (_jsx(CommandItem, { value: navItem.title, onSelect: () => {
                                            runCommand(() => navigate(navItem.url));
                                        }, children: navItem.title }, `${navItem.url}-${i}`));
                                return navItem.items?.map((subItem, i) => (_jsx(CommandItem, { value: subItem.title, onSelect: () => {
                                        runCommand(() => navigate(subItem.url));
                                    }, children: subItem.title }, `${subItem.url}-${i}`)));
                            }) }, group.title))), _jsx(CommandSeparator, {}), _jsxs(CommandGroup, { heading: 'Theme', children: [_jsxs(CommandItem, { onSelect: () => runCommand(() => setTheme('light')), children: [_jsx(IconSun, {}), " ", _jsx("span", { children: "Light" })] }), _jsxs(CommandItem, { onSelect: () => runCommand(() => setTheme('dark')), children: [_jsx(IconMoon, { className: 'scale-90' }), _jsx("span", { children: "Dark" })] }), _jsxs(CommandItem, { onSelect: () => runCommand(() => setTheme('system')), children: [_jsx(IconDeviceLaptop, {}), _jsx("span", { children: "System" })] })] })] }) })] }));
}
