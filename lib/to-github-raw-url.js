module.exports = ({ repo, org, committish = 'master', file }) =>
	`https://raw.githubusercontent.com/${encodeURIComponent(
		org
	)}/${encodeURIComponent(repo)}/${encodeURIComponent(
		committish
	)}/${encodeURI(file)}`;
