import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
const Progress = React.forwardRef(({ value, max = 100, className, ...props }, ref) => {
    return (_jsx("div", { ref: ref, className: `relative h-3 w-full rounded-full bg-muted ${className || ''}`, ...props, children: _jsx("div", { className: 'absolute left-0 top-0 h-3 rounded-full bg-blue-600 transition-all', style: { width: `${Math.min(100, Math.max(0, value))}%` } }) }));
});
Progress.displayName = 'Progress';
export { Progress };
