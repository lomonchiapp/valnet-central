import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input } from './input';
export function NumericInput({ value, onChange, prefix = '', ...props }) {
    const formatValue = (val) => {
        return new Intl.NumberFormat('es-DO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(val);
    };
    const handleChange = (e) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        const numberValue = parseFloat(value) || 0;
        onChange(numberValue);
    };
    return (_jsxs("div", { className: 'relative', children: [_jsx("span", { className: 'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground', children: prefix }), _jsx(Input, { ...props, type: 'text', value: formatValue(value), onChange: handleChange, className: `pl-12 text-right ${props.className}` })] }));
}
