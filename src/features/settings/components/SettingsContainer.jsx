import { createEffect, createMemo, createSignal } from 'solid-js';
import DialogsAPIs from '@/src/services/dialogs';
import { useNotification } from '@/src/contexts/notificationContext';
import { settings, settingActions  } from '../stores/settingStore';
import { SyntaxValidation } from './SyntaxValidation';
import { BoxButton } from '@/src/components/Box';


export default function SettingsContainer() {
    const [inputText, setInputText] = createSignal('');
    const [syntaxErrorText, setSyntaxErrorText] = createSignal('');
    const { notify } = useNotification();
    const strSettings = createMemo(() => JSON.stringify(settings(), null, 4));
    const btnPadding = {x: 3, y: 2};
    const btnColorClass = 'bg-gray-200 hover:bg-gray-100';

    createEffect(() => {
        const s = strSettings();
        if (s) setInputText(s);
    });

    const handleKeyDown = async e => {
        if (e.key === 'Enter' && e.ctrlKey) { // Trigger on CTRL + Enter
            e.preventDefault();
            const text = e.currentTarget.value;
            await handleSave(text);
        }
    };

    const onUpdateInput = value => {
        setSyntaxErrorText('');
        setInputText(value);
        try {
            JSON.parse(value);
        } catch(e) {
            if (e instanceof SyntaxError) setSyntaxErrorText(e.message);
            else setSyntaxErrorText('');
        }
    };

    const handleUndo = () => setInputText(strSettings());

    const handleReset = async () => {
        const confirm = await DialogsAPIs.saveConfirmation('Are you sure you want to reset settings to defaults?');
        if (!confirm) return;
        try {
            const defaultSettings = await settingActions.getDefaultSettings();
            setInputText(defaultSettings);
            notify('Settings reset to defaults', 'success', { x: 'right', y: 'top' });
        } catch (e) {
            console.error('Failed to reset settings', e.message);
            notify('Failed to reset settings', 'error', { x: 'right', y: 'top' });
        }
    };

    const handleSave = async () => {
        if (syntaxErrorText() !== '') return;
        try {
            const parsedSettings = JSON.parse(inputText());
            await settingActions.saveSettings(parsedSettings);
            notify('Settings saved successfully', 'success', { x: 'right', y: 'top' });
        } catch(e) {
            if (e instanceof SyntaxError) {
                console.error('JSON Format Error:', e.message);
            }
            console.error('Failed to save settings:', e.message);
            notify('Failed to save settings. Please check JSON format.', 'error', { x: 'right', y: 'top' });
        }
    };

    return <div class="flex w-full justify-center p-6 text-sm font-semibold text-gray-800">
        <div class="flex flex-col w-full space-y-3">
            <div class="flex items-center justify-between">
                <div class='flex items-center gap-2 text-xs'>
                    <BoxButton px={btnPadding.x} py={btnPadding.y} colorClasses={btnColorClass} onClick={handleSave}>Save</BoxButton>
                    <BoxButton px={btnPadding.x} py={btnPadding.y} colorClasses={btnColorClass} onClick={handleUndo}>Undo last changes</BoxButton>
                    <BoxButton px={btnPadding.x} py={btnPadding.y} colorClasses={btnColorClass} onClick={handleReset}>Reset to defaults</BoxButton>
                </div>
                <div class="text-xs text-gray-400">v{__APP_VERSION__}</div>
            </div>
            <SyntaxValidation text={syntaxErrorText()} />
            <textarea
                name="settings"
                value={inputText()}
                onInput={(e) => onUpdateInput(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                spellcheck='false'
                class="w-full grow p-4 overflow-y-auto border border-gray-200 bg-white focus:outline-none focus:ring-0 text-gray-800 resize-none"
            />
        </div>
    </div>;
}