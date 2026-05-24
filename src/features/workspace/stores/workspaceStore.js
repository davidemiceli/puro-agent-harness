import { createResource, createSignal } from 'solid-js';
import APIs from '@/src/services/apis';


const [ workspaces, { refetch } ] = createResource(() => APIs.getWorkspace());

const [workspaceCurrent, setWorkspaceCurrent] = createSignal(null);
const [loading, setLoading] = createSignal(false);

export { workspaces, workspaceCurrent, loading };

export const workspaceActions = {

    new: async () => {
        setLoading(true);
        try {
            const path = await APIs.openWorkspace();
            if (path) {
                await APIs.addWorkspace(path);
                setWorkspaceCurrent(path);
                await refetch();
            }
        } catch(err) {
            console.error('Error to load workspace data', err);
        } finally {
            setLoading(false);
        }
    },

    select: async (path) => {
        setLoading(true);
        try {
            await APIs.addWorkspace(path);
            setWorkspaceCurrent(path);
            await refetch();
        } catch (err) {
            console.error('Error to save context', err);
        } finally {
            setLoading(false);
        }
    },

    delete: async (path) => {
        setLoading(true);
        try {
            await APIs.deleteWorkspace(path);
            if (workspaceCurrent() === path) setWorkspaceCurrent(null);
            await refetch();
        } catch (err) {
            console.error('Error to save context', err);
        } finally {
            setLoading(false);
        }
    },

};
