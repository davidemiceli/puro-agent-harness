import { createEffect, createContext, useContext } from 'solid-js';
import { settings } from '@/src/features/settings/stores/settingStore';
import { llmActions } from '@/src/stores/llmStore';
import LLMProvider from '@/src/libs/LLMProvider';


const BootstrapContext = createContext();

export function BootstrapProvider(props) {

    const reloadLLMProvider = async () => {
        const data = settings();
        if (data) {
            LLMProvider.init(data);
            const models = await LLMProvider.listModels();
            llmActions.updateModels(models, LLMProvider.model);
        }
    };

    createEffect(() => {
        const _ = settings();
        reloadLLMProvider();
    });

    const value = {
        settings,
        reloadLLMProvider
    };

    return <BootstrapContext.Provider value={value}>
        {props.children}
    </BootstrapContext.Provider>;
}

export const useBootstrap = () => useContext(BootstrapContext);