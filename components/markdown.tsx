'use client';

import { Streamdown } from 'streamdown';
import emoji from 'emoji-dictionary';
import { isValidElement, type ReactNode } from 'react';

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
 * Walks the children of streamdown's default `<pre><code>` rendering to find
 * the raw text of a code block. Streamdown + Shiki wrap each token in its
 * own element so we collect the textContent recursively.
 */
function getCodeText(node: ReactNode): string {
	if (typeof node === 'string') return node;
	if (typeof node === 'number') return String(node);
	if (Array.isArray(node)) return node.map(getCodeText).join('');
	if (isValidElement<{ children?: ReactNode }>(node)) {
		return getCodeText(node.props.children);
	}
	return '';
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
				// Wrap `#!`-prefixed block code in a "Run this code" popup.
				// Streamdown's default `code` component handles syntax
				// highlighting + the copy/download UI; we re-render it and
				// detect shebang blocks by reading the raw text from the
				// children that remark passes through.
				pre: ({ children, ...rest }: any) => {
					const text = getCodeText(children);
					if (text.trimStart().startsWith('#!')) {
						return (
							<CodeExample code={text}>
								<pre {...rest}>{children}</pre>
							</CodeExample>
						);
					}
					return <pre {...rest}>{children}</pre>;
				},
			}}
		>
			{body}
		</Streamdown>
	);
}
