import { join } from 'path';
import { parse, resolve } from 'url';
import Link from 'next/link';
import parseImportPath from '../lib/parse-import-path';

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
	if (parsed.host === host) {
		isImportPath = true;
		href = parsed.pathname;
	}

	// TODO: parse github.com URLs into import.pw URLs when appropriate

	if (isImportPath) {
		const as = href;
		const query = parseImportPath(href);
		href = { pathname: '/index', query };
		return (
			<Link href={href} as={as}>
				<a>{children}</a>
			</Link>
		);
	} else {
		return (
			<a className="external" href={href}>
				{children}
			</a>
		);
	}
}

export default MarkdownLink;
