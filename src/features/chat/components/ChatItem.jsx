import { Show } from 'solid-js';
import { formatDateTime } from '@/src/libs/helpers/utils';
import { promptActions } from '@/src/features/prompt/stores/promptStore';
import { Box, BoxInfo, BoxButtonShowMore } from '@/src/components/Box';
import Markdown from '@/src/components/Markdown/Markdown';


export default function ContextItem(props) {
    const roleClass = () => props.r.role === 'user' ? 'border-l-6 border-gray-200 rounded py-4 px-6 bg-gray-50' : '';
    return <Box classes={`flex flex-col gap-4 py-0 px-2 max-w-4xl font-sans text-gray-900 ${roleClass()}`}>
        <Show when={props.r.expanded} fallback={<div class="truncate text-base">{props.r.content}</div>}>
            <Markdown content={props.r.content} />
        </Show>
        <div class='flex justify-end text-xs font-mono'>
            <div class='flex gap-2 text-xs'>
                <BoxButtonShowMore showMore={props.r.expanded} toggleShowMore={() => promptActions.toggleExpandPrompt('context', props.r.id)} />
                <BoxInfo colorClasses='text-gray-800 bg-gray-200'>{formatDateTime(props.r.datetime)}</BoxInfo>
                <Show when={props.r.author}>
                    <BoxInfo colorClasses='text-gray-800 bg-gray-200'>{props.r.author}</BoxInfo>
                </Show>
            </div>
        </div>
    </Box>;
}