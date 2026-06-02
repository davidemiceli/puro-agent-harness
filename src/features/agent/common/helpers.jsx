

export const categoryClassName = category => (
    category === 'agent' ? {bg: 'bg-sky-600', border: 'border-sky-600'} :
        category === 'skill' ? {bg: 'bg-green-700', border: 'border-green-700'} :
            category === 'rule' ? {bg: 'bg-orange-600', border: 'border-orange-600'} :
                {bg: 'bg-gray-800', border: 'border-gray-800'}
);
