import { Show } from 'solid-js';
import { llm } from '@/src/stores/llmStore';
import { prompt } from '@/src/features/prompt/stores/promptStore';
import LoadingSpinner from './Spinner';


export default function RunningStatus() {
    const textClass = 'font-semibold text-xs';
    return <div class="flex items-center gap-2">
        <LoadingSpinner loading={prompt.isRunning} color={prompt.isRunning ? 'bg-green-600' : 'bg-gray-300'} />
        <Show when={prompt.isRunning} fallback={<div class={`${textClass} text-gray-400`}>Not running</div>}>
            <div class={`${textClass} text-green-700`}>
                {llm.selectedModel}
            </div>
        </Show>
    </div>;
}
