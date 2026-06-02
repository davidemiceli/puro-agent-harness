import { For } from 'solid-js';
import { sessionCurrent } from '@/src/features/session/stores/sessionStore';
import SelectableItem from '@/src/components/SelectableItem';


export default function SessionList(props) {
    const actions = l => [
        {label: 'Save', func: () => props.onSave(l), classActive: 'hover:bg-sky-700'},
        {label: 'Delete', func: () => props.onDelete(l), classActive: 'hover:bg-red-600'}
    ];
    return <div class="w-full grid grid-cols-2 min-[2000px]:grid-cols-4 gap-4">
        <For each={props.data}>
            {(l) => <SelectableItem
                title={l}
                onSelect={() => props.onSelect(l)}
                actions={actions(l)}
                isActive={sessionCurrent() === l}
            />}
        </For>
    </div>;
}
