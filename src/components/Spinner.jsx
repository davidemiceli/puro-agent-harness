import { mergeProps, Show } from 'solid-js';


export default function LoadingSpinner(props) {
    const config = mergeProps({ 
        loading: false, 
        color: 'bg-gray-700', 
        size: 'h-3 w-3' 
    }, props);

    return <div class="flex items-center justify-center">
        <span class="relative flex">
            {/* Show circle pulse when loading is true */}
            <Show when={config.loading}>
                <span 
                    class={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.color}`}
                ></span>
            </Show>

            {/* The base circle always visible */}
            <span 
                class={`relative inline-flex rounded-full ${config.size} ${config.color} transition-opacity duration-300`}
                class:opacity-50={!config.loading}
            ></span>
        </span>
    </div>;
}