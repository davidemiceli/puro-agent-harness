
export const scrollToBottom = (ancor, behavior) => {
    if (ancor) requestAnimationFrame(() => {
        ancor.scrollTo({top: ancor.scrollHeight, behavior: behavior || 'auto'});
    });
};

export const categoryClassName = category => (
    category === 'agent' ? {bg: 'bg-sky-600', border: 'border-sky-600', text: 'text-sky-600'} :
        category === 'skill' ? {bg: 'bg-green-700', border: 'border-green-700', text: 'text-green-700'} :
            category === 'rule' ? {bg: 'bg-orange-600', border: 'border-orange-600', text: 'text-orange-600'} :
                {bg: 'bg-gray-800', border: 'border-gray-800', text: 'text-gray-800'}
);

export const roleClassName = role => (
    role === 'user' ? {bg: 'bg-sky-600', border: 'border-sky-600'} :
        role === 'assistant' ? {bg: 'bg-green-700', border: 'border-green-700'} :
            role === 'tool' ? {bg: 'bg-orange-600', border: 'border-orange-600'} :
                {bg: 'bg-gray-800', border: 'border-gray-800'}
);
