import { dialog } from 'electron/main';
import path from 'node:path';
import { initDataFolders, dataFolderPaths } from '../appSettings.js';
import { getOrCreateConfigWorkspaces, getConfigWorkspaces, saveConfigWorkspaces, workspaceDataFolder } from '../appWorkspaces.js';


export default {

    workspaceGet: async () => {
        try {
            const data = await getOrCreateConfigWorkspaces();
            return { data, error: null };
        } catch (err) {
            console.error(err);
            return { data: null, error: err };
        }
    },

    workspaceAdd: async (event, newPath) => {
        try {
            let data = await getOrCreateConfigWorkspaces();
            const MAX_RECENT = 48;
            data = data.filter(p => p !== newPath);
            data.unshift(newPath);
            data = data.slice(0, MAX_RECENT);
            await saveConfigWorkspaces(data);
            return { data, error: null };
        } catch (err) {
            console.error(err);
            return { data: null, error: err };
        }
    },

    workspaceOpen: async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
        if (canceled) return { data: null, error: null };
        try {
            const folderPath = filePaths.at(0);
            const configDir = path.join(folderPath, workspaceDataFolder);
            // Create required agent-registry subfolders inside workspace folder if it not exist
            await initDataFolders(configDir, dataFolderPaths);
            return { data: folderPath, error: null };
        } catch (err) {
            console.error(err);
            return { data: null, error: err };
        }
    },

    workspaceDelete: async (event, selectedPath) => {
        try {
            let data = await getConfigWorkspaces();
            data = data.filter(w => w !== selectedPath);
            await saveConfigWorkspaces(data);
            return { data, error: null };
        } catch (err) {
            console.error(err);
            return { data: null, error: err };
        }
    }

};
