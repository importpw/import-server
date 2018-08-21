import Highlight from 'react-highlight';

export default function MarkdownCode (props) {
  return <Highlight language={props.language}>{props.value}</Highlight>;
}
