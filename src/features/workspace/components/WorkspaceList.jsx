import { createMemo, For } from 'solid-js';
import { extractPathName } from '@/src/libs/helpers/utils';
import SelectableItem from '@/src/components/SelectableItem';


export default function WorkspaceList(props) {
    const items = createMemo(() => props.data.map(path => ({
        name: extractPathName(path),
        path
    })));
    const actions = l => [
        {label: 'Delete', func: () => props.onDelete(l.path), classActive: 'hover:bg-red-600'}
    ];
    return <div class="w-full grid grid-cols-2 min-[2000px]:grid-cols-4 gap-4">
        <For each={items()}>
            {(l) => <SelectableItem
                title={l.name}
                subtitle={l.path}
                onSelect={() => props.onSelect(l.path)}
                actions={actions(l)}
                isActive={false}
            />}
        </For>
    </div>;
}
