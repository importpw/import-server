import Highlight from 'react-highlight';

export default function MarkdownCode (props) {
  if (props.language) {
    return <Highlight className={props.language}>{props.value}</Highlight>;
  } else {
    return <pre><code className="hljs">{props.value}</code></pre>;
  }
}
