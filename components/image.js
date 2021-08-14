import parseGithubUrl from 'parse-github-url';

const toURL = ({ repo, org, committish = 'master', file }) =>
	`https://raw.githubusercontent.com/${encodeURIComponent(
		org
	)}/${encodeURIComponent(repo)}/${encodeURIComponent(
		committish
	)}/${encodeURI(file)}`;

export default function MarkdownImage(props) {
	let { src } = props;
	const parsed = parseGithubUrl(src);
	if (parsed.repo && parsed.branch === 'blob') {
		const org = parsed.owner;
		const repo = parsed.name;
		const committish = parsed.blob.split('/')[0];
		const file = parsed.blob.substring(committish.length + 1);
		src = toURL({ org, repo, committish, file });
	}
	// eslint-disable-next-line @next/next/no-img-element
	return <img {...props} src={src} alt="" />;
}
