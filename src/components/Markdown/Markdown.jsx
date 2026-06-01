import { createMemo } from 'solid-js';
import { marked } from 'marked';
import {
    mathBlock, mathInline,
    footnoteRef, footnoteInline, footnoteBlock,
    subscript, superscript, inserted, markedText,
    abbreviationBlock,
    customContainer,
    walkTokens,
} from './markdownExtensions';
import MarkdownRenderer from './MarkdownRenderer';


marked.use({
    extensions: [
        mathBlock, mathInline,
        footnoteRef, footnoteInline, footnoteBlock,
        subscript, superscript, inserted, markedText,
        abbreviationBlock,
        customContainer,
    ],
    // Override del tokenizer to require ~~ (freeing single ~ for subscript)
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
    }
});

export default function Markdown(props) {
    const tokens = createMemo(() => {
        const t = marked.lexer(props.content);
        walkTokens(t);
        return t;
    });
    return <MarkdownRenderer tokens={tokens()} />;
};