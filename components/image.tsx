import parseGithubUrl from 'parse-github-url';
import toURL from '../lib/to-github-raw-url';

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

export default function MarkdownImage(props: ImageProps) {
	let src = props.src;
	if (typeof src === 'string') {
		const parsed = parseGithubUrl(src) as
			| (ReturnType<typeof parseGithubUrl> & { blob?: string })
			| null;
		if (parsed?.repo && parsed.branch === 'blob' && parsed.blob) {
			const org = parsed.owner!;
			const repo = parsed.name!;
			const committish = parsed.blob.split('/')[0];
			const file = parsed.blob.substring(committish.length + 1);
			src = toURL({ org, repo, committish, file });
		}
	}
	// eslint-disable-next-line jsx-a11y/alt-text
	return <img {...props} src={src} alt={props.alt ?? ''} />;
}
