import MarkdownIt from 'markdown-it';
import texmath from 'markdown-it-texmath';
import footnotePlugin from 'markdown-it-footnote';
import subPlugin from 'markdown-it-sub';
import supPlugin from 'markdown-it-sup';
import insPlugin from 'markdown-it-ins';
import markPlugin from 'markdown-it-mark';
import abbrPlugin from 'markdown-it-abbr';
import containerPlugin from 'markdown-it-container';
import hljs from 'highlight.js';
import katex from 'katex';
import { createMemo } from 'solid-js';
import DOMPurify from 'dompurify';
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight(str, lang) {
        if (lang === 'math') {
            return `<div class="my-6 overflow-x-auto text-center">${katex.renderToString(str, { displayMode: true, throwOnError: false })}</div>`;
        }
        if (lang && hljs.getLanguage(lang)) {
            const langLabel = lang;
            const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
            return `<div class="not-prose m-0 p-0"><div class="flex justify-between items-center px-4 py-2 bg-gray-50 border border-b-0 border-gray-200 rounded-t-md"><span class="font-mono uppercase font-semibold text-gray-500">${langLabel}</span></div><pre class="px-2 py-1 border border-gray-200 bg-white rounded-b-md overflow-x-auto"><code class="hljs font-mono">${highlighted}</code></pre></div>`;
        }
        const autoHighlighted = hljs.highlightAuto(str).value;
        return `<div class="not-prose m-0 p-0 bg-transparent"><div class="flex justify-between items-center px-4 py-2 bg-gray-50 border border-b-0 border-gray-200 rounded-t-md"><span class="font-mono uppercase font-semibold text-gray-500">text</span></div><pre class="px-2 py-1 border border-gray-200 bg-white rounded-b-md overflow-x-auto"><code class="hljs font-mono">${autoHighlighted}</code></pre></div>`;
    }
});

md.use(texmath, { engine: katex, delimiters: 'dollars' });
md.use(footnotePlugin);
md.use(subPlugin);
md.use(supPlugin);
md.use(insPlugin);
md.use(markPlugin);
md.use(abbrPlugin);
md.use(containerPlugin, 'warning', {
    validate: params => params.trim().match(/^warning\s*(.*)$/),
    render(tokens, idx) {
        if (tokens[idx].nesting === 1) return '<div class="border-yellow-400 bg-yellow-50 p-4 rounded border-l-4 my-4">\n';
        return '</div>\n';
    }
});
md.use(containerPlugin, 'details', {
    validate: params => params.trim().match(/^details\s*(.*)$/),
    render(tokens, idx) {
        if (tokens[idx].nesting === 1) return '<div class="border-gray-300 bg-gray-50 p-4 rounded border-l-4 my-4">\n';
        return '</div>\n';
    }
});

const defaultLinkOpen = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
};
md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
    tokens[idx].attrPush(['target', '_blank']);
    tokens[idx].attrPush(['rel', 'noopener noreferrer']);
    return defaultLinkOpen(tokens, idx, options, env, self);
};

const defaultImage = md.renderer.rules.image || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
};
md.renderer.rules.image = function(tokens, idx, options, env, self) {
    tokens[idx].attrPush(['loading', 'lazy']);
    return defaultImage(tokens, idx, options, env, self);
};

export default function Markdown(props) {
    const html = createMemo(() => md.render(props.content || ''));
    const sanitized = createMemo(() => DOMPurify.sanitize(html(), { ADD_ATTR: ['target'] }));
    return <article class="prose prose-base max-w-none break-words selection:bg-gray-200" innerHTML={sanitized()} />;
};