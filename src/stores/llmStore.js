import { batch } from 'solid-js';
import { createStore } from 'solid-js/store';


export const [llm, setLLM] = createStore({
    models: [],
    current: 0,
    get selectedModel() {
        return this.models[this.current];
    }
});

export const llmActions = {

    updateModels: (models, defaultModel) => {
        const modelIndex = models.indexOf(defaultModel);
        batch(() => {
            setLLM('models', models);
            if (modelIndex > -1) setLLM('current', modelIndex);
        });
    },

    changeModel: () => setLLM(v => {
        if (v.models.length === 0) return v;
        return {
            current: (v.current + 1) % v.models.length
        };
    }),

};
