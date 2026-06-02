import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import Markdown from './Markdown';


const comprehensiveMarkdown = `# Heading 1

## Heading 2

### Heading 3

This is a paragraph with **bold**, *italic*, ~~strikethrough~~, \`code\`, and $E=mc^2$ inline math.

$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$

- Unordered item 1
- Unordered item 2

1. Ordered item 1
2. Ordered item 2

| Left | Center | Right |
| :--- | :---: | ---: |
| a | b | c |

\`\`\`js
const greeting = "hello world";
console.log(greeting);
\`\`\`

> A wise blockquote.

---

![alt text](https://example.com/img.png)

[Open link](https://example.com)

<br>

<script>alert('xss')</script>

<marquee>bad html</marquee>

<iframe src="https://evil.com"></iframe>
`;

const footnoteMarkdown = `Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote^[Text of inline footnote] definition.

Duplicated footnote reference[^second].

[^first]: Footnote **can have markup**

    and multiple paragraphs.

[^second]: Footnote text.`;

describe('Markdown component', () => {
    it('renders heading 1', () => {
        render(() => <Markdown content="# Hello" />);
        expect(screen.getByText('#')).toBeTruthy();
        expect(screen.getByText('Hello')).toBeTruthy();
    });

    it('renders heading 2', () => {
        render(() => <Markdown content="## Subtitle" />);
        const h2 = document.querySelector('h2');
        expect(h2).toBeTruthy();
        expect(h2.textContent).toContain('Subtitle');
    });

    it('renders bold text', () => {
        render(() => <Markdown content="**bold text**" />);
        const strong = document.querySelector('strong');
        expect(strong).toBeTruthy();
        expect(strong.textContent).toBe('bold text');
    });

    it('renders italic text', () => {
        render(() => <Markdown content="*italic text*" />);
        const em = document.querySelector('em');
        expect(em).toBeTruthy();
        expect(em.textContent).toBe('italic text');
    });

    it('renders strikethrough text', () => {
        render(() => <Markdown content="~~struck~~" />);
        const del = document.querySelector('del');
        expect(del).toBeTruthy();
        expect(del.textContent).toBe('struck');
    });

    it('renders inline code', () => {
        render(() => <Markdown content={'`code span`'} />);
        const code = document.querySelector('code');
        expect(code).toBeTruthy();
        expect(code.textContent).toContain('code span');
    });

    it('renders nested unordered list 3 levels deep', () => {
        render(() => <Markdown content={'- A\n  - B\n    - C'} />);
        const outerUl = document.querySelector('ul');
        const innerUl = outerUl?.querySelector('li > ul');
        const innermostUl = innerUl?.querySelector('li > ul');
        expect(outerUl).toBeTruthy();
        expect(innerUl).toBeTruthy();
        expect(innermostUl).toBeTruthy();
        expect(innermostUl.querySelector('li')?.textContent).toContain('C');
    });

    it('renders mixed nested list (ul > ol > ul)', () => {
        render(() => <Markdown content={'- Item 1\n  1. Item 1a\n      - Item 1a i'} />);
        const outerUl = document.querySelector('ul');
        const innerOl = outerUl?.querySelector('li > ol');
        const innermostUl = innerOl?.querySelector('li > ul');
        expect(outerUl).toBeTruthy();
        expect(innerOl).toBeTruthy();
        expect(innermostUl).toBeTruthy();
        expect(innermostUl.querySelector('li')?.textContent).toContain('Item 1a i');
    });

    it('renders deeply nested mixed list with both list types', () => {
        render(() => <Markdown content={'- Item 1\n  - Item 1a\n    - Item 1a i\n  - Item 1b\n- Item 2\n  1. Item 2a\n  2. Item 2b\n      - Item 2b i'} />);
        // Top-level <ul> with 2 <li>
        const topUl = document.querySelector('ul');
        expect(topUl).toBeTruthy();
        const allLis = topUl.querySelectorAll('li');
        expect(allLis.length).toBeGreaterThanOrEqual(6);

        // Check for nesting: there should be <ul> inside <li> (nested)
        const innerUls = topUl.querySelectorAll('li ul');
        expect(innerUls.length).toBe(3); // 3 levels of ul nesting + ul in ol

        // 3 levels deep of unordered nesting
        const threeDeep = document.querySelector('ul li ul li ul li');
        expect(threeDeep).toBeTruthy();
        expect(threeDeep.textContent).toContain('Item 1a i');

        // Mixed: <ol> inside top-level <li>
        const olInsideLi = document.querySelector('li ol');
        expect(olInsideLi).toBeTruthy();
        expect(Array.from(olInsideLi.children).filter(c => c.tagName === 'LI')).toHaveLength(2);

        // <ul> inside <ol> inside <li>
        const ulInsideOl = document.querySelector('li ol li ul');
        expect(ulInsideOl).toBeTruthy();
        expect(ulInsideOl.querySelector('li')?.textContent).toContain('Item 2b i');
    });

    it('renders table', () => {
        render(() => <Markdown content={'| a | b |\n| --- | --- |\n| 1 | 2 |'} />);
        const table = document.querySelector('table');
        expect(table).toBeTruthy();
        expect(table.querySelectorAll('th')).toHaveLength(2);
        expect(table.querySelectorAll('td')).toHaveLength(2);
    });

    it('renders blockquote', () => {
        render(() => <Markdown content="> blockquote text" />);
        const blockquote = document.querySelector('blockquote');
        expect(blockquote).toBeTruthy();
        expect(blockquote.textContent).toContain('blockquote text');
    });

    it('renders horizontal rule', () => {
        render(() => <Markdown content="---" />);
        expect(document.querySelector('hr')).toBeTruthy();
    });

    it('renders link with target=_blank and rel=noopener noreferrer', () => {
        render(() => <Markdown content="[link](https://example.com)" />);
        const a = document.querySelector('a');
        expect(a).toBeTruthy();
        expect(a.href).toBe('https://example.com/');
        expect(a.target).toBe('_blank');
        expect(a.rel).toBe('noopener noreferrer');
    });

    it('renders image with lazy loading', () => {
        render(() => <Markdown content={'![alt](https://example.com/img.png)'} />);
        const img = document.querySelector('img');
        expect(img).toBeTruthy();
        expect(img.src).toBe('https://example.com/img.png');
        expect(img.alt).toBe('alt');
        expect(img.getAttribute('loading')).toBe('lazy');
    });

    it('renders code block with language label', () => {
        render(() => <Markdown content={'```js\nconst x = 1;\n```'} />);
        const pre = document.querySelector('pre');
        expect(pre).toBeTruthy();
        expect(pre.textContent).toContain('const x = 1;');
    });

    it('renders block math $$...$$ with KaTeX', () => {
        render(() => <Markdown content={'$$E=mc^2$$\n'} />);
        const katex = document.querySelector('.katex');
        expect(katex).toBeTruthy();
    });

    it('renders inline math $...$ with KaTeX', () => {
        render(() => <Markdown content={'Inline $x^2$ math'} />);
        const katexSpans = document.querySelectorAll('.katex');
        expect(katexSpans.length).toBeGreaterThan(0);
    });

    it('sanitizes raw HTML (no script execution)', () => {
        render(() => <Markdown content={'<script>alert("xss")</script>'} />);
        expect(document.querySelector('script')).toBeNull();
    });

    it('sanitizes dangerous HTML tags', () => {
        render(() => <Markdown content={'<iframe src="https://evil.com"></iframe>'} />);
        expect(document.querySelector('iframe')).toBeNull();
    });

    it('renders br tag as line break', () => {
        render(() => <Markdown content={'<br>'} />);
        expect(document.querySelector('br')).toBeTruthy();
    });

    it('handles empty content gracefully', () => {
        render(() => <Markdown content="" />);
        expect(document.body.firstChild).toBeTruthy();
    });

    it('renders all token types from comprehensive markdown', () => {
        render(() => <Markdown content={comprehensiveMarkdown} />);

        expect(document.querySelector('h1')).toBeTruthy();
        expect(document.querySelector('h2')).toBeTruthy();
        expect(document.querySelector('h3')).toBeTruthy();
        expect(document.querySelector('strong')).toBeTruthy();
        expect(document.querySelector('em')).toBeTruthy();
        expect(document.querySelector('del')).toBeTruthy();
        expect(document.querySelector('ul')).toBeTruthy();
        expect(document.querySelector('ol')).toBeTruthy();
        expect(document.querySelector('table')).toBeTruthy();
        expect(document.querySelector('blockquote')).toBeTruthy();
        expect(document.querySelector('hr')).toBeTruthy();
        expect(document.querySelector('pre')).toBeTruthy();
        expect(document.querySelector('img')).toBeTruthy();
        expect(document.querySelector('a')).toBeTruthy();
        expect(document.querySelector('.katex')).toBeTruthy();

        expect(document.querySelector('script')).toBeNull();
        expect(document.querySelector('iframe')).toBeNull();
    });

    it('renders subscript text', () => {
        render(() => <Markdown content="H~2~O" />);
        expect(document.querySelector('sub')).toBeTruthy();
    });

    it('renders superscript text', () => {
        render(() => <Markdown content="19^th^" />);
        expect(document.querySelector('sup')).toBeTruthy();
    });

    it('renders inserted text', () => {
        render(() => <Markdown content="++Inserted++" />);
        expect(document.querySelector('ins')).toBeTruthy();
    });

    it('renders marked text', () => {
        render(() => <Markdown content="==Marked==" />);
        expect(document.querySelector('mark')).toBeTruthy();
    });

    it('renders custom container', () => {
        render(() => <Markdown content={'::: warning\n*here be dragons*\n:::\n'} />);
        const container = document.querySelector('.border-yellow-400');
        expect(container).toBeTruthy();
        expect(container.textContent).toContain('here be dragons');
    });

    it('applies smartypants typographic replacements', () => {
        render(() => <Markdown content="test... and test--test and test---test" />);
        const para = document.querySelector('p');
        expect(para).toBeTruthy();
        expect(para.innerHTML).toContain('\u2026');
        expect(para.innerHTML).toContain('\u2013');
        expect(para.innerHTML).toContain('\u2014');
    });

    describe('footnotes rendering', () => {
        it('renders footnote ref [^id] as sup with link', () => {
            render(() => <Markdown content={'Text[^first].\n\n[^first]: Footnote body.\n'} />);
            const sup = document.querySelector('sup');
            expect(sup).toBeTruthy();
            const a = sup.querySelector('a');
            expect(a).toBeTruthy();
            expect(a.getAttribute('href')).toBe('#fn-1');
            expect(a.getAttribute('id')).toBe('fnref-1');
            expect(a.textContent).toBe('1');
        });

        it('renders inline footnote ^[text] as sup with link', () => {
            render(() => <Markdown content="Inline^[footnote text]." />);
            const sup = document.querySelector('sup');
            expect(sup).toBeTruthy();
            const a = sup.querySelector('a');
            expect(a.getAttribute('href')).toBe('#fn-1');
        });

        it('renders footnote section at end with hr and ol', () => {
            render(() => <Markdown content={'Text[^first].\n\n[^first]: Footnote body.\n'} />);
            const hr = document.querySelector('hr');
            expect(hr).toBeTruthy();
            const ol = document.querySelector('ol');
            expect(ol).toBeTruthy();
            const li = document.querySelector('li');
            expect(li).toBeTruthy();
            expect(li.getAttribute('id')).toBe('fn-1');
        });

        it('footnote section contains footnote body text', () => {
            render(() => <Markdown content={'Text[^first].\n\n[^first]: Footnote body.\n'} />);
            const li = document.querySelector('li');
            expect(li.textContent).toContain('Footnote body');
        });

        it('footnote section has back-link', () => {
            render(() => <Markdown content={'Text[^first].\n\n[^first]: Footnote body.\n'} />);
            const li = document.querySelector('li');
            const backLink = li.querySelector('a[href="#fnref-1"]');
            expect(backLink).toBeTruthy();
        });

        it('renders multiple footnotes in correct order', () => {
            render(() => <Markdown content={'First[^a] and second[^b].\n\n[^a]: A.\n\n[^b]: B.\n'} />);
            const lis = document.querySelectorAll('li');
            expect(lis).toHaveLength(2);
            expect(lis[0].getAttribute('id')).toBe('fn-1');
            expect(lis[1].getAttribute('id')).toBe('fn-2');
        });

        it('footnote body supports markup', () => {
            render(() => <Markdown content={'Text[^first].\n\n[^first]: **bold** text.\n'} />);
            const strong = document.querySelector('li strong');
            expect(strong).toBeTruthy();
            expect(strong.textContent).toBe('bold');
        });

        it('duplicated reference gets same number', () => {
            render(() => <Markdown content={'First[^id] and second[^id].\n\n[^id]: Same.\n'} />);
            const sups = document.querySelectorAll('sup a');
            expect(sups).toHaveLength(2);
            expect(sups[0].textContent).toBe('1');
            expect(sups[1].textContent).toBe('1');
        });

        it('renders the full footnote example correctly', () => {
            render(() => <Markdown content={footnoteMarkdown} />);
            // All paragraph text should be present
            expect(document.body.textContent).toContain('Footnote 1 link');
            expect(document.body.textContent).toContain('Footnote 2 link');
            expect(document.body.textContent).toContain('Inline footnote');

            // Should have 3 superscript links (2 refs + 1 inline) but one ref is duplicated
            // So we have [^first], [^second], [^second] dup, and ^[] inline = 4 sups
            const sups = document.querySelectorAll('sup');
            expect(sups.length).toBeGreaterThanOrEqual(3);

            // Should have footnote section with 2 defined + 1 inline = 3 items
            const lis = document.querySelectorAll('li');
            expect(lis).toHaveLength(3);

            // First footnote (id=^first) should have bold markup and multi-paragraph
            const firstLi = document.getElementById('fn-1');
            expect(firstLi).toBeTruthy();
            expect(firstLi.querySelector('strong')).toBeTruthy();

            // Second footnote (id=^second) should be plain text
            const secondLi = document.getElementById('fn-2');
            expect(secondLi).toBeTruthy();

            // Third footnote is the inline one
            const thirdLi = document.getElementById('fn-3');
            expect(thirdLi).toBeTruthy();

            // Each footnote should have a back-link
            const backLinks = document.querySelectorAll('li a[href^="#fnref-"]');
            expect(backLinks).toHaveLength(3);
        });
    });
});
