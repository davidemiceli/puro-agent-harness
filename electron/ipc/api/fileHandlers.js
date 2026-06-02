import path from 'node:path';
import { readFile, writeFile, glob } from 'node:fs/promises';
import { isIgnoredFactory } from './helpers.js';


const fileSelect = dialog => async (event, defaultPath) => {
    const options = {
        properties: ['openFile'],
        filters: [
            { name: 'All Files', extensions: ['*'] }
        ]
    };
    if (defaultPath) options.defaultPath = defaultPath;
    const { canceled, filePaths } = await dialog.showOpenDialog(options);
    try {
        const res = { data: [], error: null };
        if (canceled) return res;
        for (const filePath of filePaths) {
            const content = await readFile(filePath, 'utf-8');
            res.data.push({
                path: filePath,
                content: content,
                name: path.basename(filePath)
            });
        }
        return res;
    } catch (err) {
        return { data: null, error: err };
    }
};

export default {

    fileSelect,

    folderSelect: dialog => async (event, defaultPath) => {
        const options = {
            properties: ['openDirectory']
        };
        if (defaultPath) options.defaultPath = defaultPath;
        const { canceled, filePaths } = await dialog.showOpenDialog(options);
        try {
            const data = canceled ? null : filePaths[0];
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    },

    fileSelectFromWorkspace: (dialog, getCurrentWorkspace) => async (event) => {
        const workspaceCurrentPath = await getCurrentWorkspace();
        const r = await fileSelect(dialog)(event, workspaceCurrentPath);
        if (r.data) r.data.forEach(f => {
            f.path = path.relative(workspaceCurrentPath, f.path);
        });
        return r;
    },

    fileSaveDialog: (dialog, getCurrentWorkspace) => async (event, content) => {
        const workspaceCurrentPath = await getCurrentWorkspace();
        const options = {
            buttonLabel: 'Save',
            defaultPath: workspaceCurrentPath,
            filters: [
                { name: 'All Files', extensions: ['*'] }
            ]
        };
        const { filePath, canceled } = await dialog.showSaveDialog(options);
        try {
            const res = { data: false, error: null };
            if (!canceled && filePath) {
                await writeFile(filePath, content);
                res.data = true;
            }
            return res;
        } catch(err) {
            return { data: null, error: err };
        }
    },

    fileList: getCurrentWorkspace => async () => {
        try {
            const res = { data: [], error: null };
            const workspaceCurrentPath = await getCurrentWorkspace();
            if (!workspaceCurrentPath) return res;
            const isIgnored = await isIgnoredFactory(path.join(workspaceCurrentPath, '.aiignore'));
            const globOptions = {
                withFileTypes: true,
                cwd: workspaceCurrentPath
            };
            const it = glob('{**,.**}/{*,.*}', globOptions);
            for await (const dirent of it) {
                const fullPath = path.resolve(workspaceCurrentPath, dirent.parentPath, dirent.name);
                const relativePath = path.relative(workspaceCurrentPath, fullPath);
                if (!isIgnored(relativePath)) {
                    const isDirectory = dirent.isDirectory();
                    const item = { relativePath, isDirectory };
                    if (item) res.data.push(item);
                }
            }
            return res;
        } catch(err) {
            return { data: null, error: err };
        }
    },

    fileContent: getCurrentWorkspace => async (event, filename) => {
        try {
            const res = { data: false, error: null };
            const workspaceCurrentPath = await getCurrentWorkspace();
            res.data = await readFile(path.join(workspaceCurrentPath, filename), 'utf-8');
            return res;
        } catch(err) {
            return { data: null, error: err };
        }
    },

    fileSaveContent: getCurrentWorkspace => async (event, filename, content) => {
        try {
            const workspaceCurrentPath = await getCurrentWorkspace();
            await writeFile(path.join(workspaceCurrentPath, filename), content);
            return { data: true, error: null };
        } catch(err) {
            return { data: null, error: err };
        }
    }
};