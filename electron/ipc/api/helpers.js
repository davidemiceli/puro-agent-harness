import { readFile } from 'node:fs/promises';


// Helper to create a simple file-ignoring function based on a configuration file (like .gitignore)
const patternToRegex = (pattern) => {
    // Remove trailing slash as it's redundant for the regex logic
    const sanitized = pattern.endsWith('/') ? pattern.slice(0, -1) : pattern;

    // Escape special regex chars
    let regexStr = sanitized.replace(/[.+^${}()|[\]\\]/g, '\\$&');

    // Convert glob syntax
    regexStr = regexStr
        .replace(/\*\*/g, '(.+)')     // ** matches deep
        .replace(/\*/g, '[^/]*')      // * matches within dir
        .replace(/\?/g, '.');         // ? matches single char

    // Anchor logic
    if (pattern.startsWith('/')) {
        const base = regexStr.substring(1);
        // Matches "root/pattern" OR "root/pattern/anything"
        return new RegExp(`^${base}($|/)`);
    } else {
        // Matches "pattern" at start OR "/pattern", 
        // AND ensures it's the end of string OR a directory boundary
        return new RegExp(`(^|/)${regexStr}($|/)`);
    }
};

export const isIgnored = (ignoreContent) => {
    const ignorePatterns = ignoreContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
    const ignoreRegexes = ignorePatterns.map(patternToRegex);
    return (relPath) => ignoreRegexes.some(re => re.test(relPath));
};

export const isIgnoredFactory = async (ignoreFilePath) => {
    try {
        const ignoreContent = await readFile(ignoreFilePath, 'utf-8');
        return isIgnored(ignoreContent);
    } catch {
        // If .aiignore doesn't exist, proceed with empty patterns
        return () => false;
    }
};

