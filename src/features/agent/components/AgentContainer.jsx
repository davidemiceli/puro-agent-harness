import { createEffect, For, createSignal } from 'solid-js';
import { scrollToBottom } from '@/src/libs/helpers/ui';
import { prompt, promptActions } from '@/src/features/prompt/stores/promptStore';
import SystemItem from './SystemItem';


export default function SystemContainer(props) {
    let containerRef; // eslint-disable-line no-unassigned-vars
    const [draggedIndex, setDraggedIndex] = createSignal(-1);

    createEffect(() => {
        const _ = prompt.system.at(-1);
        scrollToBottom(containerRef, 'smooth');
    });

    const handleDragStart = (index) => setDraggedIndex(index);
    const handleDrop = (targetIndex, dropDir) => {
        const fromIndex = draggedIndex();
        if (fromIndex === targetIndex) {
            setDraggedIndex(-1);
            return;
        }
        const toIndex = dropDir === 'after' ? targetIndex + 1 : targetIndex;
        if (toIndex >= 0 && toIndex <= prompt.system.length) {
            promptActions.movePromptAtIndex('system', fromIndex, toIndex);
        }
        setDraggedIndex(-1);
    };
    const handleDragEnd = () => setDraggedIndex(-1);

    return <div ref={containerRef} class="w-full flex flex-col font-sm overflow-y-auto gap-4">
        <For each={prompt.system}>{(r, i) => <SystemItem
            r={r}
            index={i()}
            draggedIndex={draggedIndex()}
            selectedPaths={props.selectedPaths}
            onDragStart={() => handleDragStart(i())}
            onDrop={(dir) => handleDrop(i(), dir)}
            onDragEnd={handleDragEnd}
        />}</For>
    </div>;
}
