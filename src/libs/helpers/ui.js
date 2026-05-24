
export const scrollToBottom = (ancor, behavior) => {
    if (ancor) requestAnimationFrame(() => {
        ancor.scrollTo({top: ancor.scrollHeight, behavior: behavior || 'auto'});
    });
};
