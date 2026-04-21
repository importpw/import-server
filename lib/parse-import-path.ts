import parseCommittish, { type Committish } from './parse-committish';

export interface ParsedImportPath extends Committish {
	org?: string;
	repo?: string;
	file?: string;
	committish?: string;
}

export default function parseImportPath(url: string): ParsedImportPath {
	// Extract the pathname (strip query/hash if present)
	let pathname = url;
	const queryIdx = pathname.indexOf('?');
	if (queryIdx !== -1) pathname = pathname.substring(0, queryIdx);
	const hashIdx = pathname.indexOf('#');
	if (hashIdx !== -1) pathname = pathname.substring(0, hashIdx);

	const params: ParsedImportPath = {};
	const parts = pathname.substring(1).split('/');
	const numParts = parts.length;

	if (numParts === 1) {
		if (parts[0]) params.repo = parts[0];
	} else if (numParts >= 2) {
		if (parts[0]) params.org = parts[0];
		if (parts[1]) params.repo = parts[1];
	}
	if (!params.file && numParts > 2) {
		params.file = decodeURI(parts.slice(2).join('/'));
	}
	parseCommittish(params);
	return params;
}
