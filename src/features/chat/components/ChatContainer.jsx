import { createEffect, For, Show } from 'solid-js';
import { scrollToBottom } from '@/src/libs/helpers/ui';
import { prompt, promptActions } from '@/src/features/prompt/stores/promptStore';
import { Box, BoxButton } from '@/src/components/Box';
import Markdown from '@/src/components/Markdown/Markdown';
import RunningStatus from '@/src/components/RunningStatus';
import LLMProvider from '@/src/libs/LLMProvider';
import ChatItem from './ChatItem';


export default function ChatContainer() {
    let containerRef; // eslint-disable-line no-unassigned-vars

    createEffect(() => {
        const _ = prompt.context.at(-1);
        scrollToBottom(containerRef, 'smooth');
    });

    createEffect(() => {
        const _ = prompt.response.length;
        scrollToBottom(containerRef);
    });

    return <div ref={containerRef} class="flex flex-col items-center w-full overflow-y-auto gap-8">
        <For each={promptActions.getChat()}>
            {r => <ChatItem r={r} />}
        </For>

        {/* Render in markdown the streaming response only */}
        <Show when={prompt.response.length > 0 || prompt.isRunning}>
            <Box classes='flex flex-col gap-4 py-0 px-2 max-w-4xl font-sans text-gray-900'>
                <Show when={prompt.response} fallback={<RunningStatus />}>
                    <Markdown content={prompt.response} />
                </Show>
                <Show when={prompt.isRunning}>
                    <BoxButton classes='hover:bg-yellow-500' onClick={() => LLMProvider.stop()}>Stop</BoxButton>
                </Show>
            </Box>
        </Show>

        {/* Render in markdown the errors in streaming response only */}
        <Show when={prompt.responseError.length > 0}>
            <Box classes='flex flex-col gap-4 py-0 px-2 max-w-4xl font-sans text-gray-900 whitespace-pre-wrap'>
                <div class="flex items-center gap-2">
                    <div class="text-red-800 font-semibold font-sans">{prompt.responseError}</div>
                    <BoxButton aria-label="Close" onClick={() => promptActions.updateResponseError('')}>Close</BoxButton>
                </div>
            </Box>
        </Show>
    </div>;
}
