import { createEffect, createSignal, Show } from 'solid-js';
import { sessions, sessionActions } from '../stores/sessionStore';
import NoRecentItems from '@/src/components/NoRecentItems';
import SessionList from './SessionList';
import { handleNameInput } from '../common/helpers';


export default function SessionContainer() {
    const [name, setName] = createSignal('');

    createEffect(() => {
        sessionActions.loadWorkspaceSessions();
    });

    const handleCreateNew = () => sessionActions.saveSession(name());
    const handleSave = sessionName => sessionActions.saveSession(sessionName);
    const handleLoad = sessionName => sessionActions.loadSession(sessionName);
    const handleDelete = sessionName => sessionActions.deleteSession(sessionName);

    return <div class='w-full flex flex-col pt-4 gap-6'>
        <div class="flex gap-0">
            <div class="w-fit min-w-96 h-full">
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={name()}
                    onInput={handleNameInput(setName)}
                    class="py-2 px-3 w-full h-full text-sm focus:outline-none focus:ring-0 focus:border-transparent bg-gray-50 text-black"
                    placeholder="New session name"
                />
            </div>
            <div class="px-4 py-3 w-fit h-full flex items-center justify-between gap-6 text-black bg-gray-200 transition-all hover:bg-sky-700 hover:text-white cursor-pointer" onClick={handleCreateNew}>
                <div class="text-sm font-semibold uppercase tracking-wide">Add New</div>
            </div>
        </div>
        <Show when={sessions()?.length > 0} fallback={<NoRecentItems name='sessions' />}>
            <div class="text-xs tracking-wide font-bold uppercase text-black">Recently Used</div>
            <SessionList
                data={sessions()}
                onSelect={handleLoad}
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </Show>
    </div>;
}
