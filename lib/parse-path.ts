import { NextRequest } from "next/server";

interface ParsedUrl {
    repo?: string;
    org?: string;
    file?: string;
}

export function parsePath(url: NextRequest['nextUrl']): ParsedUrl {
    let repo: string | undefined;
    let org: string | undefined;
    let file: string | undefined;
	const { pathname } = url;
	const parts = pathname.substring(1).split('/');
	const numParts = parts.length;

	if (numParts === 1) {
		if (parts[0]) repo = parts[0];
	} else if (numParts >= 2) {
		if (parts[0]) org = parts[0];
		if (parts[1]) repo = parts[1];
	}
	if (numParts > 2) {
		file = decodeURI(parts.slice(2).join('/'));
	}
	//parseCommittish(params);
	return {
		repo,
		org,
		file,
	};
};