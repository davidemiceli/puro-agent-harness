import { Show } from 'solid-js';
import { workspaces, workspaceActions, workspaceCurrent } from '../stores/workspaceStore';
import { sessionActions } from '@/src/features/session/stores/sessionStore';
import { extractPathName } from '@/src/libs/helpers/utils';
import NoRecentItems from '@/src/components/NoRecentItems';
import SelectableItem from '@/src/components/SelectableItem';
import WorkspaceList from './WorkspaceList';


export default function WorkspaceContainer() {

    const handleCreateNew = () => {
        sessionActions.unloadSession();
        workspaceActions.new();
    };
    const handleSetCurrent = path => {
        sessionActions.unloadSession();
        workspaceActions.select(path);
    };
    const handleDelete = path => workspaceActions.delete(path);

    return <div class='w-full flex flex-col pt-4 gap-6'>
        <div class="flex gap-4">
            <div class="px-4 py-2 w-fit flex items-center justify-between gap-6 text-black bg-gray-200 transition-all hover:bg-sky-700 hover:text-white cursor-pointer" onClick={() => handleCreateNew()}>
                <div class="text-sm font-semibold uppercase tracking-wide">Open Folder</div>
                <div class="text-xl">→</div>
            </div>
            <Show when={workspaceCurrent()}>
                <SelectableItem
                    title={extractPathName(workspaceCurrent())}
                    subtitle={workspaceCurrent()}
                    isActive={true}
                />
            </Show>
        </div>
        <Show when={workspaces()?.length > 0} fallback={<NoRecentItems name='workspaces' />}>
            <div class="text-xs tracking-wide font-bold uppercase text-black">Recently Used</div>
            <WorkspaceList data={workspaces().filter(w => w !== workspaceCurrent())} onSelect={handleSetCurrent} onDelete={handleDelete} />
        </Show>
    </div>;
}
