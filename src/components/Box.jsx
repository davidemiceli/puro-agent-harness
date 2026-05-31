import { createMemo, Show, children } from 'solid-js';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';


export function Box(props) {
    const resolved = children(() => props.children);
    return <div class={`w-full text-gray-900 font-mono font-normal text-sm ${props.classes}`}>
        {resolved}
    </div>;
}

export function BoxButton(props) {
    const resolved = children(() => props.children);
    const colorClass = () => props.colorClasses ? props.colorClasses : 'bg-gray-400 text-white';
    const customClass = () => props.classes || '';
    const px = () => props.px || 2;
    const py = () => props.py || 1;
    const baseClass = 'text-xs w-fit font-semibold cursor-pointer';
    const fullClass = createMemo(() => `px-${px()} py-${py()} ${baseClass} ${colorClass()} ${customClass()} transition-all`);
    return <button aria-label={props['aria-label']} class={fullClass()} onClick={props.onClick}>
        {resolved}
    </button>;
}

export function BoxInfo(props) {
    const colorClass = () => props.colorClasses ? props.colorClasses : 'text-gray-600 bg-gray-50';
    const customClass = () => props.classes || '';
    const baseClass = 'px-2 py-1 text-xs w-fit font-semibold cursor-default';
    const fullClass = createMemo(() => `${baseClass} ${colorClass()} ${customClass()}`);
    return <div class={fullClass()}>
        {props.children}
    </div>;
}

export const BoxButtonShowMore = (props) => <BoxButton ariaLabel={`Show ${props.showMore ? 'More' : 'Less' }`} colorClasses='text-black bg-gray-200' classes='hover:bg-gray-100' onClick={props.toggleShowMore}>
    <Show when={props.showMore} fallback={<ChevronDownIcon class="w-4 h-4 object-contain" />}>
        <ChevronUpIcon class="w-4 h-4 object-contain" />
    </Show>
</BoxButton>;
