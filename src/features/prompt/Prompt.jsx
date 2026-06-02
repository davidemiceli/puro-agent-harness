import { createSignal, Show } from 'solid-js';
import APIs from '@/src/services/apis';
import ToolsAPIs from '@/src/services/tools';
import { prompt, setPrompt, promptActions } from './stores/promptStore';
import ContextContainer from './components/ContextContainer';
import InputPrompt from './components/InputPrompt';
import { Sidebar } from './components/Sidebar';


export default function Context() {
    const [inputTextId, setInputTextId] = createSignal(null);
    const [inputText, setInputText] = createSignal('');
    const [selectedPaths, setSelectedPaths] = createSignal([]);

    const onSelectPath = (newPath) => setSelectedPaths(p => p.includes(newPath) ? p.filter(v => v != newPath) : [...p, newPath]);
    const deselectAllPaths = () => setSelectedPaths([]);

    const addSelectedPaths = async () => {
        for (const filename of selectedPaths()) {
            const content = await APIs.getFileContent(filename);
            addFile(filename, content);
        }
    };

    const removeSelectedPaths = async () => {
        for (const filename of selectedPaths()) {
            promptActions.removePromptFile('context', filename);
        }
    };

    const addPathToPrompt = async filename => {
        const content = await APIs.getFileContent(filename);
        addFile(filename, content);
    };

    const resetInputs = () => {
        setInputText('');
        setInputTextId(null);
    };

    const addFile = (filename, content) => promptActions.addPromptFile('context', filename, content);

    const onSubmit = async (text) => {
        if (inputTextId()) {
            promptActions.editPrompt('context', inputTextId(), 'content', text);
            resetInputs();
            return;
        }
        promptActions.addPrompt('context', 'user', text);
        resetInputs();
    };

    const executeBash = async text => {
        if (!text) return;
        setPrompt('isRunning', true);
        try {
            const result = await ToolsAPIs.bash(text);
            promptActions.addPrompt('context', 'user', result);
        } catch(err) {
            console.error(err);
        } finally {
            setPrompt('isRunning', false);
        }
    };

    const onExecuteBash = async (text) => {
        await executeBash(text);
        resetInputs();
    };

    return <div class="flex flex-1 overflow-hidden">
        <Sidebar
            selectedPaths={selectedPaths}
            onSelectPath={onSelectPath}
            addSelectedPaths={addSelectedPaths}
            removeSelectedPaths={removeSelectedPaths}
            addPathToPrompt={addPathToPrompt}
            deselectAllPaths={deselectAllPaths}
        />

        <div class="flex flex-col flex-1 overflow-hidden">
            <div class="flex-1 overflow-hidden flex flex-col px-4 py-2">
                <ContextContainer
                    setInputText={setInputText}
                    setInputTextId={setInputTextId}
                    executeBash={executeBash}
                    selectedPaths={selectedPaths}
                />
            </div>

            <Show when={!prompt.isRunning}><InputPrompt
                inputText={inputText}
                setInputText={setInputText}
                inputTextId={inputTextId}
                setInputTextId={setInputTextId}
                addFile={addFile}
                enableAttachFiles={true}
                onSubmit={onSubmit}
                onExecuteBash={onExecuteBash}
            /></Show>
        </div>
    </div>;
}