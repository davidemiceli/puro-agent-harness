import { createEffect, Show, For, batch, createSignal } from 'solid-js';
import { scrollToBottom } from '@/src/libs/helpers/ui';
import LLMProvider from '@/src/libs/LLMProvider';
import { prompt, promptActions } from '../stores/promptStore';
import { Box, BoxButton } from '@/src/components/Box';
import RunningStatus from '@/src/components/RunningStatus';
import ContextItem from './ContextItem';


export default function ContextsContainer(props) {
    let containerRef; // eslint-disable-line no-unassigned-vars
    const [draggedIndex, setDraggedIndex] = createSignal(-1);

    createEffect(() => {
        const _ = prompt.context.at(-1);
        scrollToBottom(containerRef, 'smooth');
    });

    createEffect(() => {
        const _ = prompt.response.length;
        scrollToBottom(containerRef);
    });

    const edit = (id, content) => batch(() => {
        props.setInputText(content);
        props.setInputTextId(prev => prev === id ? null : id);
    });

    const handleDragStart = (index) => setDraggedIndex(index);
    const handleDrop = (targetIndex, dropDir) => {
        const fromIndex = draggedIndex();
        if (fromIndex === targetIndex) {
            setDraggedIndex(-1);
            return;
        }
        const toIndex = dropDir === 'after' ? targetIndex + 1 : targetIndex;
        if (toIndex >= 0 && toIndex <= prompt.context.length) {
            promptActions.movePromptAtIndex('context', fromIndex, toIndex);
        }
        setDraggedIndex(-1);
    };
    const handleDragEnd = () => setDraggedIndex(-1);

    return <div ref={containerRef} class="w-full flex flex-col text-xs overflow-y-auto gap-4">
        <For each={prompt.context}>{(r, i) => <ContextItem
            r={r}
            index={i()}
            draggedIndex={draggedIndex()}
            setInputText={props.setInputText}
            setInputTextId={props.setInputTextId}
            executeBash={props.executeBash}
            edit={edit}
            selectedPaths={props.selectedPaths}
            onDragStart={() => handleDragStart(i())}
            onDrop={(dir) => handleDrop(i(), dir)}
            onDragEnd={handleDragEnd}
        />}</For>

        {/* Render the streaming response only */}
        <Show when={prompt.response.length > 0 || prompt.isRunning}>
            <Box classes={'w-full p-2 border-l-6 border-transparent whitespace-pre-wrap'}>
                <Show when={prompt.response} fallback={<RunningStatus />}>
                    <div class="flex flex-col gap-2">
                        <div class="text-sm break-words">{prompt.response}</div>
                        <BoxButton aria-label="Stop" classes='hover:bg-yellow-500' onClick={() => LLMProvider.stop()}>Stop</BoxButton>
                    </div>
                </Show>
            </Box>
        </Show>

        {/* Render the errors in streaming response only */}
        <Show when={prompt.responseError.length > 0}>
            <Box classes={'w-full p-2 border-l-6 border-red-700 whitespace-pre-wrap'}>
                <div class="flex items-center gap-2">
                    <div class="text-red-800 font-semibold">{prompt.responseError}</div>
                    <BoxButton aria-label="Close" onClick={() => promptActions.updateResponseError('')}>Close</BoxButton>
                </div>
            </Box>
        </Show>
    </div>;
}
