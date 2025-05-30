import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Label } from './label';
export function PaymentDatePicker({ selectedDay, onChange, className, }) {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    return (_jsxs("div", { className: cn('space-y-2', className), children: [_jsx(Label, { children: "D\u00EDa de pago mensual" }), _jsx("div", { className: 'flex flex-wrap gap-0.5', children: days.map((day) => (_jsx(Button, { type: 'button', variant: 'outline', className: cn('h-7 w-7 p-0 text-xs font-normal', selectedDay === day &&
                        'bg-primary text-primary-foreground hover:bg-primary/90', day > 28 && 'text-muted-foreground'), onClick: () => onChange(day), children: day }, day))) }), selectedDay > 28 && (_jsx("p", { className: 'text-xs text-muted-foreground', children: "Para meses con menos d\u00EDas, el pago se procesar\u00E1 el \u00FAltimo d\u00EDa." }))] }));
}
