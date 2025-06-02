import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function FeatureLayout({ children, title, description, actions, }) {
    return (_jsxs("div", { className: 'container mx-auto py-6 space-y-6', children: [_jsxs("div", { className: 'flex justify-between items-center', children: [_jsxs("div", { children: [_jsx("h1", { className: 'text-3xl font-bold tracking-tight', children: title }), description && (_jsx("p", { className: 'text-muted-foreground', children: description }))] }), actions && _jsx("div", { className: 'flex gap-2', children: actions })] }), children] }));
}
