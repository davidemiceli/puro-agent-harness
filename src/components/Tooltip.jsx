
export default function Tooltip(props) {
    const pos = props.position ?? 'top';

    const positionClasses = {
        top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
        bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
        left: 'right-full mr-2 top-1/2 -translate-y-1/2',
        right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    };

    const sharedStyles = 'bg-white text-gray-700';

    return <div class="relative group flex items-center justify-center">
        {props.children}
        <span 
            class={`
                absolute hidden group-hover:flex 
                px-2 py-1 text-xs font-semibold rounded 
                whitespace-nowrap pointer-events-none z-50 shadow-xl
                ${sharedStyles}
                ${positionClasses[pos] || positionClasses.top}
            `}
        >
            {props.text}
            <div class={`
                absolute w-2 h-2 rotate-45
                ${sharedStyles}
                ${pos === 'top' ? 'bottom-[-3px] left-1/2 -translate-x-1/2' : ''}
                ${pos === 'bottom' ? 'top-[-3px] left-1/2 -translate-x-1/2' : ''}
                ${pos === 'left' ? 'right-[-3px] top-1/2 -translate-y-1/2' : ''}
                ${pos === 'right' ? 'left-[-3px] top-1/2 -translate-y-1/2' : ''}
            `} />
        </span>
    </div>;
};