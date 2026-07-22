import { createEffect, createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { llm, llmActions } from '@/src/stores/llmStore';
import { workspaceCurrent } from '@/src/features/workspace/stores/workspaceStore';
import { setPrompt } from '@/src/features/prompt/stores/promptStore';
import { assist } from '@/src/agent-engine/index';
import { useBootstrap } from '@/src/contexts/bootstrapContext';
import { Box, BoxButton } from '@/src/components/Box';
import Tooltip from '@/src/components/Tooltip';
import { Unplug, Expand, Shrink, ArrowUp } from 'lucide-solid';


export default function InputPrompt(props) {
    const { reloadLLMProvider } = useBootstrap();
    const navigate = useNavigate();
    const [ expandPrompt, setExpandPrompt ] = createSignal(false);

    createEffect(() => {
        if (workspaceCurrent() === null) {
            return navigate('/workspace', { replace: true });
        }
    });

    const run = async () => {
        setPrompt('isRunning', true);
        try {
            await assist(llm.selectedModel, true);
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

    const changeModel = async () => {
        if (llm.selectedModel === undefined) await reloadLLMProvider();
        else llmActions.changeModel();
    };

    const changeModelClass = () => llm.selectedModel ? 'bg-gray-200 hover:bg-gray-100' : 'text-black bg-yellow-400 hover:bg-yellow-500';
    const btnPadding = {x: 2, y: 2};
    const changeModelClassPadX = () => llm.selectedModel ? 4 : btnPadding.x;
    const btnBaseColorClasses = 'bg-transparent hover:text-sky-600';

    return <footer class={`flex flex-col items-center px-4 pb-4 ${expandPrompt() ? 'h-full' : ''}`}>
        <Box classes='flex flex-col max-w-4xl grow font-sans rounded border border-gray-200 bg-white'>
            <textarea 
                placeholder='Ask something...'
                name="prompt"
                value={props.inputText()}
                onInput={(e) => props.setInputText(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                spellcheck='false'
                rows="3"
                class="py-3 px-4 overflow-y-auto prose prose-base max-w-none bg-transparent focus:outline-none focus:ring-0 focus:border-transparent w-full h-full text-gray-800 resize-none flex-grow"
            />
            <div class="p-3 flex justify-between text-xs font-mono font-semibold">
                <div class="flex">
                    <BoxButton aria-label="Selected Model" colorClasses={changeModelClass()} px={changeModelClassPadX()} py={btnPadding.y} onClick={changeModel}>
                        <Show when={llm.selectedModel} fallback={<Unplug absoluteStrokeWidth={true} size={16} />}>{llm.selectedModel}</Show>
                    </BoxButton>
                    <Tooltip text={expandPrompt() ? 'Expand' : 'Resize'} position='top'>
                        <BoxButton aria-label="Toggle Expand" colorClasses={btnBaseColorClasses} px={btnPadding.x} py={btnPadding.y} onClick={() => setExpandPrompt(v => !v)}>
                            <Show when={expandPrompt()} fallback={<Expand absoluteStrokeWidth={true} size={16} />}>
                                <Shrink absoluteStrokeWidth={true} size={16} />
                            </Show>
                        </BoxButton>
                    </Tooltip>

                </div>
                <div class='flex items-center'>
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
