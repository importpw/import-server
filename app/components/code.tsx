import SyntaxHighlighter from 'react-syntax-highlighter';
import CodeExample from './code-example';

type CodeProps = {
	className?: string;
	children?: React.ReactNode;
	node?: unknown;
	inline?: boolean;
};

/**
 * react-markdown v9 `code` component. For block code the `className` is
 * `language-xxx`. For inline code there is no language. We detect block vs.
 * inline by presence of a newline in children (react-markdown no longer
 * passes `inline` reliably in v9).
 */
export default function MarkdownCode({
	className,
	children,
	inline,
}: CodeProps) {
	const raw = typeof children === 'string' ? children : String(children ?? '');
	const value = raw.replace(/\n$/, '');

	if (inline) {
		return <code className={className}>{children}</code>;
	}

	const match = /language-(\w+)/.exec(className || '');
	const language = match?.[1];
	const isExecutable = value.substring(0, 2) === '#!';

	let pre: React.ReactNode;
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
	}
	return <>{pre}</>;
}
