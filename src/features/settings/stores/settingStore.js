import { createResource, createSignal } from 'solid-js';
import APIs from '@/src/services/apis';

const [ settings, { refetch } ] = createResource(() => APIs.getSettings());

const [loading, setLoading] = createSignal(false);

export { settings, loading };

export const settingActions = {

    loadSettings: async () => {
        setLoading(true);
        try {
            await refetch();
        } catch(err) {
            console.error('Error to load configuration', err);
        } finally {
            setLoading(false);
        }
    },

    saveSettings: async (data) => {
        setLoading(true);
        try {
            await APIs.saveSettings(data);
            await refetch();
        } catch (err) {
            console.error('Error to save session data', err);
        } finally {
            setLoading(false);
        }
    },

    getDefaultSettings: async () => {
        setLoading(true);
        try {
            return await APIs.getDefaultSettings();
        } finally {
            setLoading(false);
        }
    },

};
