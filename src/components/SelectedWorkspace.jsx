import { Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { WorkspaceMiniIcon } from '@/src/components/Icons';
import { workspaceCurrent } from '@/src/features/workspace/stores/workspaceStore';
import { extractPathName } from '@/src/libs/helpers/utils';


export default function SelectedWorkspace() {
    const navigate = useNavigate();

    const changeWorkspace = () => navigate('/workspace', { replace: true });

    return <Show when={workspaceCurrent()}>
        <div class="flex items-center justify-start gap-2 px-4 py-2 bg-gray-50 text-gray-600 hover:text-gray-700 transition-colors text-xs font-semibold cursor-pointer" onClick={changeWorkspace}>
            <WorkspaceMiniIcon class="text-gray-400 w-4 h-4 object-contain" />
            <div class="truncate">{extractPathName(workspaceCurrent())}</div>
        </div>
    </Show>;
};