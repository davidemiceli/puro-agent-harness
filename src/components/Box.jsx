import { createMemo, Show, children, splitProps } from 'solid-js';
import { ChevronDown, ChevronUp } from 'lucide-solid';


export function Box(props) {
    const resolved = children(() => props.children);
    const [local, rest] = splitProps(props, ['class', 'classes', 'children']);
    return <div class={`w-full text-gray-900 font-normal ${local.classes}`} {...rest}>
        {resolved}
    </div>;
}

export function BoxButton(props) {
    const resolved = children(() => props.children);
    const colorClass = () => props.colorClasses ? props.colorClasses : 'bg-gray-400 text-white';
    const customClass = () => props.classes || '';
    const px = () => props.px || 2;
    const py = () => props.py || 1;
    const baseClass = 'flex items-center justify-center w-fit font-semibold cursor-pointer';
    const fullClass = createMemo(() => `px-${px()} py-${py()} ${baseClass} ${colorClass()} ${customClass()} transition-all`);
    return <button aria-label={props['aria-label']} class={fullClass()} onClick={props.onClick}>
        {resolved}
    </button>;
}

export function BoxInfo(props) {
    const colorClass = () => props.colorClasses ? props.colorClasses : 'text-gray-600 bg-gray-50';
    const customClass = () => props.classes || '';
    const px = () => props.px || 2;
    const py = () => props.py || 1;
    const baseClass = 'flex items-center justify-center w-fit font-semibold cursor-default';
    const fullClass = createMemo(() => `px-${px()} py-${py()} ${baseClass} ${colorClass()} ${customClass()}`);
    return <div class={fullClass()}>
        {props.children}
    </div>;
}

export function BoxButtonShowMore(props) {
    const colorClass = () => props.colorClasses ? props.colorClasses : 'text-black bg-gray-200 hover:bg-gray-100';
    return <BoxButton px={props.px} py={props.py} ariaLabel={`Show ${props.showMore ? 'More' : 'Less' }`} colorClasses={colorClass()} onClick={props.toggleShowMore}>
        <Show when={props.showMore} fallback={<ChevronDown absoluteStrokeWidth={true} size={16} />}>
            <ChevronUp absoluteStrokeWidth={true} size={16} />
        </Show>
    </BoxButton>;
}
