
export class BaseAPIs {

    constructor() {
        this.apiUrl = 'api';
    }

    handleResponse(resp) {
        if (resp.error) throw new Error(resp.error);
        return resp.data;
    }
}
