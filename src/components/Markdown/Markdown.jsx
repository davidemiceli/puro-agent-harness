import { marked } from 'marked';
import { mathBlock, mathInline } from './markdownExtensions';
import MarkdownRenderer from './MarkdownRenderer';


marked.use({ 
    extensions: [mathBlock, mathInline]
});

export default function Markdown(props) {
    const tokens = marked.lexer(props.content);
    return <MarkdownRenderer tokens={tokens} />;
};