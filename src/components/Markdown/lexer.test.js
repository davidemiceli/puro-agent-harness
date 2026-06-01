import { describe, it, expect } from 'vitest';
import { marked } from 'marked';
import {
    mathBlock, mathInline,
    subscript, superscript, inserted, markedText,
    abbreviationBlock, customContainer,
    footnoteRef, footnoteInline, footnoteBlock,
    walkTokens,
} from './markdownExtensions';


marked.use({
    extensions: [
        mathBlock, mathInline,
        footnoteRef, footnoteInline, footnoteBlock,
        subscript, superscript, inserted, markedText,
        abbreviationBlock, customContainer,
    ],
    tokenizer: {
        del(src) {
            const match = /^~~([^~]+?)~~/.exec(src);
            if (match) {
                return {
                    type: 'del',
                    raw: match[0],
                    tokens: this.lexer.inlineTokens(match[1]),
                };
            }
        }
    },
});

describe('marked.lexer with math extensions', () => {
    it('produces a heading token', () => {
        const tokens = marked.lexer('# Hello');
        expect(tokens[0].type).toBe('heading');
        expect(tokens[0].depth).toBe(1);
    });

    it('produces a paragraph token', () => {
        const tokens = marked.lexer('Hello world');
        expect(tokens[0].type).toBe('paragraph');
    });

    it('produces a math block token from $$...$$', () => {
        const tokens = marked.lexer('$$E=mc^2$$\n');
        expect(tokens[0].type).toBe('math');
        expect(tokens[0].text).toBe('E=mc^2');
    });

    it('produces inlineMath tokens from $...$ inside paragraphs', () => {
        const tokens = marked.lexer('Inline math: $x^2$ is nice.');
        const para = tokens[0];
        expect(para.type).toBe('paragraph');
        const inlineTokens = para.tokens;
        const mathToken = inlineTokens.find(t => t.type === 'inlineMath');
        expect(mathToken).toBeTruthy();
        expect(mathToken.text).toBe('x^2');
    });

    it('produces a code block token', () => {
        const tokens = marked.lexer('```js\nconst x = 1;\n```');
        expect(tokens[0].type).toBe('code');
        expect(tokens[0].lang).toBe('js');
        expect(tokens[0].text).toContain('const x = 1;');
    });

    it('produces a list token (unordered)', () => {
        const tokens = marked.lexer('- item 1\n- item 2');
        expect(tokens[0].type).toBe('list');
        expect(tokens[0].ordered).toBe(false);
        expect(tokens[0].items).toHaveLength(2);
    });

    it('produces a list token (ordered)', () => {
        const tokens = marked.lexer('1. first\n2. second');
        expect(tokens[0].type).toBe('list');
        expect(tokens[0].ordered).toBe(true);
    });

    it('parses nested unordered list 3 levels deep', () => {
        const tokens = marked.lexer('- A\n  - B\n    - C');
        const top = tokens[0];
        expect(top.type).toBe('list');
        expect(top.ordered).toBe(false);
        // Level 1
        const itemA = top.items[0];
        const list2 = itemA.tokens.find(t => t.type === 'list');
        expect(list2).toBeTruthy();
        expect(list2.ordered).toBe(false);
        // Level 2
        const itemB = list2.items[0];
        const list3 = itemB.tokens.find(t => t.type === 'list');
        expect(list3).toBeTruthy();
        expect(list3.ordered).toBe(false);
        expect(list3.items).toHaveLength(1);
    });

    it('parses nested ordered list 3 levels deep', () => {
        const tokens = marked.lexer('1. A\n   1. B\n      1. C');
        const top = tokens[0];
        expect(top.ordered).toBe(true);
        const itemA = top.items[0];
        const list2 = itemA.tokens.find(t => t.type === 'list');
        expect(list2).toBeTruthy();
        expect(list2.ordered).toBe(true);
        const itemB = list2.items[0];
        const list3 = itemB.tokens.find(t => t.type === 'list');
        expect(list3).toBeTruthy();
        expect(list3.ordered).toBe(true);
    });

    it('parses mixed nested list (ul > ol > ul)', () => {
        const tokens = marked.lexer('- A\n  1. B\n      - C');
        const top = tokens[0];
        expect(top.ordered).toBe(false);
        const itemA = top.items[0];
        const ol = itemA.tokens.find(t => t.type === 'list');
        expect(ol).toBeTruthy();
        expect(ol.ordered).toBe(true);
        const itemB = ol.items[0];
        const ul = itemB.tokens.find(t => t.type === 'list');
        expect(ul).toBeTruthy();
        expect(ul.ordered).toBe(false);
        expect(ul.items[0].tokens[0].type).toBe('text');
    });

    it('produces a table token', () => {
        const tokens = marked.lexer('| a | b |\n| --- | --- |\n| 1 | 2 |');
        expect(tokens[0].type).toBe('table');
        expect(tokens[0].header).toHaveLength(2);
        expect(tokens[0].rows).toHaveLength(1);
    });

    it('produces a blockquote token', () => {
        const tokens = marked.lexer('> quote');
        expect(tokens[0].type).toBe('blockquote');
    });

    it('produces an hr token', () => {
        const tokens = marked.lexer('---');
        expect(tokens[0].type).toBe('hr');
    });

    it('parses complex markdown with multiple block types', () => {
        const md = '# Title\n\nParagraph text.\n\n- List item\n\n> Blockquote';
        const types = marked.lexer(md).map(t => t.type).filter(t => t !== 'space');
        expect(types).toEqual(['heading', 'paragraph', 'list', 'blockquote']);
    });

    it('produces a subscript token', () => {
        const tokens = marked.lexer('H~2~O');
        const para = tokens[0];
        const subToken = para.tokens.find(t => t.type === 'subscript');
        expect(subToken).toBeTruthy();
    });

    it('produces a superscript token', () => {
        const tokens = marked.lexer('19^th^');
        const para = tokens[0];
        const supToken = para.tokens.find(t => t.type === 'superscript');
        expect(supToken).toBeTruthy();
    });

    it('produces an inserted token', () => {
        const tokens = marked.lexer('++Inserted text++');
        const para = tokens[0];
        const insToken = para.tokens.find(t => t.type === 'inserted');
        expect(insToken).toBeTruthy();
    });

    it('produces a markedText token', () => {
        const tokens = marked.lexer('==Marked text==');
        const para = tokens[0];
        const markToken = para.tokens.find(t => t.type === 'markedText');
        expect(markToken).toBeTruthy();
    });

    it('produces a customContainer token', () => {
        const tokens = marked.lexer('::: warning\n*here be dragons*\n:::\n');
        const containerToken = tokens.find(t => t.type === 'customContainer');
        expect(containerToken).toBeTruthy();
        expect(containerToken.name).toBe('warning');
    });

    it('produces an abbreviation token', () => {
        const tokens = marked.lexer('*[HTML]: Hyper Text Markup Language\n');
        const abbrToken = tokens.find(t => t.type === 'abbreviation');
        expect(abbrToken).toBeTruthy();
        expect(abbrToken.abbr).toBe('HTML');
    });
});

describe('marked.lexer with footnote extensions', () => {
    it('produces a footnoteRef token from [^id] inside paragraph', () => {
        const tokens = marked.lexer('Link[^first].');
        const para = tokens[0];
        const refToken = para.tokens.find(t => t.type === 'footnoteRef');
        expect(refToken).toBeTruthy();
        expect(refToken.id).toBe('^first');
    });

    it('produces a footnoteInline token from ^[text] inside paragraph', () => {
        const tokens = marked.lexer('Inline footnote^[text].');
        const para = tokens[0];
        const inlineToken = para.tokens.find(t => t.type === 'footnoteInline');
        expect(inlineToken).toBeTruthy();
    });

    it('produces a footnoteDefinition token from [^id]: text', () => {
        const tokens = marked.lexer('[^first]: Footnote text.\n');
        const defToken = tokens.find(t => t.type === 'footnoteDefinition');
        expect(defToken).toBeTruthy();
        expect(defToken.id).toBe('^first');
    });

    it('produces multi-paragraph footnoteDefinition with indented continuation', () => {
        const md = '[^first]: First paragraph.\n\n    Second paragraph.\n';
        const tokens = marked.lexer(md);
        const defToken = tokens.find(t => t.type === 'footnoteDefinition');
        expect(defToken).toBeTruthy();
        expect(defToken.id).toBe('^first');
        expect(defToken.body).toContain('Second paragraph');
    });

    it('superscript ^th^ still works alongside footnotes', () => {
        const tokens = marked.lexer('19^th^ and link[^ref].');
        const para = tokens[0];
        const supToken = para.tokens.find(t => t.type === 'superscript');
        expect(supToken).toBeTruthy();
        const refToken = para.tokens.find(t => t.type === 'footnoteRef');
        expect(refToken).toBeTruthy();
    });
});

describe('walkTokens with footnotes', () => {
    it('removes footnoteDefinition tokens and appends footnotesSection', () => {
        const tokens = marked.lexer('Link[^first].\n\n[^first]: Text.\n');
        walkTokens(tokens);
        const defTokens = tokens.filter(t => t.type === 'footnoteDefinition');
        expect(defTokens).toHaveLength(0);
        const sectionToken = tokens.find(t => t.type === 'footnotesSection');
        expect(sectionToken).toBeTruthy();
        expect(sectionToken.footnotes).toHaveLength(1);
    });

    it('assigns sequential numbers to footnotes in order of appearance', () => {
        const tokens = marked.lexer('Ref A[^a] and Ref B[^b].\n\n[^a]: Text A.\n\n[^b]: Text B.\n');
        walkTokens(tokens);
        const para = tokens[0];
        const refA = para.tokens.find(t => t.type === 'footnoteRef' && t.id === '^a');
        const refB = para.tokens.find(t => t.type === 'footnoteRef' && t.id === '^b');
        expect(refA.number).toBe(1);
        expect(refB.number).toBe(2);
    });

    it('assigns the same number to duplicated footnote references', () => {
        const tokens = marked.lexer('First[^id] and second[^id].\n\n[^id]: Shared text.\n');
        walkTokens(tokens);
        const para = tokens[0];
        const refs = para.tokens.filter(t => t.type === 'footnoteRef');
        expect(refs).toHaveLength(2);
        expect(refs[0].number).toBe(refs[1].number);
    });

    it('handles inline footnotes together with ref footnotes', () => {
        const tokens = marked.lexer('Ref[^a] and inline^[text].\n\n[^a]: A footnote.\n');
        walkTokens(tokens);
        const sectionToken = tokens.find(t => t.type === 'footnotesSection');
        expect(sectionToken).toBeTruthy();
        expect(sectionToken.footnotes).toHaveLength(2);
        expect(sectionToken.footnotes[0].number).toBe(1);
        expect(sectionToken.footnotes[1].number).toBe(2);
    });

    it('all previous features still produce correct tokens', () => {
        const md = '# Title\n\n**bold** *italic* `code`\n\n$$E=mc^2$$\n\n- item\n\n1. ordered\n\n> quote\n\n---\n\nH~2~O 19^th^ ++ins++ ==mark==\n\n::: warning\ncontent\n:::\n';
        const tokens = marked.lexer(md);
        walkTokens(tokens);
        const types = tokens.map(t => t.type);
        expect(types).toContain('heading');
        expect(types).toContain('paragraph');
        expect(types).toContain('math');
        expect(types).toContain('list');
        expect(types).toContain('blockquote');
        expect(types).toContain('hr');
        expect(types).toContain('customContainer');
    });
});
