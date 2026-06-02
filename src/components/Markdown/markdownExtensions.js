import { processFootnotes } from './footnoteHelpers';

// BLOCK MATH: matches $$...$$
export const mathBlock = {
    name: 'math',
    level: 'block',
    start(src) { return src.match(/^\s*\$\$/m)?.index; },
    tokenizer(src) {
        const match = /^\s*\$\$([\s\S]*?)\$\$(?:\s*(?:\n|$))/.exec(src);
        if (match) {
            return {
                type: 'math',
                raw: match[0],
                text: match[1].trim(),
            };
        }
    }
};

// INLINE MATH: matches $...$ and $`...`$
export const mathInline = {
    name: 'inlineMath',
    level: 'inline',
    start(src) { return src.indexOf('$'); },
    tokenizer(src) {
        const dollarTickStyle = /^\$`((?:[^`]|`[^$])+)`\$/.exec(src);
        if (dollarTickStyle) {
            return {
                type: 'inlineMath',
                raw: dollarTickStyle[0],
                text: dollarTickStyle[1].trim(),
                displayMode: false
            };
        }

        const standardStyle = /^\$([^\s\$\n](?:[^\$\n]*[^\s\$\n])?)\$(?!\d)/.exec(src); // eslint-disable-line no-useless-escape

        if (standardStyle) {
            const content = standardStyle[1];
            const isCurrency = /^[\d,.]+(?:\s*[a-zA-Z]{3})?$/.test(content);
            const containsMath = /[\/\*\+\-=\\^_{}]/.test(content); // eslint-disable-line no-useless-escape

            if (!isCurrency || containsMath) {
                return {
                    type: 'inlineMath',
                    raw: standardStyle[0],
                    text: content.trim(),
                    displayMode: false
                };
            }
        }

    }
};

// SUBSCRIPT: matches ~text~ (single ~, not ~~)
export const subscript = {
    name: 'subscript',
    level: 'inline',
    start(src) { return src.indexOf('~'); },
    tokenizer(src) {
        const match = /^~(?![~])(.+?)(?<![~])~/.exec(src);
        if (match) {
            return {
                type: 'subscript',
                raw: match[0],
                tokens: this.lexer?.inlineTokens(match[1]),
            };
        }
    }
};

// SUPERSCRIPT: matches ^text^
export const superscript = {
    name: 'superscript',
    level: 'inline',
    start(src) { return src.indexOf('^'); },
    tokenizer(src) {
        const match = /^\^([^\^]+?)\^/.exec(src); // eslint-disable-line no-useless-escape
        if (match) {
            return {
                type: 'superscript',
                raw: match[0],
                tokens: this.lexer?.inlineTokens(match[1]),
            };
        }
    }
};

// INSERTED: matches ++text++
export const inserted = {
    name: 'inserted',
    level: 'inline',
    start(src) { return src.indexOf('++'); },
    tokenizer(src) {
        const match = /^\+\+(.+?)\+\+/.exec(src);
        if (match) {
            return {
                type: 'inserted',
                raw: match[0],
                tokens: this.lexer?.inlineTokens(match[1]),
            };
        }
    }
};

// MARKED TEXT: matches ==text==
export const markedText = {
    name: 'markedText',
    level: 'inline',
    start(src) { return src.indexOf('=='); },
    tokenizer(src) {
        const match = /^==(.+?)==/.exec(src);
        if (match) {
            return {
                type: 'markedText',
                raw: match[0],
                tokens: this.lexer?.inlineTokens(match[1]),
            };
        }
    }
};

// CUSTOM CONTAINER: matches ::: name ... :::
export const customContainer = {
    name: 'customContainer',
    level: 'block',
    start(src) { return src.match(/^:::/m)?.index; },
    tokenizer(src) {
        const match = /^:::\s*(\w+)\n([\s\S]*?)\n:::\s*(?:\n|$)/.exec(src);
        if (!match) return;
        return {
            type: 'customContainer',
            raw: match[0],
            name: match[1],
            tokens: this.lexer?.blockTokens(match[2]),
        };
    }
};

// ABBREVIATION DEFINITION: matches *[ABBR]: Full Text (block level)
export const abbreviationBlock = {
    name: 'abbreviation',
    level: 'block',
    start(src) { return src.match(/^\s*\*\[/m)?.index; },
    tokenizer(src) {
        const match = /^\s*\*\[([^\]]+)\]:\s*(.+?)(?:\n|$)/.exec(src);
        if (match) {
            return {
                type: 'abbreviation',
                raw: match[0],
                abbr: match[1],
                title: match[2],
            };
        }
    }
};

// FOOTNOTE REFERENCE: matches [^id] inside paragraphs
export const footnoteRef = {
    name: 'footnoteRef',
    level: 'inline',
    start(src) { return src.indexOf('[^'); },
    tokenizer(src) {
        const match = /^\[(\^[^\]]+)\]/.exec(src);
        if (match) {
            return { type: 'footnoteRef', raw: match[0], id: match[1] };
        }
    }
};

// INLINE FOOTNOTE: matches ^[text] (must be registered before superscript)
export const footnoteInline = {
    name: 'footnoteInline',
    level: 'inline',
    start(src) { return src.indexOf('^['); },
    tokenizer(src) {
        const match = /^\^\[([\s\S]+?)\]/.exec(src);
        if (match) {
            return {
                type: 'footnoteInline',
                raw: match[0],
                text: match[1].trim(),
            };
        }
    }
};

// FOOTNOTE DEFINITION: matches [^id]: content (block level, multi-paragraph)
export const footnoteBlock = {
    name: 'footnoteDefinition',
    level: 'block',
    start(src) { return src.match(/^\s*\[(\^[^\]]+)\]:\s*/m)?.index; },
    tokenizer(src) {
        const match = /^\s*\[(\^[^\]]+)\]:\s*/.exec(src);
        if (!match) return;
        const id = match[1];
        let raw = match[0];
        let body = '';
        let pos = match[0].length;

        const firstLineMatch = /^([^\n]*)/.exec(src.slice(pos));
        if (firstLineMatch) {
            body += firstLineMatch[1];
            raw += firstLineMatch[0];
            pos += firstLineMatch[0].length;
        }

        let continued = true;
        while (continued) {
            continued = false;
            const rest = src.slice(pos);
            const contMatch = /^\n\n((?: {4,}|\t+)[^\n]+(?:\n(?: {4,}|\t+)[^\n]+)*)/.exec(rest);
            if (contMatch) {
                body += '\n\n' + contMatch[1];
                raw += contMatch[0];
                pos += contMatch[0].length;
                continued = true;
            }
        }

        return {
            type: 'footnoteDefinition',
            raw,
            id,
            body: body.trim(),
        };
    }
};

// SMARTYPANTS: typographic replacements applied to text content
const smartypantsReplacements = [
    [/\.\.\.\.\.\./g, '\u2026\u2026'],
    [/\.\.\.\.\./g, '\u2026\u2026'],
    [/\.\.\.\./g, '\u2026'],
    [/\.\.\./g, '\u2026'],
    [/---/g, '\u2014'],
    [/--/g, '\u2013'],
    [/\(c\)/gi, '\u00a9'],
    [/\(r\)/gi, '\u00ae'],
    [/\(tm\)/gi, '\u2122'],
    [/\+-/g, '\u00b1'],
];

export function smartypants(text) {
    let result = text;
    for (const [pattern, replacement] of smartypantsReplacements) {
        result = result.replace(pattern, replacement);
    }
    return result;
}

export function walkTokens(tokens) {
    const abbrMap = new Map();
    function walk(token) {
        if (token.type === 'abbreviation') {
            abbrMap.set(token.abbr, token.title);
        }
        if (token.type === 'text' && token.text) {
            token.text = smartypants(token.text);
        }
        if (token.tokens) token.tokens.forEach(walk);
        if (token.items) token.items.forEach(walk);
        if (token.header) token.header.forEach(cell => { if (cell.tokens) cell.tokens.forEach(walk); });
        if (token.rows) token.rows.forEach(row => row.forEach(cell => { if (cell.tokens) cell.tokens.forEach(walk); }));
    }
    tokens.forEach(walk);
    processFootnotes(tokens);
    return abbrMap;
}