import path from 'node:path';
import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { validateName } from '../validators.js';
import { getCurrentWorkspaceDataPath } from '../appWorkspaces.js';


const getSessionPath = async () => {
    const p = await getCurrentWorkspaceDataPath();
    return p ? path.join(p, 'sessions') : null;
};

export default {

    sessionList: async () => {
        const res = { data: null, error: null };
        try {
            const sessionPath = await getSessionPath();
            const files = sessionPath ? await readdir(sessionPath, { withFileTypes: true }) : []; // withFileTypes=true allows to ignores sub-folders
            res.data = files ? files.map(f => f.name.replace('.json', '')) : [];
        } catch (err) {
            if (err.code !== 'ENOENT') {
                res.error = err;
                console.error(err);
            }
        }
        return res;
    },

    sessionLoad: async (event, name) => {
        const res = { data: null, error: null };
        try {
            validateName(name);
            const sessionPath = await getSessionPath();
            const sessionName = path.join(sessionPath, `${name}.json`);
            const data = await readFile(sessionName, 'utf-8');
            res.data = JSON.parse(data);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                res.error = err;
                console.error(err);
            }
        }
        return res;
    },

    sessionSave: async (event, name, value) => {
        try {
            validateName(name);
            const sessionPath = await getSessionPath();
            const sessionName = path.join(sessionPath, `${name}.json`);
            await writeFile(sessionName, value);
            return { data: true, error: null };
        } catch (err) {
            console.error(err);
            return { data: null, error: err };
        }
    },

    sessionDelete: async (event, name) => {
        try {
            validateName(name);
            const sessionPath = await getSessionPath();
            const sessionName = path.join(sessionPath, `${name}.json`);
            await unlink(sessionName);
            return { data: true, error: null };
        } catch (err) {
            console.error(err);
            return { data: null, error: err };
        }
    }

};
