import { BaseAPIs } from './base';


class DialogsAPIs extends BaseAPIs {

    async saveConfirmation(name) {
        return await window.api.dialog.saveConfirmation(name);
    }

    async actionConfirmation(title, message) {
        return await window.api.dialog.actionConfirmation(title, message);
    }

    async notifySuccess(message) {
        return window.api.dialog.notifySuccess(message);
    }

    async notifyError(message) {
        return window.api.dialog.notifyError(message);
    }

}

export default new DialogsAPIs();
