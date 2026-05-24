
export const wait = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000));

// Estimates the token count range based on string length (just a raw estimation).
export function estimateTokensCount(text, tools = []) {
    let totalContent = text;

    if (tools.length > 0) {
        const toolsString = JSON.stringify(tools);
        totalContent += toolsString;
    }

    const charLen = totalContent.length;
    const toolOverhead = tools.length > 0 ? tools.length * 10 : 0;

    const minEstimate = Math.floor(charLen / 3.5) + toolOverhead;
    const maxEstimate = Math.ceil(charLen / 2.6) + toolOverhead;
    const average = Math.round((minEstimate + maxEstimate) / 2);

    return {
        min: minEstimate,
        max: maxEstimate,
        average
    };
}

export const extractPathName = p => p?.split('/').filter(Boolean).at(-1);

export const formatDateTime = d => {
    const zonedDateTime = new Date(d); // When node.js lts will be > v26 use: const zonedDateTime = Temporal.Instant.from(d).toZonedDateTimeISO(Temporal.Now.timeZoneId()),
    const options = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    return zonedDateTime.toLocaleString('en-US', options).replace(/,/g, '');
};

export const CamelCaseToSpaceSeparated = s => s.replace(/([A-Z])/g, ' $1').toLowerCase().trim();

export const buildFileTree = (fileList) => {
    const root = [];
    const pathMap = new Map();

    fileList.forEach(({ relativePath, isDirectory }) => {
        const segments = relativePath.split(/[/\\]/).filter(Boolean);
        let currentPath = '';
        let currentLevel = root;

        segments.forEach((segment, index) => {
            const isLast = index === segments.length - 1;
            currentPath += (currentPath ? '/' : '') + segment;

            if (pathMap.has(currentPath)) {
                currentLevel = pathMap.get(currentPath);
            } else {
                const newItem = { name: segment, currentPath };

                if (!isLast || isDirectory) {
                    newItem.children = [];
                    pathMap.set(currentPath, newItem.children);
                }

                currentLevel.push(newItem);
                
                if (newItem.children) currentLevel = newItem.children;
            }
        });
    });

    return root;
};

export const extractFilesFromPrompt = text => {
    const openTagRegex = /<file name="([^"]+)">/g;
    let match;
    const files = [];
    while ((match = openTagRegex.exec(text)) !== null) {
        const name = match[1];
        const start = match.index + match[0].length;
        
        let depth = 1;
        let pos = start;
        
        while (depth > 0 && pos < text.length) {
            const nextOpen = text.indexOf('<file', pos);
            const nextClose = text.indexOf('</file>', pos);

            if (nextClose === -1) break; // Malformed

            if (nextOpen !== -1 && nextOpen < nextClose) {
                depth++;
                pos = nextOpen + 5;
            } else {
                depth--;
                if (depth === 0) {
                    const content = text.substring(start, nextClose);
                    files.push({name, content});
                    openTagRegex.lastIndex = nextClose + 7; // Skip the closing tag
                }
                pos = nextClose + 7;
            }
        }
    }
    return files;
};