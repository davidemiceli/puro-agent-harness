import { BaseAPIs } from './base';


class APIs extends BaseAPIs {

    async getWorkspace() {
        const resp = await window.api.workspace.get();
        if (resp.error) throw new Error('Failed to fetch workspace');
        return resp.data;
    }

    async addWorkspace(path) {
        const resp = await window.api.workspace.add(path);
        if (resp.error) throw new Error('Failed to add workspace');
        return resp.data;
    }

    async openWorkspace() {
        const resp = await window.api.workspace.open();
        if (resp.error) throw new Error('Failed to open workspace');
        return resp.data;
    }

    async deleteWorkspace(path) {
        const resp = await window.api.workspace.delete(path);
        if (resp.error) throw new Error('Failed to delete workspace');
        return resp.data;
    }

    async getSessionList() {
        const resp = await window.api.session.list();
        if (resp.error) throw new Error('Failed to list session');
        return resp.data;
    }

    async getSession(name) {
        const resp = await window.api.session.load(name);
        if (resp.error) throw new Error('Failed to fetch session');
        return resp.data;
    }

    async saveSession(name, data) {
        const resp = await window.api.session.save(name, data);
        if (resp.error) throw new Error('Failed to save session');
        return resp.data;
    }

    async deleteSession(name) {
        const resp = await window.api.session.delete(name);
        if (resp.error) throw new Error('Failed to delete session');
        return resp.data;
    }

    async getSettings() {
        const resp = await window.api.settings.get();
        if (resp.error) throw new Error('Failed to fetch settings');
        return resp.data;
    }

    async getDefaultSettings() {
        const resp = await window.api.settings.default();
        if (resp.error) throw new Error('Failed to fetch default settings');
        return resp.data;
    }

    async saveSettings(data) {
        const resp = await window.api.settings.save(data);
        if (resp.error) throw new Error('Failed to save settings');
        return resp.data;
    }

    async clipboardCopy(text) {
        const resp = await window.api.clipboard.copy(text);
        if (resp.error) throw new Error('Failed to copy to clipboard');
        return resp.data;
    }

    async listAgentRegistry() {
        const resp = await window.api.agentRegistry.list();
        if (resp.error) throw new Error('Failed to fetch agent registry list');
        return resp.data;
    }

    async getFileAgentRegistry(filename) {
        const resp = await window.api.agentRegistry.get(filename);
        if (resp.error) throw new Error('Failed to fetch agent registry file');
        return resp.data;
    }

    async getFiles() {
        const resp = await window.api.file.select();
        if (resp.error) throw new Error('Failed to fetch file content');
        return resp.data;
    }

    async getFilesFromWorkspace() {
        const resp = await window.api.file.selectFromWorkspace();
        if (resp.error) throw new Error('Failed to fetch file content from workspace path');
        return resp.data;
    }

    async saveFileDialog(text) {
        const resp = await window.api.file.saveDialog(text);
        if (resp.error) throw new Error('Failed to save file');
        return resp.data;
    }

    async saveFile(filename, text) {
        const resp = await window.api.file.save(filename, text);
        if (resp.error) throw new Error('Failed to save file');
        return resp.data;
    }

    async listFolders() {
        const resp = await window.api.folder.list();
        if (resp.error) throw new Error('Failed to list folder');
        return resp.data;
    }

    async listFiles() {
        const resp = await window.api.file.list();
        if (resp.error) throw new Error('Failed to list files');
        return resp.data;
    }

    async getFileContent(filename) {
        const resp = await window.api.file.getContent(filename);
        if (resp.error) throw new Error('Failed to read file content');
        return resp.data;
    }

}

export default new APIs();
