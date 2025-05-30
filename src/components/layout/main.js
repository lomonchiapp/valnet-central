import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export const Main = ({ fixed, ...props }) => {
    return (_jsx("main", { className: cn('peer-[.header-fixed]/header:mt-16', 'px-4 py-6', fixed && 'fixed-main flex flex-col flex-grow overflow-hidden'), ...props }));
};
Main.displayName = 'Main';
