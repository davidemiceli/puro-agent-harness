// BLOCK MATH: matches $$...$$
export const mathBlock = {
    name: 'math',
    level: 'block',
    // Only start if $$ is at the very beginning of a line (ignoring whitespace)
    start(src) { return src.match(/^\s*\$\$/m)?.index; },
    tokenizer(src) {
        // Regex logic:
        // ^\s*            -> Start of string, optional whitespace
        // \$\$            -> Opening delimiters
        // ([\s\S]+?) -> Content (non-greedy)
        // \$\$            -> Closing delimiters
        // (?:\s*\n|$) -> Followed by whitespace and newline OR end of string
        const match = /^\s*\$\$([\s\S]+?)\$\$(?:\s*(?:\n|$))/.exec(src);
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
        // Case A: dollar tick style $`...`$ (Strongest match)
        // Captures everything between $` and `$ allowing internal dollar signs
        const dollarTickStyle = /^\$`((?:[^`]|`[^$])+)`\$/.exec(src);
        if (dollarTickStyle) {
            return {
                type: 'inlineMath',
                raw: dollarTickStyle[0],
                text: dollarTickStyle[1].trim(),
                displayMode: false
            };
        }

        // Case B: Standard $...$ (Classic style)
        // 1. Must not start with a space: [^\s]
        // 2. Must not end with a space: [^\s]
        // 3. Must contain at least one non-digit/non-punctuation character OR a math operator
        // 4. Must NOT be followed by a digit (to avoid $100 matching in "$100 is $100")
        const standardStyle = /^\$([^\s\$\n|](?:[^\$\n|]*[^\s\$\n|])?)\$(?!\d)/.exec(src); // eslint-disable-line no-useless-escape

        if (standardStyle) {
            const content = standardStyle[1];
            
            // HEURISTIC: If it looks like currency ($100, $10.50), skip it.
            // This regex checks if the content is JUST numbers, commas, and dots.
            const isCurrency = /^[\d,.]+(?:\s*[a-zA-Z]{3})?$/.test(content);
            
            // Only return the token if it's NOT currency OR if it contains math operators
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