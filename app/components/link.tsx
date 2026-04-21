import { Link } from 'react-router';

/** Minimal posix-style path join for the browser. */
function join(...parts: string[]): string {
	const joined = parts.filter(Boolean).join('/');
	const segments: string[] = [];
	const isAbsolute = joined.startsWith('/');
	for (const part of joined.split('/')) {
		if (!part || part === '.') continue;
		if (part === '..') {
			if (
				segments.length > 0 &&
				segments[segments.length - 1] !== '..'
			) {
				segments.pop();
			} else if (!isAbsolute) {
				segments.push('..');
			}
		} else {
			segments.push(part);
		}
	}
	const result = segments.join('/');
	return isAbsolute ? '/' + result : result || '.';
}

type LinkProps = {
	href?: string;
	org: string;
	repo: string;
	asPath: string;
	children?: React.ReactNode;
};

// Resolve a relative URL against a base path
function resolveUrl(base: string, relative: string): string {
	try {
		// Use URL with a dummy origin, then strip it
		const u = new URL(relative, `http://x${base}`);
		return u.pathname + u.search + u.hash;
	} catch {
		return relative;
	}
}

export default function MarkdownLink({
	href,
	org,
	repo,
	asPath,
	children,
}: LinkProps) {
	if (!href) return <>{children}</>;

	// Map `/docs` to the import repo's `docs` directory
	if (org === 'importpw' && repo === 'import') {
		if (asPath.startsWith('/docs/')) {
			href = resolveUrl(asPath, href);
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
		href = resolveUrl(asPath, href);
	}
	let isImportPath = href.startsWith('/');

	let hostname: string | undefined;
	try {
		// Only parse fully-qualified URLs
		if (/^[a-z][a-z0-9+.-]*:\/\//i.test(href)) {
			hostname = new URL(href).hostname;
		}
	} catch {
		// ignore
	}

	// Map hard-coded `https://import.sh` links
	// to be root-relative (for dev/staging).
	if (hostname === 'import.sh' || hostname === 'import.pw') {
		isImportPath = true;
		href = new URL(href).pathname;
	}

	if (isImportPath) {
		return <Link to={href}>{children}</Link>;
	}
	return (
		<a className="external" href={href}>
			{children}
		</a>
	);
}
