import { Show } from 'solid-js';


export function SyntaxValidation(props) {
    const classColor = () => props.text ? 'border-red-700 text-red-700' : 'border-green-700 text-green-700';
    return <div class={`px-3 py-2 w-full text-xs bg-gray-50 border-l-6 ${classColor()} truncate`}>
        <Show when={props.text} fallback={'Syntax is correct.'}>
            Syntax Error: {props.text}.
        </Show>
    </div>;
}
