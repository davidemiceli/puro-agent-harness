import { createSignal, For, Show } from 'solid-js';
import { ChevronRightIcon, ChevronDownIcon } from './Icons';


export default function FileEntry(props) {
    const [isOpen, setIsOpen] = createSignal(false);
    const isSelected = () => props.selectedPaths().includes(props.item.currentPath);
    const isFolder = () => !!props.item.children;
    const isFolderClass = () => isFolder() ? 'font-bold text-yellow-600' : 'font-medium text-gray-900';

    const onClickItem = () => {
        if (isFolder()) setIsOpen(!isOpen());
        else props.onSelectPath(props.item.currentPath);
    };

    return <div class="select-none text-gray-800">
        <div 
            class="flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer text-xs transition-colors"
            classList={{ 'bg-gray-100': isSelected() }}
            onClick={onClickItem}
            onDblClick={() => { if (!isFolder()) props.addPathToPrompt(props.item.currentPath); }}
        >
            <span class="mr-1 w-3 text-center text-gray-500">
                <Show when={isFolder()} fallback={''}>
                    <Show when={isOpen()} fallback={<ChevronRightIcon class="w-4 h-4 object-contain" />}>
                        <ChevronDownIcon class="w-4 h-4 object-contain" />
                    </Show>
                </Show>
            </span>
            <span class={`${isFolderClass()} truncate`}>
                {props.item.name}
            </span>
        </div>

        <Show when={isFolder() && isOpen()}>
            <div class="ml-4 border-l border-gray-200">
                <For each={props.item.children}>
                    {(child) => 
                        <FileEntry 
                            item={child}
                            selectedPaths={props.selectedPaths}
                            onSelectPath={props.onSelectPath}
                            addSelectedPaths={props.addSelectedPaths}
                            addPathToPrompt={props.addPathToPrompt}
                        />
                    }
                </For>
            </div>
        </Show>
    </div>;
};