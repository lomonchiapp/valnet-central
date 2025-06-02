import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5174,
        host: '0.0.0.0',
        open: true,
        proxy: {
            '/mikrowisp-api': {
                target: 'http://38.57.232.66:3031',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/mikrowisp-api/, ''),
                secure: false,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            // fix loading all icon chunks in dev mode
            // https://github.com/tabler/tabler-icons/issues/1233
            '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
        },
    },
});
