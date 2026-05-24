import { promptActions } from '@/src/features/prompt/stores/promptStore';
import { toolRegistry } from '../tools/index';


export const getEnabledToolsDefinitions = () => {
    const enabledTools = promptActions.getEnabledTools();
    return enabledTools.map(name => toolRegistry[name].definition);
};

export const toDisplayToolName = name => name.replace('_', ' ');
