import { createEffect, For } from 'solid-js';
import { scrollToBottom } from '@/src/libs/helpers/ui';
import { prompt } from '@/src/features/prompt/stores/promptStore';
import SystemItem from './SystemItem';


export default function SystemContainer(props) {
    let containerRef; // eslint-disable-line no-unassigned-vars

    createEffect(() => {
        const _ = prompt.system.at(-1);
        scrollToBottom(containerRef, 'smooth');
    });

    return <div ref={containerRef} class="w-full flex flex-col font-sm overflow-y-auto gap-4">
        <For each={prompt.system}>{(r, i) => <SystemItem
            r={r}
            index={i()}
            selectedPaths={props.selectedPaths}
        />}</For>
    </div>;
}
