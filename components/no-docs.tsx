import Link from 'next/link';
import Cry from './icons/cry';
import ObjectInspectorClient from './object-inspector-client';

interface NoDocsProps {
	org: string;
	repo: string;
	file?: string;
	host?: string;
	entrypoint?: string;
	committish: string;
	foundRepo: boolean;
	foundCommit: boolean;
	foundFile?: boolean;
	foundEntrypoint?: boolean;
	foundReadme?: boolean;
	[key: string]: unknown;
}

export default function NoDocs(props: NoDocsProps) {
	const {
		org,
		repo,
		file,
		host,
		entrypoint,
		committish,
		foundRepo,
		foundCommit,
		foundFile,
		foundEntrypoint,
		foundReadme,
	} = props;
	const repoFull = `${org}/${repo}`;
	const reasons: React.ReactNode[] = [];
	if (!foundRepo) {
		reasons.push(
			<div key="repo">
				<h4>
					The repository <code>{repoFull}</code> is not accessible
				</h4>
				<p>There are two possibilites:</p>
				<ul>
					<li>
						The repo does not exist - Please ensure that the repo
						name is correct.
					</li>
					<li>
						The repo is private - The docs won&apos;t be rendered
						by <code>{host}</code>, but you may still use the{' '}
						<code>import</code> command. See the{' '}
						<Link href="/importpw/import/docs/authentication.md">
							Authentication
						</Link>{' '}
						page for details.
					</li>
				</ul>
			</div>
		);
	} else if (!foundCommit) {
		reasons.push(
			<div key="commit">
				<h4>
					No commit was resolved from committish{' '}
					<code>{committish}</code>
				</h4>
				<ul>
					<li>
						Please ensure that commitish references an actual
						commit / tag / branch in the repository.
					</li>
				</ul>
			</div>
		);
	} else {
		if (typeof foundEntrypoint === 'boolean' && !foundEntrypoint) {
			reasons.push(
				<div key="entrypoint">
					<h4>
						The repository <code>{repoFull}</code> is not{' '}
						<em>import-compatible</em>
					</h4>
					<ul>
						<li>
							Add a shell script named <code>{entrypoint}</code>{' '}
							to the root of the repository to make it compatible
							with <code>import</code>.
						</li>
					</ul>
				</div>
			);
		}

		if (typeof foundReadme === 'boolean' && !foundReadme) {
			let hasEntrypoint: React.ReactNode = null;
			if (foundEntrypoint) {
				const entrypointGhBlob = `https://github.com/${repoFull}/blob/${committish}/${entrypoint}`;
				hasEntrypoint = (
					<li>
						The entrypoint{' '}
						<a href={entrypointGhBlob}>
							<code>{entrypoint}</code>
						</a>{' '}
						exists, so <code>import {repoFull}</code>{' '}
						<em>will work</em>.
					</li>
				);
			}
			reasons.push(
				<div key="readme">
					<h4>
						The repository <code>{repoFull}</code> does not contain
						a Readme file
					</h4>
					<ul>
						<li>
							Add a Markdown file named <code>Readme.md</code> to
							the root of the repository to render the docs on{' '}
							<code>{host}</code>.
						</li>
						{hasEntrypoint}
					</ul>
				</div>
			);
		}

		if (typeof foundFile === 'boolean' && !foundFile) {
			reasons.push(
				<div key="file">
					<h4>
						The repository <code>{repoFull}</code> does not have
						the file <code>{file}</code>
					</h4>
					<ul>
						<li>
							Please ensure the URL is correct, and points to a
							file that exists in the repository.
						</li>
					</ul>
				</div>
			);
		}
	}

	return (
		<div className="no-docs">
			<h1>{repo}</h1>

			<div className="text-center">
				<Cry className="mx-auto w-40" />
				<h2 className="m-0 py-5 font-normal">Darn.</h2>
				<h3 className="m-0 p-0 font-light">
					The documentation could not be loaded.
				</h3>
			</div>

			<h2>Why?</h2>
			<div className="why">{reasons}</div>

			<h2>Data</h2>
			<div className="[&_li]:before:content-none">
				<ObjectInspectorClient data={props} />
			</div>
		</div>
	);
}
