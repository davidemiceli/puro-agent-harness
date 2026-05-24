import { app, BrowserWindow, Menu, protocol, nativeImage, dialog } from 'electron/main';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import protocolHandlers from './protocol/protocolHandler.js';
import registerHandlers from './ipc/api/index.js';
import pkg from '../package.json' with { type: 'json' };

// Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.name = pkg.name;

// Register the protocol name BEFORE the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { standard: true, secure: true, allowServiceWorkers: true } }
]);

function createWindow() {
    // This removes the menu bar globally
    Menu.setApplicationMenu(null);

    const preloadFilename = path.join(__dirname, 'preload/preload.js');
    const iconImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/icon_128.png'));

    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        icon: iconImage,
        show: false, // Hide the window initially (to maximize window later)
        webPreferences: {
            preload: preloadFilename,
            sandbox: false,
            contextIsolation: true,
        }
    });

    // Define your safe root directory (Absolute Path)
    const DIST_ROOT = path.resolve(__dirname, 'dist');

    // Handle the protocol (serving the files)
    protocolHandlers(protocol, __dirname, DIST_ROOT);

    const isDev = process.env.NODE_ENV === 'dev';
    if (app.isPackaged || !isDev) {
        // Production: Load the secure custom protocol to get the built index.html
        win.loadURL('app://index.html');
    } else {
        // In development, load the Vite dev server
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools();
    }

    win.once('ready-to-show', () => {
        win.maximize();
        win.show();
    });
}

app.whenReady().then(() => {

    // Register APIs Handlers
    registerHandlers();

    // Start app
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);

    dialog.showErrorBox('Unexpected Error', reason.stack || reason.message);

    // app.relaunch();
    app.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('CRITICAL: Uncaught Exception:', error);
});
