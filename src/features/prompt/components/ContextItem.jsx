import { createSignal, Show, Match, Switch } from 'solid-js';
import { formatDateTime, extractFilesFromPrompt } from '@/src/libs/helpers/utils';
import APIs from '@/src/services/apis';
import DialogsAPIs from '@/src/services/dialogs';
import { executeTool, assist } from '@/src/agent-engine/index';
import { llm } from '@/src/stores/llmStore';
import { promptActions, setPrompt } from '../stores/promptStore';
import Tooltip from '@/src/components/Tooltip';
import { Box, BoxButton, BoxInfo, BoxButtonShowMore } from '@/src/components/Box';
import EstimatedTokensCount from '@/src/components/EstimatedTokensCount';
import { ArrowUp, ArrowDown, Save, Download, Pencil, Files, CornerDownRight, X } from 'lucide-solid';
import { toDisplayToolName } from '@/src/agent-engine/libs/helpers';
import { roleClassName } from '@/src/libs/helpers/ui';


const SourceContent = props => <div class='h-fit break-words text-sm font-mono' classList={{truncate: props.truncate}}>
    {props.content}
</div>;


export default function ContextItem(props) {
    const [isCopied, setIsCopied] = createSignal(false);
    const [dropDir, setDropDir] = createSignal(null);

    const dragClasses = () => {
        if (dropDir() === 'before') return 'border-t-2';
        if (dropDir() === 'after') return 'border-b-2';
        return '';
    };

    const clickRunTool = async (id) => {
        setPrompt('isRunning', true);
        try {
            const { toolName, args } = promptActions.getPromptById('context', id);
            await executeTool(toolName, args);
            await assist(llm.selectedModel);
        } catch(err) {
            console.error(err);
        } finally {
            setPrompt('isRunning', false);
        }
    };

    const clickRunBash = async (id) => {
        const content = promptActions.getPromptById('context', id)?.content;
        if (content) await props.executeBash(content);
    };

    const canSave = filename => props.selectedPaths().length === 1 || filename;

    const saveChanges = async (text, filename) => {
        const files = extractFilesFromPrompt(text);
        if (files.length > 1) {
            console.error('There are more files in this content');
            return;
            // for (const {name, content} of files) await APIs.saveFile(name, content);
        }
        const content = files.length === 1 ? files[0].content : text;
        const selectedPaths = props.selectedPaths();
        const name = selectedPaths.length === 1 ? selectedPaths[0] : filename ? filename : null;
        if (name) {
            const confirmed = await DialogsAPIs.saveConfirmation(name);
            if (confirmed) await APIs.saveFile(name, content);
        }
    };

    const handleCopy = async (content) => {
        await APIs.clipboardCopy(content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 500);
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

    return <Box classes={`flex flex-col gap-4 w-full py-0 px-2 border-l-6 whitespace-pre-wrap ${props.r.included ? roleClassName(props.r.role).border : 'border-gray-100'} ${dragClasses()}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
        <div class='flex justify-between'
            draggable={true}
            onDragStart={props.onDragStart}
            onDragEnd={props.onDragEnd}
        >
            <div class="flex gap-2">
                <Tooltip text={`${props.r.included ? 'Exclude from' : 'Include in'} context`} position='right'>
                    <BoxButton aria-label="Index" colorClasses='text-gray-800 bg-gray-200 hover:bg-gray-300' onClick={() => promptActions.toggleIncludePrompt('context', props.r.id)}>
                        {props.index + 1}
                    </BoxButton>
                </Tooltip>
                <Tooltip text='Change role' position='right'>
                    <BoxButton classes={'capitalize ' + roleClassName(props.r.role).bg} onClick={() => promptActions.toggleRolePrompt('context', props.r.id)}>
                        {props.r.role}
                    </BoxButton>
                </Tooltip>
                <Show when={props.r.filename}>
                    <Tooltip text='Expand to read the content' position='right'>
                        <BoxInfo colorClasses='text-black bg-amber-300'>File</BoxInfo>
                    </Tooltip>
                </Show>
                <Show when={props.r.toolName}>
                    <BoxInfo colorClasses='text-gray-800 bg-gray-200' classes='capitalize'>
                        {toDisplayToolName(props.r.toolName)}
                    </BoxInfo>
                </Show>
                <BoxButtonShowMore showMore={props.r.expanded} toggleShowMore={() => promptActions.toggleExpandPrompt('context', props.r.id)} />
            </div>
            <div class='flex items-center'>
                <Tooltip text="Move up" position="bottom">
                    <BoxButton aria-label="Move Up" colorClasses='text-gray-600 hover:text-green-700' onClick={() => promptActions.movePrompt('context', props.r.id, -1)}>
                        <ArrowUp absoluteStrokeWidth={true} size={16} />
                    </BoxButton>
                </Tooltip>
                <Tooltip text="Move down" position="bottom">
                    <BoxButton aria-label="Move Down" colorClasses='text-gray-600 hover:text-green-700' onClick={() => promptActions.movePrompt('context', props.r.id, 1)}>
                        <ArrowDown absoluteStrokeWidth={true} size={16} />
                    </BoxButton>
                </Tooltip>
                <Show when={canSave(props.r.filename)}>
                    <BoxButton aria-label="Save" colorClasses='text-gray-600 hover:text-sky-700' onClick={() => saveChanges(props.r.content, props.r.filename)}>
                        <Save absoluteStrokeWidth={true} size={16} />
                    </BoxButton>
                </Show>
                <Tooltip text="Save as" position="bottom">
                    <BoxButton aria-label="Save As" colorClasses='text-gray-600 hover:text-sky-700' onClick={() => APIs.saveFileDialog(props.r.content)}>
                        <Download absoluteStrokeWidth={true} size={16} />
                    </BoxButton>
                </Tooltip>
                <Show when={!isCopied()} fallback={<BoxInfo colorClasses='text-sky-700'><Files absoluteStrokeWidth={true} size={16} /></BoxInfo>}>
                    <Tooltip text="Copy" position="bottom">
                        <BoxButton aria-label="Copy" colorClasses='text-gray-600 hover:text-sky-700' onClick={() => handleCopy(props.r.content)}>
                            <Files absoluteStrokeWidth={true} size={16} />
                        </BoxButton>
                    </Tooltip>
                </Show>
                <Tooltip text="Use as input" position="bottom">
                    <BoxButton aria-label="Use as input" colorClasses='text-gray-600 hover:text-sky-700' onClick={() => props.setInputText(props.r.content)}>
                        <CornerDownRight absoluteStrokeWidth={true} size={16} />
                    </BoxButton>
                </Tooltip>
                <Tooltip text="Edit" position="bottom">
                    <BoxButton aria-label="Edit" colorClasses='text-gray-600 hover:text-sky-700' onClick={() => props.edit(props.r.id, props.r.content)}>
                        <Pencil absoluteStrokeWidth={true} size={16} />
                    </BoxButton>
                </Tooltip>
                <Tooltip text="Delete" position="left">
                    <BoxButton aria-label="Delete" colorClasses='text-gray-600 hover:text-red-700' onClick={() => promptActions.deleteFromPrompt('context', props.r.id)}>
                        <X absoluteStrokeWidth={true} size={16} />
                    </BoxButton>
                </Tooltip>
            </div>
        </div>
        <Show when={props.r.args}>
            <div class={`h-fit rounded p-2 bg-gray-100 text-black ${props.r.expanded ? '' : 'truncate'} overflow-x-auto`}>
                <pre>{JSON.stringify(props.r.args, null, 2)}</pre>
            </div>
        </Show>
        <Show when={props.r.content}>
            <Switch>
                <Match when={props.r.filename && props.r.expanded}>
                    <SourceContent content={props.r.content} />
                </Match>
                <Match when={props.r.filename && !props.r.expanded}>
                    <div class="font-semibold text-gray-800 truncate">{props.r.filename}</div>
                </Match>
                <Match when={!props.r.filename}>
                    <SourceContent content={props.r.content} truncate={!props.r.expanded} />
                </Match>
            </Switch>
        </Show>
        <div class='flex justify-between'>
            <div class='flex gap-2'>
                <BoxButtonShowMore showMore={props.r.expanded} toggleShowMore={() => promptActions.toggleExpandPrompt('context', props.r.id)} />
                <BoxInfo colorClasses='text-gray-800 bg-gray-200'>{formatDateTime(props.r.datetime)}</BoxInfo>
                <Show when={props.r.author}>
                    <BoxInfo colorClasses='text-gray-800 bg-gray-200'>{props.r.author}</BoxInfo>
                </Show>
                <BoxInfo><EstimatedTokensCount text={props.r.content} /></BoxInfo>
                <Show when={props.r.toolName === 'execute_bash'}>
                    <BoxButton aria-label="Run Bash" classes='hover:bg-green-700' onClick={() => clickRunBash(props.r.id)}>Run Bash</BoxButton>
                </Show>
                <Show when={props.r.args && props.r.toolName != 'execute_bash'}>
                    <BoxButton aria-label="Run Tool" classes='hover:bg-green-700' onClick={() => clickRunTool(props.r.id)}>Run Tool</BoxButton>
                </Show>
            </div>
        </div>
    </Box>;
}