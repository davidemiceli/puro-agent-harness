import { Show, createSignal } from 'solid-js';
import { prompt, promptActions } from '@/src/features/prompt/stores/promptStore';
import ChatContainer from './components/ChatContainer';
import InputChat from './components/InputChat';


export default function Chat() {
    const [inputTextId, setInputTextId] = createSignal(null);
    const [inputText, setInputText] = createSignal('');

    const resetInputs = () => {
        setInputText('');
        setInputTextId(null);
    };

    const onSubmit = async (text) => {
        if (inputTextId()) {
            promptActions.editPrompt('context', inputTextId(), 'content', text);
            resetInputs();
            return;
        }
        promptActions.addPrompt('context', 'user', text);
        resetInputs();
    };

    return <div class="flex flex-col flex-1 overflow-hidden">
        <div class="flex-1 overflow-hidden flex flex-col items-center px-4 py-2">
            <ChatContainer />
        </div>
        <Show when={!prompt.isRunning}><InputChat
            inputText={inputText}
            setInputText={setInputText}
            inputTextId={inputTextId}
            setInputTextId={setInputTextId}
            enableAttachFiles={true}
            onSubmit={onSubmit}
        /></Show>
    </div>;
}