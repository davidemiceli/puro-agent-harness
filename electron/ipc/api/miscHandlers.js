import { clipboard } from 'electron/main';


export default {

    copyToClipboard: (event, text) => {
        try {
            clipboard.writeText(text);
            return { data: true, error: null };
        } catch (err) {
            console.error(err);
            return { data: null, error: err };
        }
    }

};