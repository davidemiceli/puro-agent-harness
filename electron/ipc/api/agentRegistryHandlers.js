import path from 'node:path';
import { readFile, glob } from 'node:fs/promises';
import matter from 'gray-matter';


export default {

    agentRegistryList: getSettings => async () => {
        try {
            const res = { data: [], error: null };
            const settings = await getSettings();
            const agentRegistryPath = settings.agent_registry_folder;
            if (!agentRegistryPath) return res;
            const globOptions = {
                withFileTypes: true,
                cwd: agentRegistryPath
            };
            const it = glob('**/*', globOptions);
            for await (const dirent of it) {
                const fullPath = path.join(dirent.parentPath, dirent.name);
                const relativePath = path.relative(agentRegistryPath, fullPath);
                const isDirectory = dirent.isDirectory();
                const item = { fullPath, relativePath, isDirectory };
                if (item) res.data.push(item);
            }
            return res;
        } catch(err) {
            return { data: null, error: err };
        }
    },

    agentRegistryGet: getSettings => async (event, filename) => {
        try {
            const settings = await getSettings();
            const agentRegistryPath = settings.agent_registry_folder;
            if (!agentRegistryPath) throw new Error('Not valid agent registry path');
            const agentRegistryFilenamePath = path.join(agentRegistryPath, filename);
            const md = await readFile(agentRegistryFilenamePath, 'utf-8');
            const { data, content } = matter(md);
            const fileName = path.basename(filename, '.md');
            const item = {
                content: content.trim(),
                name: data.name || fileName,
                data,
                description: data.description || ''
            };
            return { data: item, error: null };
        } catch(err) {
            return { data: null, error: err };
        }
    },

};
