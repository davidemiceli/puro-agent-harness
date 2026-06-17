import { setPrompt, promptActions } from '@/src/features/prompt/stores/promptStore';
import { llmActions } from '@/src/stores/llmStore';
import LLMProvider from '@/src/libs/LLMProvider';
import { batch } from 'solid-js';


export const parseJsonResp = r => {
    const json = r.replace('```json', '').replace('```', '').trim();
    return JSON.parse(json);
};

const mapToolCall = call => ({
    name: call.function.name,
    args: call.function.arguments
});

export const ask = async (model, prompt, tools) => {
    batch(() => {
        promptActions.updateResponse('');
        promptActions.updateResponseError('');
        setPrompt('isRunning', true);
    });

    try {
        const stream = await LLMProvider.LLM.chat({
            model,
            messages: prompt,
            ...tools ? {tools} : {},
            think: false,
            stream: true
        });
        let fullResp = '';
        const toolCalls = [];
        let lastMeta = null;
        for await (const chunk of stream) {
            if (chunk.done) {
                lastMeta = {
                    promptEvalCount: chunk.prompt_eval_count,
                    evalCount: chunk.eval_count,
                    totalDuration: chunk.total_duration,
                };
            }
            if (chunk.message.content) {
                fullResp += chunk.message.content;
                promptActions.updateResponse(fullResp);
            }
            if (chunk.message.tool_calls?.length) {
                toolCalls.push(...chunk.message.tool_calls.map(mapToolCall));
            }
        }
        if (lastMeta) llmActions.updateLastResponseMeta(lastMeta);
        promptActions.updateResponse('');
        return [fullResp, toolCalls, toolCalls.length === 0];
    } catch(err) {
        console.error('LLM Client Error:', err);
        const defaultMessage = 'Sorry, an error from LLM client occurred.';
        const errMessage = err.name === 'AbortError' ? 'Last request was stopped by the user.' : defaultMessage;
        batch(() => {
            promptActions.updateResponse('');
            promptActions.updateResponseError(errMessage);
        });
    } finally {
        setPrompt('isRunning', false);
    }
};
