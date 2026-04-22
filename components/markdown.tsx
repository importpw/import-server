'use client';

import { CodeBlock, Streamdown } from 'streamdown';
import emoji from 'emoji-dictionary';
import { type ReactNode } from 'react';

import MarkdownImage from './image';
import MarkdownLink from './link';
import CodeExample from './code-example';

interface MarkdownProps {
	body: string;
	org: string;
	repo: string;
	asPath: string;
}

function transformEmoji(children: ReactNode): ReactNode {
	if (typeof children === 'string') {
		return children.replace(
			/:\w+:/gi,
			(name) => emoji.getUnicode(name) || name
		);
	}
	if (Array.isArray(children)) {
		return children.map((c, i) => {
			if (typeof c === 'string') {
				return (
					<span key={i}>
						{c.replace(
							/:\w+:/gi,
							(name) => emoji.getUnicode(name) || name
						)}
					</span>
				);
			}
			return c;
		});
	}
	return children;
}

/**
 * Override for `components.code`. Streamdown invokes this for BOTH inline
 * spans (`` `foo` ``) and block fences (```` ```lang\n…\n``` ````), so we
 * must distinguish them ourselves:
 *
 * - Block fences come through with a `className="language-xxx"` class.
 *   We render them via Streamdown's exported `<CodeBlock>` (chrome + Shiki
 *   highlighting), and additionally wrap `#!`-prefixed blocks in our
 *   `<CodeExample>` for the "Run this code" popup.
 * - Inline spans have no language class; we hand them back to the caller
 *   via the default Streamdown inline-code classes so the muted pill
 *   styling is preserved.
 */
function Code({
	className,
	children,
	...rest
}: {
	className?: string;
	children?: ReactNode;
}) {
	const raw =
		typeof children === 'string' ? children : String(children ?? '');
	const isBlock = /\blanguage-/.test(className ?? '');

	if (!isBlock) {
		return (
			<code
				{...(rest as any)}
				className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
				data-streamdown="inline-code"
			>
				{children}
			</code>
		);
	}

	const code = raw.replace(/\n$/, '');
	const match = /language-(\w+)/.exec(className ?? '');
	const language = match?.[1] ?? 'text';

	// `code` carries the raw text to highlight. `children`, if passed,
	// becomes Streamdown's action-button slot (copy/download), which we
	// leave empty so it falls back to the defaults.
	const block = (
		<CodeBlock
			{...(rest as any)}
			className={className}
			language={language}
			code={code}
		/>
	);

	if (code.trimStart().startsWith('#!')) {
		return <CodeExample code={code}>{block}</CodeExample>;
	}
	return block;
}

export default function MarkdownClient({
	body,
	org,
	repo,
	asPath,
}: MarkdownProps) {
	return (
		<Streamdown
			components={{
				a: (props: any) => (
					<MarkdownLink
						org={org}
						repo={repo}
						asPath={asPath}
						href={props.href}
					>
						{props.children}
					</MarkdownLink>
				),
				img: (props: any) => <MarkdownImage {...props} />,
				p: ({ children, ...rest }: any) => (
					<p {...rest}>{transformEmoji(children)}</p>
				),
				code: Code as any,
			}}
		>
			{body}
		</Streamdown>
	);
}
