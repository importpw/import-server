import { isValidElement, type ReactNode } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import CodeExample from './code-example';

type CodeProps = {
	className?: string;
	children?: React.ReactNode;
	node?: unknown;
};

type PreProps = {
	children?: React.ReactNode;
	node?: unknown;
};

/**
 * react-markdown v9 renders inline code as bare `<code>` and block code as
 * `<pre><code className="language-xxx">…</code></pre>`. We handle the two
 * cases with separate `pre` and `code` components.
 *
 * - `InlineCode` renders a plain `<code>` (inline code).
 * - `BlockPre` unwraps the `<pre>`, reads the language + content from the
 *   child `<code>` element, and renders a syntax-highlighted block. If the
 *   block starts with a `#!` shebang we additionally wrap it in a
 *   `CodeExample` so the user can run it in the "Run this code" popup.
 */

export function InlineCode({ className, children }: CodeProps) {
	return <code className={className}>{children}</code>;
}

function extractCodeChild(children: ReactNode): {
	value: string;
	className?: string;
} | null {
	if (!isValidElement<CodeProps>(children)) return null;
	const { children: codeChildren, className } = children.props;
	const raw =
		typeof codeChildren === 'string'
			? codeChildren
			: String(codeChildren ?? '');
	return { value: raw.replace(/\n$/, ''), className };
}

export default function BlockPre({ children }: PreProps) {
	const extracted = extractCodeChild(children);
	if (!extracted) {
		return <pre>{children}</pre>;
	}
	const { value, className } = extracted;
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
