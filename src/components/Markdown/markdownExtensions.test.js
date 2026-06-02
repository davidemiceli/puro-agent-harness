import { describe, it, expect } from 'vitest';
import {
    mathBlock, mathInline,
    subscript, superscript, inserted, markedText,
    abbreviationBlock, customContainer,
    footnoteRef, footnoteInline, footnoteBlock,
    smartypants,
} from './markdownExtensions';
import { processFootnotes } from './footnoteHelpers';


describe('mathBlock tokenizer', () => {
    it('parses standard $$...$$ block', () => {
        const result = mathBlock.tokenizer('$$E=mc^2$$\n');
        expect(result).toMatchObject({ type: 'math', text: 'E=mc^2' });
    });

    it('parses multi-line math block', () => {
        const result = mathBlock.tokenizer('$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$\n');
        expect(result).toMatchObject({ type: 'math' });
        expect(result.text).toContain('sum');
    });

    it('parses math block with leading whitespace', () => {
        const result = mathBlock.tokenizer('  $$x^2$$\n');
        expect(result).toMatchObject({ type: 'math', text: 'x^2' });
    });

    it('parses empty math block $$\\n$$', () => {
        const result = mathBlock.tokenizer('$$\n$$\n');
        expect(result).toMatchObject({ type: 'math', text: '' });
    });

    it('returns undefined for text without $$ delimiters', () => {
        expect(mathBlock.tokenizer('just text')).toBeUndefined();
    });

    it('returns undefined for single $', () => {
        expect(mathBlock.tokenizer('$x$')).toBeUndefined();
    });
});

describe('mathInline tokenizer', () => {
    it('parses standard $...$ inline math', () => {
        const result = mathInline.tokenizer('$E=mc^2$');
        expect(result).toMatchObject({ type: 'inlineMath', text: 'E=mc^2' });
    });

    it('parses $`...`$ dollar-tick style', () => {
        const result = mathInline.tokenizer('$`x^2 + y^2`$');
        expect(result).toMatchObject({ type: 'inlineMath', text: 'x^2 + y^2' });
    });

    it('skips $`...`$ when backtick lacks closing $', () => {
        const result = mathInline.tokenizer('$`not-closed`');
        expect(result).toBeUndefined();
    });

    it('skips currency amounts like $100', () => {
        expect(mathInline.tokenizer('$100')).toBeUndefined();
    });

    it('skips currency with decimals like $10.50', () => {
        expect(mathInline.tokenizer('$10.50')).toBeUndefined();
    });

    it('parses math containing operators next to currency-like content', () => {
        const result = mathInline.tokenizer('$100+200$');
        expect(result).toMatchObject({ type: 'inlineMath', text: '100+200' });
    });

    it('parses inline math with subscripts', () => {
        const result = mathInline.tokenizer('$x_1$');
        expect(result).toMatchObject({ type: 'inlineMath', text: 'x_1' });
    });

    it('parses inline math with fractions', () => {
        const result = mathInline.tokenizer('$\\frac{1}{2}$');
        expect(result).toMatchObject({ type: 'inlineMath', text: '\\frac{1}{2}' });
    });

    it('skips math when content starts with a space', () => {
        expect(mathInline.tokenizer('$ x$')).toBeUndefined();
    });

    it('skips math when content ends with a space', () => {
        expect(mathInline.tokenizer('$x $')).toBeUndefined();
    });
});

describe('subscript tokenizer', () => {
    it('parses ~text~ subscript', () => {
        const result = subscript.tokenizer('~2~O');
        expect(result).toMatchObject({ type: 'subscript' });
    });

    it('returns undefined for ~~strikethrough~~', () => {
        expect(subscript.tokenizer('~~struck~~')).toBeUndefined();
    });

    it('returns undefined for plain text', () => {
        expect(subscript.tokenizer('hello')).toBeUndefined();
    });
});

describe('superscript tokenizer', () => {
    it('parses ^text^ superscript', () => {
        const result = superscript.tokenizer('^th^');
        expect(result).toMatchObject({ type: 'superscript' });
    });

    it('returns undefined for plain text', () => {
        expect(superscript.tokenizer('hello')).toBeUndefined();
    });
});

describe('inserted tokenizer', () => {
    it('parses ++text++ inserted', () => {
        const result = inserted.tokenizer('++Inserted text++');
        expect(result).toMatchObject({ type: 'inserted' });
    });

    it('returns undefined for plain text', () => {
        expect(inserted.tokenizer('hello')).toBeUndefined();
    });
});

describe('markedText tokenizer', () => {
    it('parses ==text== marked', () => {
        const result = markedText.tokenizer('==Marked text==');
        expect(result).toMatchObject({ type: 'markedText' });
    });

    it('returns undefined for plain text', () => {
        expect(markedText.tokenizer('hello')).toBeUndefined();
    });
});

describe('customContainer tokenizer', () => {
    it('parses ::: warning container', () => {
        const result = customContainer.tokenizer('::: warning\n*here be dragons*\n:::\n');
        expect(result).toMatchObject({ type: 'customContainer', name: 'warning' });
    });

    it('parses ::: details container', () => {
        const result = customContainer.tokenizer('::: details\nSome content\n:::\n');
        expect(result).toMatchObject({ type: 'customContainer', name: 'details' });
    });

    it('returns undefined for plain text', () => {
        expect(customContainer.tokenizer('hello')).toBeUndefined();
    });
});

describe('abbreviationBlock tokenizer', () => {
    it('parses *[HTML]: definition', () => {
        const result = abbreviationBlock.tokenizer('*[HTML]: Hyper Text Markup Language\n');
        expect(result).toMatchObject({ type: 'abbreviation', abbr: 'HTML', title: 'Hyper Text Markup Language' });
    });

    it('returns undefined for plain text', () => {
        expect(abbreviationBlock.tokenizer('hello')).toBeUndefined();
    });
});

describe('footnoteRef tokenizer', () => {
    it('parses [^first] reference', () => {
        const result = footnoteRef.tokenizer('[^first]');
        expect(result).toMatchObject({ type: 'footnoteRef', id: '^first' });
    });

    it('parses [^multi-word-id] reference', () => {
        const result = footnoteRef.tokenizer('[^multi-word-id]');
        expect(result).toMatchObject({ type: 'footnoteRef', id: '^multi-word-id' });
    });

    it('returns undefined for plain [text]', () => {
        expect(footnoteRef.tokenizer('[text]')).toBeUndefined();
    });

    it('returns undefined for plain text', () => {
        expect(footnoteRef.tokenizer('hello')).toBeUndefined();
    });
});

describe('footnoteInline tokenizer', () => {
    it('parses ^[inline text]', () => {
        const result = footnoteInline.tokenizer('^[inline text]');
        expect(result).toMatchObject({ type: 'footnoteInline', text: 'inline text' });
    });

    it('parses inline footnote with markup', () => {
        const result = footnoteInline.tokenizer('^[**bold** text]');
        expect(result).toMatchObject({ type: 'footnoteInline', text: '**bold** text' });
    });

    it('returns undefined for ^text^ (superscript)', () => {
        expect(footnoteInline.tokenizer('^th^')).toBeUndefined();
    });

    it('returns undefined for plain text', () => {
        expect(footnoteInline.tokenizer('hello')).toBeUndefined();
    });
});

describe('footnoteBlock tokenizer', () => {
    it('parses [^first]: Text', () => {
        const result = footnoteBlock.tokenizer('[^first]: Footnote text.\n');
        expect(result).toMatchObject({ type: 'footnoteDefinition', id: '^first' });
        expect(result.body).toBe('Footnote text.');
    });

    it('parses multi-paragraph footnote with indented continuation', () => {
        const md = '[^first]: First paragraph.\n\n    Second paragraph.\n';
        const result = footnoteBlock.tokenizer(md);
        expect(result).toMatchObject({ type: 'footnoteDefinition', id: '^first' });
        expect(result.body).toContain('First paragraph');
        expect(result.body).toContain('Second paragraph');
    });

    it('parses footnote with bold markup in body', () => {
        const result = footnoteBlock.tokenizer('[^first]: Footnote **has markup**\n');
        expect(result).toMatchObject({ type: 'footnoteDefinition', id: '^first' });
        expect(result.body).toContain('**has markup**');
    });

    it('returns undefined for plain text', () => {
        expect(footnoteBlock.tokenizer('hello')).toBeUndefined();
    });
});

describe('footnoteInline priority over superscript', () => {
    it('footnoteInline tokenizer handles ^[text]', () => {
        expect(footnoteInline.tokenizer('^[text]')).toMatchObject({ type: 'footnoteInline' });
    });

    it('superscript tokenizer does NOT match ^[text]', () => {
        expect(superscript.tokenizer('^[text]')).toBeUndefined();
    });
});

describe('footnoteInline re-lexing in processFootnotes', () => {
    it('parses inline footnote tokens via processFootnotes', () => {
        const tokens = [
            {
                type: 'paragraph',
                tokens: [{ type: 'footnoteInline', text: '**bold** text', raw: '^[**bold** text]' }]
            }
        ];
        processFootnotes(tokens);
        const section = tokens.find(t => t.type === 'footnotesSection');
        expect(section).toBeTruthy();
        expect(section.footnotes).toHaveLength(1);
        const ftokens = section.footnotes[0].tokens;
        expect(ftokens).toBeTruthy();
        // marked.lexer returns paragraph tokens wrapping the content
        const strong = ftokens[0]?.tokens?.find(t => t.type === 'strong');
        expect(strong).toBeTruthy();
    });
});

describe('smartypants', () => {
    it('converts ... to ellipsis', () => {
        expect(smartypants('test...')).toBe('test\u2026');
    });

    it('converts -- to en-dash', () => {
        expect(smartypants('test--test')).toBe('test\u2013test');
    });

    it('converts --- to em-dash', () => {
        expect(smartypants('test---test')).toBe('test\u2014test');
    });

    it('converts (c) to copyright', () => {
        expect(smartypants('(c)')).toBe('\u00a9');
    });

    it('converts (r) to registered', () => {
        expect(smartypants('(r)')).toBe('\u00ae');
    });

    it('does not crash on empty string', () => {
        expect(smartypants('')).toBe('');
    });
});
