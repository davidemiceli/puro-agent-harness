import { For } from 'solid-js';
import { prompt, promptActions } from '../stores/promptStore';
import { toDisplayToolName } from '@/src/agent-engine/libs/helpers';
import { BoxButton } from '@/src/components/Box';


export default function CommandPanel() {
    const toolColorClass = enabled => `bg-gray-200 text-black ${enabled ? '' : 'opacity-30'}`;
    return <div class="p-3 flex items-center gap-2 text-xs font-semibold">
        <For each={prompt.tools}>{(tool) =>
            <BoxButton px="3" py="1" classes='capitalize' colorClasses={toolColorClass(tool.enabled)} onClick={() => promptActions.toggleTool(tool.name)}>
                {toDisplayToolName(tool.name)}
            </BoxButton>
        }</For>
    </div>;
}