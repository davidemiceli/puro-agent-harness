import path from 'node:path';
import { stat, readFile, writeFile } from 'node:fs/promises';
import { appPath } from './appSettings.js';

export const workspacesPath = path.join(appPath, 'workspaces.json');
export const workspaceDataFolder = '.agent-registry';

const defaultData = () => [];

export async function getConfigWorkspaces() {
    try {
        const content = await readFile(workspacesPath, 'utf-8');
        return JSON.parse(content);
    } catch {
        return defaultData();
    }
}

export async function getOrCreateConfigWorkspaces() {
    const exists = await stat(workspacesPath).catch(() => false);
    if (!exists) {
        await saveConfigWorkspaces(defaultData());
        return defaultData();
    }
    return await getConfigWorkspaces();
}

export async function saveConfigWorkspaces(data) {
    await writeFile(workspacesPath, JSON.stringify(data, null, 2));
}

export async function getCurrentWorkspace() {
    const workspace = await getConfigWorkspaces();
    return workspace && workspace[0];
}

export async function getCurrentWorkspaceDataPath() {
    const workspaceCurrent = await getCurrentWorkspace();
    return workspaceCurrent ? path.join(workspaceCurrent, workspaceDataFolder) : null;
}
