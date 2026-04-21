export interface Committish {
	repo?: string;
	file?: string;
	committish?: string;
	[key: string]: unknown;
}

function parse(query: Committish, prop: 'repo' | 'file') {
	const val = query[prop];
	if (!val) return;
	const at = val.lastIndexOf('@');
	if (at !== -1) {
		query.committish = val.substring(at + 1);
		query[prop] = val.substring(0, at);
	}
}

export default function parseCommittish<T extends Committish>(query: T): T {
	parse(query, 'repo');
	parse(query, 'file');
	return query;
}
