import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './index.css';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
        },
    },
});
const root = createRoot(document.getElementById('root'));
root.render(_jsx(StrictMode, { children: _jsxs(QueryClientProvider, { client: queryClient, children: [_jsx(App, {}), import.meta.env.MODE === 'development' && (_jsx(ReactQueryDevtools, { buttonPosition: 'bottom-left' }))] }) }));
