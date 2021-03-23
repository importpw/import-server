import { join } from 'path';
import { parse, resolve } from 'url';
import Link from 'next/link';

function MarkdownLink({ host, href, org, repo, asPath, children }) {
	const prefix = `/${org}/${repo}`;
	const isRelative =
		/^\.\.?\//.test(href) && asPath.substring(0, prefix.length) !== prefix;
	if (isRelative) {
		href = '/' + join(org, repo, href);
	}
	if (href.startsWith('.')) {
		href = resolve(asPath, href);
	}
	let isImportPath = href.startsWith('/');

	const parsed = parse(href);
	if (parsed.hostname === 'import.pw') {
		isImportPath = true;
		href = parsed.pathname;
	}

	// TODO: parse github.com URLs into import.pw URLs when appropriate

	const className = isImportPath ? null : 'external';
	return (
		<Link href={href}>
			<a className={className}>{children}</a>
		</Link>
	);
}

export default MarkdownLink;
