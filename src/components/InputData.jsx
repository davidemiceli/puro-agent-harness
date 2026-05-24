import { splitProps } from 'solid-js';


export default function InputData(props) {
    const [local, others] = splitProps(props, ['class', 'label', 'error']);

    return <div class="flex flex-col gap-1 w-full">
        {local.label && <label class="text-xs font-medium text-gray-700 ml-1">
            {local.label}
        </label>}
        
        <input
            {...others}
            class={`
                py-2 px-3 w-full h-full text-sm 
                focus:outline-none focus:ring-0 focus:border-transparent 
                bg-gray-50 text-black border border-gray-200 rounded-md
                transition-colors duration-200
                ${local.class || ''}
            `}
            classList={{
                'border-red-400 bg-red-50': !!local.error,
                'hover:bg-gray-100': !local.error,
            }}
        />

        {local.error && <span class="text-xs text-red-500 ml-1">
            {local.error}
        </span>}
    </div>;
};