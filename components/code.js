import CodeExample from './code-example';
import SyntaxHighlighter from 'react-syntax-highlighter';

export default function MarkdownCode({ language, value }) {
	const isExecutable = value.substring(0, 2) === '#!';
	let pre;
	if (language) {
		pre = (
			<SyntaxHighlighter language={language} useInlineStyles={false}>
				{value}
			</SyntaxHighlighter>
		);
	} else {
		pre = (
			<pre className="hljs">
				<code>{value}</code>
			</pre>
		);
	}
	if (isExecutable) {
		return <CodeExample code={value}>{pre}</CodeExample>;
	} else {
		return pre;
	}
}
