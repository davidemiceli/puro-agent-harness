import { Ollama } from 'ollama/browser';


class LLMProvider {

    constructor() {
        this.LLM = null;
        this.model = null;
    }

    init(configs) {
        const { host, model } = configs.provider;
        this.model = model;
        this.LLM = new Ollama({ host });
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