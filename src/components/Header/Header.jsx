import { createMemo, For } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { workspaceCurrent } from '@/src/features/workspace/stores/workspaceStore';
import PageInfos from '@/src/components/PageInfos';
import { navigationData } from '@/src/routes/routes.data';
import RunningStatus from '../RunningStatus';


export default () => {
    const location = useLocation();
    const navigationAllowed = createMemo(() => {
        return workspaceCurrent() === null ? navigationData.filter(n => ['Workspace', 'Settings'].includes(n.name)) : navigationData;
    });
    return <header class="text-black z-10 text-xs font-semibold w-full">
        <nav class="flex items-center justify-between bg-gray-50">
            <div class="flex items-center">
                <For each={navigationAllowed()}>{
                    (n) => <A href={n.url} class="px-3 py-2 w-fit hover:bg-gray-100 cursor-pointer" activeClass="bg-gray-200" inactiveClass="bg-transparent">
                        {n.name}
                    </A>
                }</For>
            </div>
            <div class="px-3 flex items-center justify-end gap-4 text-gray-400">
                v{__APP_VERSION__}
            </div>
        </nav>
        <div class='border-y border-gray-200 bg-white'>
            <div class="grid grid-cols-6 gap-4">
                <div class='col-span-5 px-4 py-3'>
                    <For each={navigationAllowed().filter(n => n.url == location.pathname)}>{(n) => <PageInfos
                        title={n.title}
                        description={n.description} />
                    }</For>
                </div>
                <div class='col-span-1 px-4 py-3 flex items-center justify-end'>
                    <RunningStatus />
                </div>
            </div>
        </div>
    </header>;
};
