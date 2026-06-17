
export const formatKilo = (v) => (v / 1000).toFixed(2).replace(/\.00$/, '');

export const calcPercentage = (value, limit) => Math.min(Math.max((value / limit) * 100, 0), 100);

export const getProgressStyles = (percent) => {
    if (percent == 0) return { bar: 'bg-gray-200', text: 'text-gray-500' };
    if (percent >= 70) return { bar: 'bg-red-700', text: 'text-red-700' };
    if (percent >= 45) return { bar: 'bg-yellow-500', text: 'text-yellow-600' };
    return { bar: 'bg-green-600', text: 'text-green-700' };
};
