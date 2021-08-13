import { join } from 'path';
import { parse, resolve } from 'url';
import Link from 'next/link';

function MarkdownLink({ href, org, repo, asPath, children }) {
	// Map `/docs` to the import repo's `docs` directory
	if (org === 'importpw' && repo === 'import') {
		if (asPath.startsWith('/docs/')) {
			href = resolve(asPath, href);
		}

		if (join(href).startsWith('docs/')) {
			href = `/${join(href)}`;
		}

		if (href.endsWith('.md')) {
			href = href.substring(0, href.length - 3);
		}
	}

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

	// Map hard-coded `https://import.sh` links
	// to be root-relative (for dev/staging).
	if (parsed.hostname === 'import.sh' || parsed.hostname === 'import.pw') {
		isImportPath = true;
		href = parsed.pathname;
	}

	const className = isImportPath ? null : 'external';
	return (
		<Link href={href}>
			<a className={className}>{children}</a>
		</Link>
	);
}

export default MarkdownLink;
