import { batch, createResource, createSignal } from 'solid-js';
import { unwrap } from 'solid-js/store';
import APIs from '@/src/services/apis';
import { prompt, setPrompt } from '@/src/features/prompt/stores/promptStore';

const [sessions, { refetch }] = createResource(() => APIs.getSessionList());

const [sessionCurrent, setSessionCurrent] = createSignal(null);
const [loading, setLoading] = createSignal(false);

export { sessions, sessionCurrent, loading };

const unloadSession = () => batch(() => {
    setPrompt('context', []);
    setPrompt('system', []);
    setSessionCurrent(null);
});

export const sessionActions = {

    loadWorkspaceSessions: async () => {
        setLoading(true);
        try {
            await refetch();
        } catch(err) {
            console.error('Error to load workspace sessions', err);
        } finally {
            setLoading(false);
        }
    },

    unloadSession,

    loadSession: async (name) => {
        setLoading(true);
        try {
            if (sessionCurrent() === name) {
                unloadSession();
                return;
            }
            const currentSession = await APIs.getSession(name);
            if (currentSession) {
                batch(() => {
                    setPrompt('context', currentSession.context);
                    setPrompt('system', currentSession.system);
                    setSessionCurrent(name);
                });
            }
        } catch(err) {
            console.error('Error to load session data', err);
        } finally {
            setLoading(false);
        }
    },

    saveSession: async (name) => {
        setLoading(true);
        try {
            const data = JSON.stringify({
                context: unwrap(prompt.context),
                system: unwrap(prompt.system)
            });
            await APIs.saveSession(name, data);
            setSessionCurrent(name);
            await refetch();
        } catch (err) {
            console.error('Error to save session data', err);
        } finally {
            setLoading(false);
        }
    },

    deleteSession: async (name) => {
        setLoading(true);
        try {
            await APIs.deleteSession(name);
            if (sessionCurrent() === name) unloadSession();
            await refetch();
        } catch (err) {
            console.error('Error to delete session data', err);
        } finally {
            setLoading(false);
        }
    },

};
