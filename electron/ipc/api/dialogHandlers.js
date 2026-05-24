import { dialog, BrowserWindow, Notification } from 'electron/main';


export default {

    saveConfirmation: async (event, name) => {
        // Get the window that sent the request
        const webContents = event.sender;
        const win = BrowserWindow.fromWebContents(webContents);
        const options = {
            type: 'question',
            buttons: ['Yes', 'Cancel'],
            defaultId: 0, // Focuses 'Save' by default
            cancelId: 1,  // Map 'Esc' key to 'Cancel'
            title: 'Confirm Save',
            message: `Do you want to overwrite "${name}"?`,
            // detail: 'Your changes will be lost if you don\'t save them.'
        };

        const { response } = await dialog.showMessageBox(win, options);
        return response === 0;
    },

    actionConfirmation: async (event, title, message) => {
        // Get the window that sent the request
        const webContents = event.sender;
        const win = BrowserWindow.fromWebContents(webContents);
        const options = {
            type: 'question',
            buttons: ['Yes', 'Cancel'],
            defaultId: 0, // Focuses 'Save' by default
            cancelId: 1,  // Map 'Esc' key to 'Cancel'
            title,
            message
        };

        const { response } = await dialog.showMessageBox(win, options);
        return response === 0;
    },

    notifySuccess: (event, message) => {
        new Notification({
            title: 'Success',
            body: message || 'Action completed successfully!',
            silent: false
        }).show();
    },

    notifyError: (event, message) => {
        new Notification({
            title: 'Error',
            body: message || 'An unexpected error occurred.',
            silent: false
        }).show();
    }

};