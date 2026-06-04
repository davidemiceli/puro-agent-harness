import { promptActions } from '@/src/features/prompt/stores/promptStore';
import { ask } from './libs/ask';
import { toolRegistry } from './tools/index';
import { getEnabledToolsDefinitions } from './libs/helpers';


export const executeTool = async (toolName, args) => {
    try {
        const handler = toolRegistry[toolName].handler;
        if (!handler) throw new Error(`Unknown tool "${toolName}".`);
        const result = await handler(args);
        toolRegistry[toolName].handleResult(toolName, args, result);
    } catch (error) {
        console.error(error);
        promptActions.addPrompt('context', 'tool', `Error: ${error.message}`, {
            toolName,
            args
        });
    }
};

export const assist = async (model, disableTools) => {
    const enabledToolsDefinitions = disableTools ? [] : getEnabledToolsDefinitions();
    const [ content, toolCalls, noTools ] = await ask(
        model,
        promptActions.getBuiltPrompt(),
        enabledToolsDefinitions
    );
    if (content) promptActions.addPrompt('context', 'assistant', content, {
        author: model
    });
    if (noTools) return content;
    for (const call of toolCalls) {
        await executeTool(call.name, call.args);
    }
    return content;
};
