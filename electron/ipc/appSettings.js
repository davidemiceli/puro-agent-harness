import { app } from 'electron/main';
import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

// App path is the folder where configurations, workspaces, and data are stored
export const appPath = app.getPath('userData');

export const dataPath = path.join(appPath, 'data');

const settingPath = path.join(appPath, 'config.json');

export const dataFolderPaths = [
    'sessions'
];

export const appRequiredFoldersPaths = [...dataFolderPaths];

const defaultData = {
    provider: {
        name: 'ollama',
        host: 'http://localhost:11434',
        model: null
    },
    agent_registry_folder: '',
    context_window_size: 32000
};

export const initDataFolders = async (startPath, folderPathsList) => {
    const folders = folderPathsList.map(p => path.join(startPath, p));
    for (const p of folders) {
        await mkdir(p, { recursive: true });
    }
};

export function getDefaultSettings() {
    return JSON.stringify(defaultData, null, 4);
}

export async function getSettings() {
    try {
        const content = await readFile(settingPath, 'utf-8');
        return JSON.parse(content);
    } catch {
        return defaultData;
    }
}

export async function getOrCreateSettings() {
    // Create local agent-registry folder with its subfolders if it not exist
    await initDataFolders(dataPath, appRequiredFoldersPaths);
    try {
        // 'wx' flag: Open for writing, but fails if the path exists.
        await writeFile(settingPath, JSON.stringify(defaultData, null, 4), { flag: 'wx' });
        return defaultData;
    } catch (err) {
        // EEXIST means the file is already there
        if (err.code === 'EEXIST') return await getSettings();
        throw err;
    }
}

export async function saveSettings(data) {
    writeFile(settingPath, JSON.stringify(data, null, 4));
}
