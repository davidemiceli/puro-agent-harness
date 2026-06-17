import { createMemo, For } from 'solid-js';
import { A } from '@solidjs/router';
import APIs from '@/src/services/apis';
import Tooltip from '@/src/components/Tooltip';
import { Settings, Folder, FolderGit2, MessageSquareDiff, BotMessageSquare, MessagesSquare, CircleQuestionMark } from 'lucide-solid';
import { GithubIcon } from '@/src/components/Icons';
import { workspaceCurrent } from '@/src/features/workspace/stores/workspaceStore';
import { navigationData } from '@/src/routes/routes.data';

const iconMap = {
    Workspace: Folder,
    Settings: Settings,
    Session: FolderGit2,
    Agent: BotMessageSquare,
    Prompt: MessageSquareDiff,
    Chat: MessagesSquare,
    About: CircleQuestionMark
};

function MenuSidebarLink(props) {
    const Icon = iconMap[props.item.name];
    
    return <Tooltip text={props.item.name} position="right">
        <A
            href={props.item.url}
            class="py-2.5 px-3 first:mt-1 transition-colors cursor-pointer" activeClass="bg-gray-100 text-sky-700" inactiveClass="text-gray-400 hover:text-gray-800"
        >
            <Icon absoluteStrokeWidth={true} />
        </A>
    </Tooltip>;
}

export default function MenuSidebar() {
    const navigationAllowed = createMemo(() => {
        return workspaceCurrent() === null 
            ? navigationData.filter(n => ['Workspace', 'Settings'].includes(n.name)) 
            : navigationData;
    });

    return <div class="flex flex-col items-center text-black border-r border-gray-200 w-fit">
        <For each={navigationAllowed()}>
            {(n) => <MenuSidebarLink item={n} />}
        </For>
        <Tooltip text='Repository' position="right">
            <div
                class="py-2.5 px-3 text-gray-400 hover:text-gray-800 transition-colors cursor-pointer"
                onClick={() => APIs.openBrowser('https://github.com/davidemiceli/puro-agent-harness')}
            >
                <GithubIcon class="w-6 h-6" />
            </div>
        </Tooltip>
    </div>;
}