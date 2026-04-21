import { basename } from 'node:path';
import { Link } from 'react-router';
import Markdown from 'react-markdown';

import type { Route } from './+types/splat';
import NoDocs from '../components/no-docs';
import MarkdownCode from '../components/code';
import MarkdownImage from '../components/image';
import MarkdownLink from '../components/link';
import MarkdownText from '../components/text';

import Vercel from '../components/icons/vercel';
import Arrow from '../components/icons/arrow';
import GitHub from '../components/icons/github';
import Logotype from '../components/icons/import';

import resolveImport from '../lib/resolve';
import toURL from '../lib/to-github-raw-url';
import parseImportPath from '../lib/parse-import-path';

const resolveOpts = {
	defaultOrg: 'importpw',
	defaultRepo: 'import',
	get token() {
		return process.env.GITHUB_TOKEN;
	},
};

interface SplatLoaderData {
	// Render mode (default)
	asPath: string;
	host: string;
	proto: string;
	org: string;
	repo: string;
	repoDescription?: string;
	committish: string;
	foundEntrypoint?: boolean;
	foundReadme?: boolean;
	foundFile?: boolean;
	foundRepo: boolean;
	foundCommit: boolean;
	entrypoint?: string;
	readme?: string;
	file?: string;
	fetch: {
		url: string;
		statusCode: number;
		headers: Record<string, string>;
		body: string;
	};
}

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const asPath = url.pathname + url.search;
	const parsed = parseImportPath(url.pathname);

	// Favicon redirect for default repo
	if (parsed.repo === 'favicon.ico') {
		const favicon = `https://github.com/${
			parsed.org || resolveOpts.defaultOrg
		}.png`;
		return new Response(null, {
			status: 302,
			headers: { Location: favicon },
		});
	}

	if (parsed.org === 'docs') {
		let file = parsed.repo ?? '';
		if (parsed.file) {
			file += '/' + parsed.file;
		}
		parsed.file = `docs/${file}`;
		if (!parsed.file.endsWith('.md')) {
			parsed.file += '.md';
		}
		parsed.org = resolveOpts.defaultOrg;
		parsed.repo = resolveOpts.defaultRepo;
	}

	const params = (await resolveImport(parsed, resolveOpts)) as SplatLoaderData;
	params.asPath = asPath;

	params.host =
		request.headers.get('x-forwarded-host') ??
		request.headers.get('host') ??
		'';
	params.proto = request.headers.get('x-forwarded-proto') ?? 'https';
	if (!params.proto.endsWith(':')) {
		params.proto += ':';
	}

	// Determine the desired format by header + query string
	const accept = request.headers.get('accept') ?? '';
	const userAgent = request.headers.get('user-agent') ?? '';
	const queryFormat =
		url.searchParams.get('format') ??
		url.searchParams.get('_format') ??
		null;

	let format: 'html' | 'json' | 'raw';
	if (queryFormat === 'json' || queryFormat === 'raw' || queryFormat === 'html') {
		format = queryFormat;
	} else if (accept.includes('application/json')) {
		format = 'json';
	} else if (/(curl|wget)/i.test(userAgent)) {
		format = 'raw';
	} else {
		format = 'html';
	}

	const wantsHTML = format === 'html';

	// For the `raw` format, proxy to the raw URL
	if (format === 'raw') {
		const rawUrl = toURL({
			...params,
			file: params.entrypoint || params.file!,
		});

		const res2 = await fetch(rawUrl);
		if (res2.status === 404) {
			// Might be a private repo; redirect to raw so client can auth
			return new Response(null, {
				status: 307,
				headers: { Location: res2.url },
			});
		}

		const filename = basename(res2.url);
		const headers = new Headers();
		headers.set('Content-Location', res2.url);
		headers.set(
			'Content-Disposition',
			`inline; filename="${filename}"`
		);
		const contentType = res2.headers.get('content-type');
		if (contentType) headers.set('Content-Type', contentType);
		headers.set(
			'Cache-Control',
			's-maxage=60, stale-while-revalidate'
		);
		return new Response(res2.body, { status: res2.status, headers });
	}

	// For HTML or JSON, fetch the readme/entry content
	const shouldFetchContent =
		wantsHTML ||
		url.searchParams.has('fetch') ||
		request.headers.get('x-fetch');
	if (shouldFetchContent) {
		const contentUrl = toURL({
			...params,
			file: params.readme || params.file!,
		});
		const res2 = await fetch(contentUrl);
		const headers: Record<string, string> = {};
		res2.headers.forEach((v, k) => {
			headers[k] = v;
		});
		params.fetch = {
			url: res2.url,
			statusCode: res2.status,
			headers,
			body: await res2.text(),
		};
	}

	if (format === 'json') {
		return Response.json(params, {
			headers: {
				'Cache-Control': 's-maxage=60, stale-while-revalidate',
			},
		});
	}

	// HTML/render
	return params;
}

export function meta({ data }: Route.MetaArgs) {
	if (!data || typeof data !== 'object' || !('org' in data)) return [];
	const d = data as SplatLoaderData;
	const { host, proto, org, repo, repoDescription, committish } = d;
	const eOrg = encodeURIComponent(org);
	const eRepo = encodeURIComponent(repo);
	const avatar = `https://github.com/${eOrg}.png`;

	let ogImageUrl = `${proto}//${host}/api/og`;
	let title = 'import';

	if (resolveOpts.defaultRepo !== repo) {
		title += ' "';
		ogImageUrl += '?';

		if (resolveOpts.defaultOrg !== org) {
			title += `${org}/`;
			ogImageUrl += `org=${eOrg}&`;
		}

		title += repo;
		ogImageUrl += `repo=${eRepo}`;

		if (committish !== 'master') {
			title += `@${committish}`;
		}

		title += '"';
	}

	return [
		{ title },
		{ name: 'description', content: repoDescription ?? '' },
		{ tagName: 'link', rel: 'shortcut icon', type: 'image/png', href: avatar },
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:image', content: ogImageUrl },
		{ name: 'twitter:title', content: title },
		{ name: 'twitter:description', content: repoDescription ?? '' },
		{ property: 'og:image', content: ogImageUrl },
		{ property: 'og:url', content: `${proto}//${host}` },
		{ property: 'og:title', content: title },
		{ property: 'og:description', content: repoDescription ?? '' },
		{ property: 'og:type', content: 'website' },
	];
}

export function headers() {
	return {
		'Cache-Control': 's-maxage=60, stale-while-revalidate',
	};
}

export default function SplatRoute({ loaderData }: Route.ComponentProps) {
	const data = loaderData as unknown as SplatLoaderData;
	const {
		org,
		repo,
		committish,
		foundEntrypoint,
		fetch: { statusCode, body },
	} = data;

	const eOrg = encodeURIComponent(org);
	const eRepo = encodeURIComponent(repo);
	const avatar = `https://github.com/${eOrg}.png`;

	let arrow: React.ReactNode = null;
	let orgLogo: React.ReactNode = null;
	let ghUrl = `https://github.com/${eOrg}/${eRepo}`;

	if (resolveOpts.defaultRepo !== repo) {
		if (resolveOpts.defaultOrg !== org) {
			arrow = <Arrow className="mx-2.5 h-full w-3 fill-[#999]" />;
			orgLogo = (
				<img
					className="h-7 w-7 rounded-[5px] border border-[#eaeaea]"
					src={avatar}
					alt=""
				/>
			);
		}

		if (committish !== 'master') {
			ghUrl += `/tree/${committish}`;
		}
	}

	let content: React.ReactNode;
	if (
		statusCode === 200 &&
		(typeof foundEntrypoint !== 'boolean' || foundEntrypoint)
	) {
		content = (
			<Markdown
				skipHtml={false}
				components={{
					code: (props) => <MarkdownCode {...(props as any)} />,
					img: (props) => <MarkdownImage {...(props as any)} />,
					a: (props) => (
						<MarkdownLink
							org={org}
							repo={repo}
							asPath={data.asPath}
							href={(props as any).href}
						>
							{(props as any).children}
						</MarkdownLink>
					),
					// Transform emoji shortcodes in text nodes
					p: ({ children }) => (
						<p>
							{Array.isArray(children)
								? children.map((c, i) =>
										typeof c === 'string' ? (
											<MarkdownText key={i}>{c}</MarkdownText>
										) : (
											c
										)
								  )
								: typeof children === 'string'
								? <MarkdownText>{children}</MarkdownText>
								: children}
						</p>
					),
				}}
			>
				{body}
			</Markdown>
		);
	} else {
		content = <NoDocs {...(data as any)} />;
	}

	return (
		<div className="markdown-body root">
			<div className="sticky top-0 z-10 overflow-hidden pb-2.5 text-center">
				<div className="mx-auto flex items-center justify-center border-b border-[#eaeaea] bg-white pt-5 pb-5 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.12)]">
					<Link to="/importpw/import">
						<Logotype className="w-[35px]" />
					</Link>
					{arrow}
					{orgLogo}
				</div>
			</div>

			<div className="mx-auto mt-[50px] mb-[100px] max-w-[650px] px-5">
				{content}
			</div>

			<div className="border-t border-[#eaeaea] py-10 text-black">
				<div className="mx-auto flex max-w-[900px] justify-between max-md:flex-col max-md:items-center">
					<div className="repository">
						<a
							className="flex items-center text-sm text-black max-md:mb-[30px]"
							href={ghUrl}
						>
							View on GitHub
							<GitHub className="ml-2.5 h-[18px]" />
						</a>
					</div>
					<div className="flex whitespace-pre-wrap text-sm text-[#666]">
						Crafted by{' '}
						<a className="text-black" href="https://vercel.com">
							<Vercel className="mt-0.5 ml-0.5 h-[1em]" />
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
