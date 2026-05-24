

export const handleNameInput = setName => (e) => {
    // Regex: Keep letters, numbers, and hyphens. 
    // ^ means "not", so we replace anything that ISN'T in our list with empty string.
    const safeValue = e.currentTarget.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    // Update the signal and the input value directly to keep them in sync
    setName(safeValue);
    e.currentTarget.value = safeValue;
};
