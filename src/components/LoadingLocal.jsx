

export default function LoadingLocal() {
    return <div
        class="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[1px] animate-pulse pointer-events-auto"
    />;
}

export function LoadingLocalSpinner() {
    return <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
    </div>;
}