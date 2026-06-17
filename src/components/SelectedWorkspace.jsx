import { Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { FolderOpen } from 'lucide-solid';
import { workspaceCurrent } from '@/src/features/workspace/stores/workspaceStore';
import { extractPathName } from '@/src/libs/helpers/utils';


export default function SelectedWorkspace() {
    const navigate = useNavigate();

    const changeWorkspace = () => navigate('/workspace', { replace: true });

    return <Show when={workspaceCurrent()}>
        <div class="flex items-center justify-start gap-2 px-4 py-2 bg-gray-50 text-gray-600 hover:text-gray-700 transition-colors text-xs font-semibold cursor-pointer" onClick={changeWorkspace}>
            <FolderOpen size={20} />
            <div class="truncate">{extractPathName(workspaceCurrent())}</div>
        </div>
    </Show>;
};