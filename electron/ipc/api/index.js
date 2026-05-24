import { ipcMain, dialog } from 'electron/main';
import settingsHandlers from './settingsHandlers.js';
import workspaceHandlers from './workspaceHandlers.js';
import sessionHandler from './sessionHandler.js';
import fileHandlers from './fileHandlers.js';
import toolHandlers from './toolHandlers.js';
import agentRegistryHandlers from './agentRegistryHandlers.js';
import miscHandlers from './miscHandlers.js';
import dialogHandlers from './dialogHandlers.js';
import { getSettings } from '../appSettings.js';
import { getCurrentWorkspace } from '../appWorkspaces.js';


export default function registerHandlers() {
    // Settings
    ipcMain.handle('api:settings-get', settingsHandlers.settingsGet),
    ipcMain.handle('api:settings-default', settingsHandlers.settingsDefault),
    ipcMain.handle('api:settings-save', settingsHandlers.settingsSave),

    // Workspace
    ipcMain.handle('api:workspace-get', workspaceHandlers.workspaceGet);
    ipcMain.handle('api:workspace-add', workspaceHandlers.workspaceAdd);
    ipcMain.handle('api:workspace-open', workspaceHandlers.workspaceOpen);
    ipcMain.handle('api:workspace-delete', workspaceHandlers.workspaceDelete);

    // Session
    ipcMain.handle('api:session-list', sessionHandler.sessionList);
    ipcMain.handle('api:session-load', sessionHandler.sessionLoad);
    ipcMain.handle('api:session-save', sessionHandler.sessionSave);
    ipcMain.handle('api:session-delete', sessionHandler.sessionDelete);

    // File
    ipcMain.handle('api:folder-select', fileHandlers.folderSelect(dialog));
    ipcMain.handle('api:file-select', fileHandlers.fileSelect(dialog));
    ipcMain.handle('api:file-select-from-workspace', fileHandlers.fileSelectFromWorkspace(dialog, getCurrentWorkspace));
    ipcMain.handle('api:file-save-dialog', fileHandlers.fileSaveDialog(dialog, getCurrentWorkspace));
    ipcMain.handle('api:file-list', fileHandlers.fileList(getCurrentWorkspace));
    ipcMain.handle('api:file-content', fileHandlers.fileContent(getCurrentWorkspace));
    ipcMain.handle('api:file-save-content', fileHandlers.fileSaveContent(getCurrentWorkspace));

    // Tool
    ipcMain.handle('api:tool-execute-bash', toolHandlers.executeBash);
    ipcMain.handle('api:tool-read-files', toolHandlers.readFiles);
    ipcMain.handle('api:tool-write-file', toolHandlers.writeFile);

    // Agent
    ipcMain.handle('api:agent-registry-list', agentRegistryHandlers.agentRegistryList(getSettings)),
    ipcMain.handle('api:agent-registry-get', agentRegistryHandlers.agentRegistryGet(getSettings)),

    // Other
    ipcMain.handle('api:copy-to-clipboard', miscHandlers.copyToClipboard);

    // Dialog
    ipcMain.handle('api:save-confirmation', dialogHandlers.saveConfirmation);
    ipcMain.handle('api:action-confirmation', dialogHandlers.actionConfirmation);
    ipcMain.on('api:notify-success', dialogHandlers.notifySuccess);
    ipcMain.on('api:notify-error', dialogHandlers.notifyError);
};
