import { Show } from 'solid-js';


export function NotificationUI(props) {
    const xMap = { left: 'left-5', center: 'left-1/2 -translate-x-1/2', right: 'right-5' };
    const yMap = { top: 'top-5', bottom: 'bottom-5' };
    const typeStyles = {
        success: 'bg-green-200/20 text-green-800',
        error: 'bg-red-200/20 text-red-800',
        info: 'bg-sky-200/20 text-sky-800'
    };

    return <Show when={props.data}>
        <div class={`fixed z-[9999] pointer-events-none ${xMap[props.data.position.x]} ${yMap[props.data.position.y]}`}>
            <div class={`px-8 py-6 shadow transition-all ${typeStyles[props.data.type] || typeStyles.info} pointer-events-auto`}>
                <p class="text-xs font-medium">{props.data.message}</p>
            </div>
        </div>
    </Show>;
}