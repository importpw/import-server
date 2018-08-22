import SyntaxHighlighter from 'react-syntax-highlighter';
import { grayscale } from 'react-syntax-highlighter/styles/hljs';

export default function MarkdownCode (props) {
  if (props.language) {
    return <SyntaxHighlighter language={props.language} style={grayscale}>{props.value}</SyntaxHighlighter>;
  } else {
    return <pre><code className="hljs">{props.value}</code></pre>;
  }
}
