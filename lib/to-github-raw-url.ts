export interface RawUrlParams {
	repo: string;
	org: string;
	committish?: string;
	file: string;
}

export default function toGithubRawUrl({
	repo,
	org,
	committish = 'master',
	file,
}: RawUrlParams): string {
	return `https://raw.githubusercontent.com/${encodeURIComponent(
		org
	)}/${encodeURIComponent(repo)}/${encodeURIComponent(
		committish
	)}/${encodeURI(file)}`;
}
