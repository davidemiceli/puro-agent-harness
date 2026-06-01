import { Show, createSignal } from 'solid-js';
import { formatDateTime } from '@/src/libs/helpers/utils';
import { promptActions } from '@/src/features/prompt/stores/promptStore';
import Tooltip from '@/src/components/Tooltip';
import { Box, BoxButton, BoxInfo, BoxButtonShowMore } from '@/src/components/Box';
import EstimatedTokensCount from '@/src/components/EstimatedTokensCount';
import { ArrowUpIcon, ArrowDownIcon, DeleteIcon } from '@/src/components/Icons';
import { categoryClassName } from '../common/helpers';


export default function SystemItem(props) {
    const roleClassName = {bg: 'bg-gray-800', border: 'border-gray-800'};
    const [dropDir, setDropDir] = createSignal(null);

    const dragClasses = () => {
        if (dropDir() === 'before') return 'border-t-2';
        if (dropDir() === 'after') return 'border-b-2';
        return '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        setDropDir(y < rect.height / 2 ? 'before' : 'after');
    };
    const handleDragLeave = () => setDropDir(null);
    const handleDrop = (e) => {
        e.preventDefault();
        const dir = dropDir();
        setDropDir(null);
        if (props.index !== props.draggedIndex) props.onDrop(dir);
    };

    return <Box classes={`flex flex-col gap-4 w-full p-2 border-l-6 whitespace-pre-wrap ${props.r.included ? categoryClassName(props.r.category).border : 'border-gray-100'} ${dragClasses()}`}
        draggable={true}
        onDragStart={props.onDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={props.onDragEnd}
    >
        <div class='flex justify-between text-xs'>
            <div class="flex gap-2">
                <Tooltip text={`${props.r.included ? 'Exclude from' : 'Include in'} system prompt`} position='right'>
                    <BoxButton colorClasses='text-gray-800 bg-gray-200 hover:bg-gray-300' onClick={() => promptActions.toggleIncludePrompt('system', props.r.id)}>
                        {props.index + 1}
                    </BoxButton>
                </Tooltip>
                <BoxInfo classes={`capitalize ${roleClassName.bg} text-white`}>
                    {props.r.role}
                </BoxInfo>
                <BoxInfo colorClasses={`${categoryClassName(props.r.category).bg} text-white capitalize`}>{props.r.category}</BoxInfo>
                <BoxInfo colorClasses='bg-amber-400 text-black capitalize'>{props.r.name}</BoxInfo>
                <Show when={props.r.expanded}>
                    <BoxButtonShowMore showMore={props.r.expanded} toggleShowMore={() => promptActions.toggleExpandPrompt('system', props.r.id)} />
                </Show>
            </div>
            <div class='flex gap-2'>
                <Tooltip text="Move up" position="bottom">
                    <BoxButton classes='hover:bg-green-700' onClick={() => promptActions.movePrompt('system', props.r.id, -1)}>
                        <ArrowUpIcon class="w-4 h-4 object-contain" />
                    </BoxButton>
                </Tooltip>
                <Tooltip text="Move down" position="bottom">
                    <BoxButton classes='hover:bg-green-700' onClick={() => promptActions.movePrompt('system', props.r.id, 1)}>
                        <ArrowDownIcon class="w-4 h-4 object-contain" />
                    </BoxButton>
                </Tooltip>
                <Tooltip text="Delete" position='left'>
                    <BoxButton classes='hover:bg-red-700' onClick={() => promptActions.deleteFromPrompt('system', props.r.id)}>
                        <DeleteIcon class="w-4 h-4 object-contain" />
                    </BoxButton>
                </Tooltip>
            </div>
        </div>
        <Show when={props.r.expanded && props.r.content}>
            <div class='h-fit'>{props.r.content}</div>
        </Show>
        <Show when={!props.r.expanded && props.r.description}>
            <div class='h-fit'>{props.r.description}</div>
        </Show>
        <div class='flex justify-between text-xs'>
            <div class='flex gap-2'>
                <BoxButtonShowMore showMore={props.r.expanded} toggleShowMore={() => promptActions.toggleExpandPrompt('system', props.r.id)} />
                <BoxInfo colorClasses='text-gray-800 bg-gray-200'>{formatDateTime(props.r.datetime)}</BoxInfo>
                <BoxInfo><EstimatedTokensCount text={props.r.content} /></BoxInfo>
            </div>
        </div>
    </Box>;
}
