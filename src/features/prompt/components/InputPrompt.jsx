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
import { Plus, Terminal, Save, ArrowUp, Eraser, Hammer, Paperclip, Expand, Shrink, Unplug } from 'lucide-solid';
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
    const changeModelClass = () => llm.selectedModel ? 'bg-gray-200 hover:bg-gray-100' : 'hover:text-yellow-600';
    const btnPadding = {x: 2, y: 2};
    const changeModelClassPadX = () => llm.selectedModel ? 4 : btnPadding.x;
    const btnBaseColorClasses = 'bg-transparent hover:text-sky-600';

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
                class="w-full py-4 px-4 overflow-y-auto bg-transparent focus:outline-none focus:ring-0 focus:border-transparent w-full h-full text-sm text-gray-800 resize-none flex-grow font-mono"
            />
            <div class="p-3 flex justify-between font-semibold">
                <div class="flex">
                    <BoxButton aria-label="Selected Model" classes='text-xs' colorClasses={changeModelClass()} px={changeModelClassPadX()} py={1} onClick={changeModel}>
                        <Show when={llm.selectedModel} fallback={<Unplug absoluteStrokeWidth={true} size={16} />}>{llm.selectedModel}</Show>
                    </BoxButton>
                    <Tooltip text={expandPrompt() ? 'Expand' : 'Resize'} position='top'>
                        <BoxButton aria-label="Toggle Expand" colorClasses={btnBaseColorClasses} px={btnPadding.x} py={btnPadding.y} onClick={() => setExpandPrompt(v => !v)}>
                            <Show when={expandPrompt()} fallback={<Expand absoluteStrokeWidth={true} size={16} />}>
                                <Shrink absoluteStrokeWidth={true} size={16} />
                            </Show>
                        </BoxButton>
                    </Tooltip>
                    <Tooltip text='Import File' position='top'>
                        <BoxButton aria-label="Import File" colorClasses={btnBaseColorClasses} px={btnPadding.x} py={btnPadding.y} onClick={() => onOpenFile()}>
                            <Paperclip absoluteStrokeWidth={true} size={16} />
                        </BoxButton>
                    </Tooltip>
                    <Tooltip text='Toggle tools' position='top'>
                        <BoxButton aria-label="Tools" colorClasses={showTools() ? 'bg-gray-800 text-white' : btnBaseColorClasses} px={btnPadding.x} py={btnPadding.y} onClick={toggleToolsPanel}>
                            <Hammer absoluteStrokeWidth={true} size={16} />
                        </BoxButton>
                    </Tooltip>
                    <Tooltip text='Clear all context' position='top'>
                        <BoxButton aria-label="Clear" colorClasses='bg-transparent hover:text-red-600' px={btnPadding.x} py={btnPadding.y} onClick={resetContext}>
                            <Eraser absoluteStrokeWidth={true} size={16} />
                        </BoxButton>
                    </Tooltip>
                </div>
                <div class='flex items-center'>
                    <Tooltip text='Execute bash' position='top'>
                        <BoxButton aria-label="Execute Bash" colorClasses="bg-transparent hover:text-sky-700" px={btnPadding.x} py={btnPadding.y} onClick={() => props.onExecuteBash(props.inputText())}>
                            <Terminal absoluteStrokeWidth={true} size={16} />
                        </BoxButton>
                    </Tooltip>
                    <Tooltip text={addSaveTextBtn} position='top'>
                        <BoxButton aria-label={addSaveTextBtn} colorClasses="bg-transparent hover:text-sky-700" px={btnPadding.x} py={btnPadding.y} onClick={() => save(props.inputText())}>
                            <Show when={props.inputTextId()} fallback={<Plus absoluteStrokeWidth={true} size={16} />}>
                                <Save absoluteStrokeWidth={true} size={16}  />
                            </Show>
                        </BoxButton>
                    </Tooltip>
                    <Tooltip text='Run prompt' position='top'>
                        <BoxButton aria-label="Run Prompt" colorClasses="bg-transparent hover:text-green-700" px={btnPadding.x} py={btnPadding.y} onClick={() => saveAndRun(props.inputText())}>
                            <ArrowUp absoluteStrokeWidth={true} size={16} />
                        </BoxButton>
                    </Tooltip>
                </div>
            </div>
        </Box>
    </footer>;
}
