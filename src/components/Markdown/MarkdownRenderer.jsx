import { For, Switch, Match, createMemo } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import hljs from 'highlight.js';
import katex from 'katex';
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';

/**
 * Main Entry Component
 * @param {Object} props.tokens - Output from marked.lexer(markdown)
 */
const MarkdownRenderer = (props) => <div class="text-gray-900 selection:bg-gray-200">
    <TokenList tokens={props.tokens} />
</div>;

const TokenList = (props) => <For each={props.tokens}>
    {(token) => <Switch fallback={<span>{token.text}</span>}>
        {/* --- Block Elements --- */}
        <Match when={token.type === 'heading'}>
            <Heading level={token.depth} tokens={token.tokens} />
        </Match>

        <Match when={token.type === 'math'}>
            <div class="my-6 overflow-x-auto text-center" innerHTML={
                katex.renderToString(token.text, { displayMode: true, throwOnError: false })
            } />
        </Match>
        
        <Match when={token.type === 'paragraph'}>
            <p class="leading-6 mb-4 last:mb-0">
                <TokenList tokens={token.tokens} />
            </p>
        </Match>

        <Match when={token.type === 'list'}>
            <Switch>
                <Match when={token.ordered}>
                    <ol class="list-decimal leading-6 pl-6 mb-4 space-y-2">
                        <TokenList tokens={token.items} />
                    </ol>
                </Match>
                <Match when={!token.ordered}>
                    <ul class="list-disc leading-6 pl-6 my-4 space-y-2">
                        <TokenList tokens={token.items} />
                    </ul>
                </Match>
            </Switch>
        </Match>

        <Match when={token.type === 'list_item'}>
            <li class="pl-1">
                <TokenList tokens={token.tokens} />
            </li>
        </Match>

        <Match when={token.type === 'table'}>
            <div class="my-6 overflow-x-auto border border-gray-200 rounded">
                <table class="min-w-full divide-y divide-gray-200 text-left">
                    <thead class="bg-gray-50">
                        <tr>
                            <For each={token.header}>
                                {(cell) => <th 
                                    class="px-4 py-3 text-xs font-bold text-gray-900"
                                    style={{ 'text-align': cell.align || 'left' }}
                                >
                                    <TokenList tokens={cell.tokens} />
                                </th>}
                            </For>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                        <For each={token.rows}>
                            {(row) => <tr>
                                <For each={row}>
                                    {(cell) => <td 
                                        class="px-4 py-3 text-xs font-semibold text-gray-700"
                                        style={{ 'text-align': cell.align || 'left' }}
                                    >
                                        <TokenList tokens={cell.tokens} />
                                    </td>}
                                </For>
                            </tr>}
                        </For>
                    </tbody>
                </table>
            </div>
        </Match>

        <Match when={token.type === 'code'}>
            <CodeBlock code={token.text} lang={token.lang} />
        </Match>

        <Match when={token.type === 'blockquote'}>
            <blockquote class="border-l-4 border-gray-200 pl-4 italic text-gray-500 mb-4 bg-gray-50 py-2 pr-4 rounded-r">
                <TokenList tokens={token.tokens} />
            </blockquote>
        </Match>

        <Match when={token.type === 'hr'}>
            <hr class="border-gray-200 my-8" />
        </Match>

        <Match when={token.type === 'html'}>
            <div class="my-4" innerHTML={token.text} />
        </Match>

        <Match when={token.type === 'def'}>
            {/* Definitions (e.g., [id]: url) don't need rendering, marked handles linking */}
            <></>
        </Match>

        {/* --- Inline Elements --- */}
        <Match when={token.type === 'inlineMath'}>
            <span innerHTML={katex.renderToString(token.text, { displayMode: false, throwOnError: false })} />
        </Match>

        <Match when={token.type === 'strong'}>
            <strong class="font-semibold text-gray-900"><TokenList tokens={token.tokens} /></strong>
        </Match>

        <Match when={token.type === 'em'}>
            <em class="italic text-gray-800"><TokenList tokens={token.tokens} /></em>
        </Match>

        <Match when={token.type === 'del'}>
            <del class="line-through text-gray-400 decoration-gray-400"><TokenList tokens={token.tokens} /></del>
        </Match>

        <Match when={token.type === 'codespan'}>
            <code class="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-900">
                {token.text}
            </code>
        </Match>

        <Match when={token.type === 'link'}>
            <a href={token.href} title={token.title} target="_blank" class="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900 transition-colors">
                <TokenList tokens={token.tokens} />
            </a>
        </Match>

        <Match when={token.type === 'image'}>
            <img 
                src={token.href} 
                alt={token.text} 
                title={token.title} 
                class="max-w-full h-auto my-4"
                loading="lazy" 
            />
        </Match>

        <Match when={token.type === 'text'}>
            {token.tokens ? <TokenList tokens={token.tokens} /> : token.text}
        </Match>

        <Match when={token.type === 'escape'}>
            <span>{token.text}</span>
        </Match>

        <Match when={token.type === 'br'}>
            <br />
        </Match>

        <Match when={token.type === 'space'}>
            <></>
        </Match>
    </Switch>}
</For>;

const Heading = (props) => {
    const prefix = '#'.repeat(props.level);
    return <Dynamic 
        component={`h${props.level}`} 
        class='flex items-center gap-2 font-bold text-sky-700 mt-6 mb-3 first:mt-0'
    >
        <span class="text-sky-700 select-none">{prefix}</span>
        <TokenList tokens={props.tokens} />
    </Dynamic>;
};

const CodeBlock = (props) => {
    // Check if this is a ```math block
    const isMath = () => props.lang === 'math';

    const highlighted = createMemo(() => {
        if (isMath()) return ''; // Don't highlight math as code
        if (props.lang && hljs.getLanguage(props.lang)) {
            return hljs.highlight(props.code, { language: props.lang }).value;
        }
        return hljs.highlightAuto(props.code).value;
    });

    return <div class="my-6">
        <Switch>
            {/* If the language is "math", render it as a math block */}
            <Match when={isMath()}>
                <div 
                    class="py-4 overflow-x-auto text-center" 
                    innerHTML={katex.renderToString(props.code, { displayMode: true, throwOnError: false, strict: false })} 
                />
            </Match>

            {/* Standard Code Block fallback */}
            <Match when={!isMath()}>
                <div class="flex justify-between items-center px-4 py-2 bg-gray-50 border border-b-0 border-gray-200 rounded-t-md">
                    <span class="text-xs font-mono uppercase font-semibold text-gray-500">
                        {props.lang || 'text'}
                    </span>
                </div>
                <pre class="px-2 py-1 border border-gray-200 rounded-b-md overflow-x-auto">
                    <code 
                        class="hljs font-mono text-sm leading-6"
                        innerHTML={highlighted()} 
                    />
                </pre>
            </Match>
        </Switch>
    </div>;
};

export default MarkdownRenderer;