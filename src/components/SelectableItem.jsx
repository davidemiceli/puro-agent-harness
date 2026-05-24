import { Show, For } from 'solid-js';
import { BoxButton } from './Box';


export default (props) => {
    const containerClass = () => `
        py-3 px-4 flex flex-col gap-3 text-xs font-normal transition-all cursor-pointer
        ${props.isActive 
        ? 'text-sky-800 border border-gray-300 bg-gray-100' 
        : 'text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'}
    `;

    const handleFunc = func => (e) => {
        e.stopPropagation();
        func();
    };
    const handleSelect = (e) => {
        e.stopPropagation();
        props.onSelect();
    };

    const colorClasses = 'text-gray-800 bg-gray-200 hover:text-white';
    return <div class={containerClass()} onClick={handleSelect}>
        <div class="flex items-center gap-3">
            <div class="flex flex-col gap-2 min-w-0">
                <div class={`font-bold uppercase tracking-wide ${props.isActive ? '' : 'text-black'} truncate`}>
                    {props.title}
                </div>
                <Show when={props.subtitle}>
                    <div class="font-semibold truncate">
                        {props.subtitle}
                    </div>
                </Show>
            </div>
        </div>
        <Show when={props.actions}>
            <div class="flex items-center justify-end ml-4 gap-1">
                <For each={props.actions}>{
                    (a) => <BoxButton
                        onClick={handleFunc(a.func)}
                        colorClasses='text-gray-800 bg-gray-200 hover:text-white'
                        px={4} py={2}
                        classes={a.classActive}>{a.label}</BoxButton>
                }</For>
            </div>
        </Show>
    </div>;
};
