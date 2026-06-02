import { getDefaultSettings, getOrCreateSettings, saveSettings } from '../appSettings.js';


export default {

    settingsGet: async () => {
        try {
            const settings = await getOrCreateSettings();
            return { data: settings, error: null };
        } catch (err) {
            console.error(err);
            return { data: null, error: err };
        }
    },

    settingsDefault: async () => {
        try {
            const settings = getDefaultSettings();
            return { data: settings, error: null };
        } catch (err) {
            console.error(err);
            return { data: null, error: err };
        }
    },

    settingsSave: async (event, value) => {
        try {
            await saveSettings(value);
            return { data: true, error: null };
        } catch (err) {
            console.error(err);
            return { data: null, error: err };
        }
    }

};