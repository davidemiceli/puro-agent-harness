import path from 'node:path';
import { defineConfig } from 'vitest/config';
import solidPlugin from 'vite-plugin-solid';


export default defineConfig({
    plugins: [solidPlugin()],
    cacheDir: path.resolve(__dirname, './node_modules/.vite'),
    resolve: {
        conditions: ['development', 'browser'],
        alias: {
            '@/src': path.resolve(__dirname, './src')
        }
    },
    test: {
        environment: 'jsdom',
        globals: true
    },
});