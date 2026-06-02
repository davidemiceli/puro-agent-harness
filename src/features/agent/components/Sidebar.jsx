import { onMount, createSignal, For, Suspense } from 'solid-js';
import { promptActions } from '@/src/features/prompt/stores/promptStore';
import { fileList, refreshFileList } from '../stores/fileList';
import { category, categoryActions } from '../stores/category';
import draggable from '@/src/directives/draggable'; // eslint-disable-line no-unused-vars
import { LoadingLocalSpinner } from '@/src/components/LoadingLocal';
import { BoxButton } from '@/src/components/Box';
import Tooltip from '@/src/components/Tooltip';
import { ContextUsage } from '@/src/components/ContextUsage';
import FileEntry from '@/src/components/FileEntry';
import { RefreshIcon, DeselectIcon, AddIcon, MinusIcon, DeleteIcon } from '@/src/components/Icons';
import { categoryClassName } from '../common/helpers';


export const Sidebar = (props) => {
    const [width, setWidth] = createSignal(448);
    const btnPadding = {x: 3, y: 2};
    const btnColorClass = 'bg-gray-200 hover:bg-gray-100 text-black';

    onMount(() => {
        refreshFileList();
    });

    return <div class="flex h-full overflow-hidden">
        <div style={{ width: `${width()}px` }} class="min-w-md bg-white text-black h-full flex flex-col divide-y divide-gray-200 border-r border-gray-200">
            <div class="flex gap-2 p-4">
                <ContextUsage />
            </div>
            <div class="flex items-center gap-2 p-4">
                <Tooltip text="Refresh List" position='right'>
                    <BoxButton colorClasses={btnColorClass} px={btnPadding.x} py={btnPadding.y} onClick={() => refreshFileList()}>
                        <RefreshIcon class="w-4 h-4 object-contain" />
                    </BoxButton>
                </Tooltip>
                <Tooltip text="Deselect" position='top'>
                    <BoxButton colorClasses={btnColorClass} px={btnPadding.x} py={btnPadding.y} onClick={() => props.deselectAllPaths()}>
                        <DeselectIcon class="w-4 h-4 object-contain" />
                    </BoxButton>
                </Tooltip>
                <div class='flex'>
                    <Tooltip text="Change type to add" position='top'>
                        <BoxButton px={btnPadding.x} py={btnPadding.y} classes='capitalize' colorClasses={`text-white ${categoryClassName(category.selectedCategory).bg}`} onClick={() => categoryActions.change()}>
                            {category.selectedCategory}
                        </BoxButton>
                    </Tooltip>
                    <Tooltip text="Add" position='top'>
                        <BoxButton colorClasses={btnColorClass} px={btnPadding.x} py={btnPadding.y} onClick={() => props.addSelectedPaths()}>
                            <AddIcon class="w-4 h-4 object-contain" />
                        </BoxButton>
                    </Tooltip>
                </div>
                <Tooltip text='Remove selected' position='top'>
                    <BoxButton colorClasses={btnColorClass} px={btnPadding.x} py={btnPadding.y} onClick={() => props.removeSelectedPaths()}>
                        <MinusIcon class="w-4 h-4 object-contain" />
                    </BoxButton>
                </Tooltip>
                <Tooltip text='Clear all' position='top'>
                    <BoxButton colorClasses={btnColorClass} px={btnPadding.x} py={btnPadding.y} onClick={() => promptActions.resetPromptByKey('system')}>
                        <DeleteIcon class="w-4 h-4 object-contain" />
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