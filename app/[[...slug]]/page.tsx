import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Markdown from 'react-markdown';

import NoDocs from '../../components/no-docs';
import BlockPre, { InlineCode } from '../../components/code';
import MarkdownImage from '../../components/image';
import MarkdownLink from '../../components/link';
import MarkdownText from '../../components/text';
import Vercel from '../../components/icons/vercel';
import Arrow from '../../components/icons/arrow';
import GitHub from '../../components/icons/github';
import Logotype from '../../components/icons/import';

import { loadFromPath, resolveOpts } from '../../lib/load';

export const dynamic = 'force-dynamic';

interface PageProps {
	params: Promise<{ slug?: string[] }>;
}

function pathnameFromSlug(slug: string[] | undefined): string {
	return slug ? `/${slug.join('/')}` : '/';
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const h = await headers();
	let data;
	try {
		({ data } = await loadFromPath(pathnameFromSlug(slug), h));
	} catch {
		return { title: 'import' };
	}

	const { host, proto, org, repo, repoDescription, committish } = data;
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
		if (committish !== 'master') title += `@${committish}`;
		title += '"';
	}

	return {
		title,
		description: repoDescription ?? '',
		icons: { shortcut: avatar },
		openGraph: {
			title,
			description: repoDescription ?? '',
			url: `${proto}//${host}`,
			type: 'website',
			images: [ogImageUrl],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description: repoDescription ?? '',
			images: [ogImageUrl],
		},
	};
}

export default async function Page({ params }: PageProps) {
	const { slug } = await params;
	const pathname = pathnameFromSlug(slug);
	const parsed = slug ?? [];

	// Favicon redirect for the default repo.
	if (parsed.length === 1 && parsed[0] === 'favicon.ico') {
		redirect(`https://github.com/${resolveOpts.defaultOrg}.png`);
	}
	if (
		parsed.length === 2 &&
		parsed[1] === 'favicon.ico'
	) {
		redirect(`https://github.com/${parsed[0]}.png`);
	}

	const h = await headers();
	const { data } = await loadFromPath(pathname, h);

	const {
		org,
		repo,
		committish,
		foundEntrypoint,
		fetch: fetchData,
	} = data;

	const statusCode = fetchData?.statusCode ?? 0;
	const body = fetchData?.body ?? '';

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
				// eslint-disable-next-line @next/next/no-img-element
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
					pre: (props) => <BlockPre {...(props as any)} />,
					code: (props) => <InlineCode {...(props as any)} />,
					img: (props) => <MarkdownImage {...(props as any)} />,
					a: (props) => (
						<MarkdownLink
							org={org}
							repo={repo}
							asPath={pathname}
							href={(props as any).href}
						>
							{(props as any).children}
						</MarkdownLink>
					),
					p: ({ children }) => (
						<p>
							{Array.isArray(children)
								? children.map((c, i) =>
										typeof c === 'string' ? (
											<MarkdownText key={i}>
												{c}
											</MarkdownText>
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
					<Link href="/importpw/import">
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
					<div>
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
