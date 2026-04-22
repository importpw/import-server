import toURL from '../lib/to-github-raw-url';

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

/**
 * Detects a `https://github.com/<owner>/<name>/blob/<committish>/<file>` URL
 * and returns its parts. Returns `null` for any other URL. We avoid using
 * `parse-github-url` here because it pulls in the legacy `url.parse()` API,
 * which triggers a Node deprecation warning on the server.
 */
function parseGithubBlobUrl(src: string): {
	org: string;
	repo: string;
	committish: string;
	file: string;
} | null {
	let u: URL;
	try {
		u = new URL(src);
	} catch {
		return null;
	}
	if (u.hostname !== 'github.com' && u.hostname !== 'www.github.com') {
		return null;
	}
	// /<owner>/<name>/blob/<committish>/<file...>
	const match = u.pathname.match(
		/^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/
	);
	if (!match) return null;
	const [, org, repo, committish, file] = match;
	return { org, repo, committish, file };
}

export default function MarkdownImage(props: ImageProps) {
	let src = props.src;
	if (typeof src === 'string') {
		const parsed = parseGithubBlobUrl(src);
		if (parsed) src = toURL(parsed);
	}
	// eslint-disable-next-line jsx-a11y/alt-text
	return <img {...props} src={src} alt={props.alt ?? ''} />;
}
