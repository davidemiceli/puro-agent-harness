import { Ollama } from 'ollama/browser';


class LLMProvider {

    constructor() {
        this.LLM = null;
        this.model = null;
    }

    init(configs) {
        const { host, model, api_key } = configs.provider;
        this.model = model;
        const headers = api_key ? {
            headers: { Authorization: `Bearer ${api_key}` }
        } : {};
        this.LLM = new Ollama({ host, ...headers });
    }

    async listModels() {
        const models = await this.LLM.list();
        return models.models.map(m => m.name);
    }

    async stop() {
        try {
            return await this.LLM.abort();
        } catch(err) {
            console.error(err);
        }
    }

    change() {
        // Change provider
    }

}

export default new LLMProvider();