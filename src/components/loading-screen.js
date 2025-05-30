import { jsx as _jsx } from "react/jsx-runtime";
export function LoadingScreen() {
    return (_jsx("div", { className: 'fixed inset-0 flex items-center justify-center bg-background', children: _jsx("div", { className: 'h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' }) }));
}
