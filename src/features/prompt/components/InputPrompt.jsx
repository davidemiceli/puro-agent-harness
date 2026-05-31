import { createEffect, createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import APIs from '@/src/services/apis';
import DialogsAPIs from '@/src/services/dialogs';
import { llm, llmActions } from '@/src/stores/llmStore';
import { workspaceCurrent } from '@/src/features/workspace/stores/workspaceStore';
import { setPrompt, promptActions } from '../stores/promptStore';
import { assist } from '@/src/agent-engine/index';
import { useBootstrap } from '@/src/contexts/bootstrapContext';
import { Box, BoxButton } from '@/src/components/Box';
import Tooltip from '@/src/components/Tooltip';
import { ExpandIcon, ResizeIcon, AttachIcon, ToolIcon, DeleteIcon, ShellIcon, AddIcon, EnterIcon } from '@/src/components/Icons';
import ToolPanel from './ToolPanel';


export default function InputPrompt(props) {
    const { reloadLLMProvider } = useBootstrap();
    const navigate = useNavigate();
    const [ expandPrompt, setExpandPrompt ] = createSignal(false);
    const [ showTools, setShowTools ] = createSignal(false);

    createEffect(() => {
        if (workspaceCurrent() === null) {
            return navigate('/workspace', { replace: true });
        }
    });

    const toggleToolsPanel = () => setShowTools(v => !v);

    const run = async () => {
        setPrompt('isRunning', true);
        try {
            await assist(llm.selectedModel);
        } catch(err) {
            console.error(err);
        } finally {
            setPrompt('isRunning', false);
        }
    };

    const save = async text => {
        setExpandPrompt(false);
        await props.onSubmit(text);
    };

    const saveAndRun = async text => {
        if (text) await save(text);
        await run();
    };

    const handleKeyDown = async e => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            const text = e.currentTarget.value;
            await save(text);
        }
    };

    const onOpenFile = async () => {
        const files = await APIs.getFiles();
        files.forEach(f => {
            props.addFile(f.name, f.content);
            props.setInputText(t => `${t}${f.name}`);
        });
    };

    const changeModel = async () => {
        if (llm.selectedModel === undefined) await reloadLLMProvider();
        else llmActions.changeModel();
    };

    const resetContext = async () => {
        const confirmed = await DialogsAPIs.actionConfirmation('Reset context', 'Are you sure you want to clear the conversation history?');
        if (confirmed) promptActions.resetPromptByKey('context');
    };

    const addSaveTextBtn = () => props.inputTextId() ? 'Save' : 'Add to History';
    const changeModelClass = () => llm.selectedModel ? 'bg-gray-200 hover:bg-gray-100' : 'text-black bg-yellow-400 hover:bg-yellow-500';
    const btnPadding = {x: 3, y: 2};
    const btnBaseColorClasses = 'bg-gray-200 hover:bg-gray-100';

    return <footer class={`flex flex-col px-4 pb-4 ${expandPrompt() ? 'h-full' : ''}`}>
        <Box classes='flex flex-col grow w-full border border-gray-200 bg-white'>
            <Show when={showTools()}>
                <div class="px-2 py-1 border-b border-gray-100">
                    <ToolPanel />
                </div>
            </Show>
            <textarea 
                placeholder='Ask something...'
                name="prompt"
                value={props.inputText()}
                onInput={(e) => props.setInputText(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                spellcheck='false'
                rows="3"
                class="w-full py-3 px-4 overflow-y-auto bg-transparent focus:outline-none focus:ring-0 focus:border-transparent w-full h-full text-gray-800 resize-none flex-grow"
            />
            <div class="p-3 flex justify-between text-xs font-semibold">
                <div class="flex">
                    <BoxButton aria-label="Selected Model" colorClasses={changeModelClass()} px={btnPadding.x} py={btnPadding.y} onClick={changeModel}>
                        <Show when={llm.selectedModel} fallback={'Connect'}>{llm.selectedModel}</Show>
                    </BoxButton>
                    <Tooltip text={expandPrompt() ? 'Expand' : 'Resize'} position='top'>
                        <BoxButton aria-label="Toggle Expand" colorClasses={btnBaseColorClasses} px={btnPadding.x} py={btnPadding.y} onClick={() => setExpandPrompt(v => !v)}>
                            <Show when={expandPrompt()} fallback={<ExpandIcon class="w-4 h-4 object-contain" />}>
                                <ResizeIcon class="w-4 h-4 object-contain" />
                            </Show>
                        </BoxButton>
                    </Tooltip>
                    <Tooltip text='Import File' position='top'>
                        <BoxButton aria-label="Import File" colorClasses={btnBaseColorClasses} px={btnPadding.x} py={btnPadding.y} onClick={() => onOpenFile()}>
                            <AttachIcon class="w-4 h-4 object-contain" />
                        </BoxButton>
                    </Tooltip>
                    <Tooltip text='Toggle tools' position='top'>
                        <BoxButton aria-label="Tools" colorClasses={showTools() ? 'bg-gray-800 text-white' : 'bg-gray-200 hover:bg-gray-100'} px={btnPadding.x} py={btnPadding.y} onClick={toggleToolsPanel}>
                            <ToolIcon class="w-4 h-4 object-contain" />
                        </BoxButton>
                    </Tooltip>
                    <Tooltip text='Clear all context' position='top'>
                        <BoxButton aria-label="Clear" colorClasses='bg-gray-200 hover:bg-red-600 hover:text-white' px={btnPadding.x} py={btnPadding.y} onClick={resetContext}>
                            <DeleteIcon class="w-4 h-4 object-contain" />
                        </BoxButton>
                    </Tooltip>
                </div>
                <div class='flex items-center'>
                    <Tooltip text='Execute bash' position='top'>
                        <BoxButton aria-label="Execute Bash" colorClasses="bg-gray-200 hover:bg-gray-700 hover:text-white" px="3" py="1" onClick={() => props.onExecuteBash(props.inputText())}>
                            <ShellIcon class="w-6 h-6 object-contain" />
                        </BoxButton>
                    </Tooltip>
                    <Tooltip text={addSaveTextBtn} position='top'>
                        <BoxButton aria-label={addSaveTextBtn} colorClasses="bg-gray-200 hover:bg-sky-700 hover:text-white" px="4" py="2" onClick={() => save(props.inputText())}>
                            <Show when={props.inputTextId()} fallback={<AddIcon class="w-4 h-4 object-contain" />}>Save</Show>
                        </BoxButton>
                    </Tooltip>
                    <Tooltip text='Run prompt' position='top'>
                        <BoxButton aria-label="Run Prompt" colorClasses="bg-green-800 text-white hover:bg-green-900" px="4" py="2" onClick={() => saveAndRun(props.inputText())}>
                            <EnterIcon class="w-4 h-4 object-contain" />
                        </BoxButton>
                    </Tooltip>
                </div>
            </div>
        </Box>
    </footer>;
}
