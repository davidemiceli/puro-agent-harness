import { createEffect, For } from 'solid-js';
import { scrollToBottom } from '@/src/libs/helpers/ui';
import { prompt, promptActions } from '@/src/features/prompt/stores/promptStore';
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
    </div>;
}
