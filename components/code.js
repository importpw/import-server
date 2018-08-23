import SyntaxHighlighter from 'react-syntax-highlighter';

export default function MarkdownCode (props) {
  if (props.language) {
    return <SyntaxHighlighter language={props.language} useInlineStyles={false}>{props.value}</SyntaxHighlighter>;
  } else {
    return <pre className="hljs"><code>{props.value}</code></pre>;
  }
}
