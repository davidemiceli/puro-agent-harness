import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig({
    root: 'src',
    plugins: [
        devtools(),
        solidPlugin()
    ],
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version)
    },
    resolve: {
        alias: {
            '@/src': path.resolve(__dirname, './src')
        }
    },
    server: {
        port: 3000
    },
    build: {
        outDir: '../electron/dist',
        target: 'esnext',
        emptyOutDir: true
    }
});
