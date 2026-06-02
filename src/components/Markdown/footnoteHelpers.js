import { marked } from 'marked';

export function processFootnotes(tokens) {
    const definitions = new Map();
    const inlineFootnotes = [];
    let nextNumber = 1;

    function walkTokenArray(arr) {
        for (let i = 0; i < arr.length; i++) {
            const token = arr[i];

            if (token.type === 'footnoteDefinition') {
                if (!definitions.has(token.id)) {
                    const bodyTokens = token.body ? marked.lexer(token.body) : null;
                    definitions.set(token.id, {
                        tokens: bodyTokens,
                        number: -1,
                    });
                } else {
                    const def = definitions.get(token.id);
                    if (def.tokens === null && token.body) {
                        def.tokens = marked.lexer(token.body);
                    }
                }
            }

            if (token.type === 'footnoteRef') {
                let def = definitions.get(token.id);
                if (!def) {
                    def = { tokens: null, number: -1 };
                    definitions.set(token.id, def);
                }
                if (def.number === -1) {
                    def.number = nextNumber++;
                }
                token.number = def.number;
            }

            if (token.type === 'footnoteInline') {
                const num = nextNumber++;
                token.number = num;
                const toks = marked.lexer(token.text || '');
                inlineFootnotes.push({
                    id: `__inline_${num}`,
                    number: num,
                    tokens: toks,
                });
            }

            if (token.tokens) walkTokenArray(token.tokens);
            if (token.items) walkTokenArray(token.items);
            if (token.header) token.header.forEach(cell => { if (cell.tokens) walkTokenArray(cell.tokens); });
            if (token.rows) token.rows.forEach(row => row.forEach(cell => { if (cell.tokens) walkTokenArray(cell.tokens); }));
        }
    }

    walkTokenArray(tokens);

    const footnoteCount = definitions.size + inlineFootnotes.length;
    if (footnoteCount === 0) return;

    for (let i = tokens.length - 1; i >= 0; i--) {
        if (tokens[i].type === 'footnoteDefinition') {
            tokens.splice(i, 1);
        }
    }

    const orderedFootnotes = [];
    for (const [id, def] of definitions) {
        orderedFootnotes.push({ id, number: def.number, tokens: def.tokens });
    }
    for (const fn of inlineFootnotes) {
        orderedFootnotes.push(fn);
    }
    orderedFootnotes.sort((a, b) => a.number - b.number);

    tokens.push({
        type: 'footnotesSection',
        footnotes: orderedFootnotes.map(fn => ({
            id: fn.id,
            number: fn.number,
            tokens: fn.tokens,
        })),
    });
}
