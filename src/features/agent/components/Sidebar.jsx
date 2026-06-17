import { Show, onMount, createSignal, For, Suspense } from 'solid-js';
import { llm } from '@/src/stores/llmStore';
import { promptActions } from '@/src/features/prompt/stores/promptStore';
import { fileList, refreshFileList } from '../stores/fileList';
import { category, categoryActions } from '../stores/category';
import draggable from '@/src/directives/draggable'; // eslint-disable-line no-unused-vars
import { LoadingLocalSpinner } from '@/src/components/LoadingLocal';
import { BoxButton } from '@/src/components/Box';
import Tooltip from '@/src/components/Tooltip';
import { ContextUsage } from '@/src/components/ContextUsage';
import { LastContextUsage } from '@/src/components/ContextUsage';
import FileEntry from '@/src/components/FileEntry';
import { FileX, FilePlus, FileMinus, SquareDashedMousePointer, FolderSync } from 'lucide-solid';
import { categoryClassName } from '@/src/libs/helpers/ui';


export const Sidebar = (props) => {
    const [width, setWidth] = createSignal(448);
    const btnPadding = {x: 2, y: 2};
    const btnColorClass = 'bg-transparent text-gray-600 hover:text-black';

    onMount(() => {
        refreshFileList();
    });

    return <div class="flex h-full overflow-hidden">
        <div style={{ width: `${width()}px` }} class="min-w-md bg-white text-black h-full flex flex-col divide-y divide-gray-200 border-r border-gray-200">
            <div class="flex gap-2 p-4">
                <ContextUsage />
            </div>
            <Show when={llm.lastResponseMeta}>
                <div class="flex gap-2 p-4">
                    <LastContextUsage />
                </div>
            </Show>
            <div class="flex items-center px-2 text-xs">
                <Tooltip text="Refresh List" position='right'>
                    <BoxButton colorClasses={btnColorClass} px={btnPadding.x} py={btnPadding.y} onClick={() => refreshFileList()}>
                        <FolderSync size={20} />
                    </BoxButton>
                </Tooltip>
                <Tooltip text="Deselect" position='top'>
                    <BoxButton colorClasses={btnColorClass} px={btnPadding.x} py={btnPadding.y} onClick={() => props.deselectAllPaths()}>
                        <SquareDashedMousePointer size={20} />
                    </BoxButton>
                </Tooltip>
                <Tooltip text='Clear all' position='top'>
                    <BoxButton colorClasses={btnColorClass} px={btnPadding.x} py={btnPadding.y} onClick={() => promptActions.resetPromptByKey('system')}>
                        <FileX size={20} />
                    </BoxButton>
                </Tooltip>
                <Tooltip text='Remove selected' position='top'>
                    <BoxButton colorClasses={btnColorClass} px={btnPadding.x} py={btnPadding.y} onClick={() => props.removeSelectedPaths()}>
                        <FileMinus size={20} />
                    </BoxButton>
                </Tooltip>
                <Tooltip text="Add" position='top'>
                    <BoxButton colorClasses={btnColorClass} px={btnPadding.x} py={btnPadding.y} onClick={() => props.addSelectedPaths()}>
                        <FilePlus size={20} />
                    </BoxButton>
                </Tooltip>
                <Tooltip text="Change type to add" position='top'>
                    <BoxButton px={btnPadding.x} py={btnPadding.y} classes='capitalize' colorClasses={`bg-gray-50 ${categoryClassName(category.selectedCategory).text}`} onClick={() => categoryActions.change()}>
                        {category.selectedCategory}
                    </BoxButton>
                </Tooltip>
            </div>
            <div class="flex-1 overflow-y-auto py-2">
                <Suspense fallback={<LoadingLocalSpinner />}>
                    <For each={fileList()}>
                        {(item) => 
                            <FileEntry
                                item={item}
                                selectedPaths={props.selectedPaths}
                                onSelectPath={props.onSelectPath}
                                addSelectedPaths={props.addSelectedPaths}
                                addPathToPrompt={props.addPathToPrompt}
                            />
                        }
                    </For>
                </Suspense>
            </div>
            <div class="flex px-4 py-2 font-medium text-xs bg-gray-50 text-gray-700">
                {props.selectedPaths().length} selected files
            </div>
        </div>

        <div
            use:draggable={setWidth}
            class="w-1 cursor-col-resize bg-transparent hover:bg-gray-300 transition-all active:bg-gray-400 z-10"
            title="Resize Sidebar"
        />
    </div>;
};