import execa from 'execa';
import fetch from 'node-fetch';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Readable } from 'node:stream';
import once from '@tootallnate/once';
import {
	createWriteStream,
	createReadStream,
	mkdirp,
	remove,
	open,
	close,
	writeFile,
} from 'fs-extra';

import type { Route } from './+types/api.exec';

const isDev = process.env.NOW_REGION === 'dev1' || process.env.NODE_ENV !== 'production';

async function download(url: string, dest: string) {
	const res = await fetch(url);
	if (!res.body) throw new Error(`No body in download response for ${url}`);
	const ws = createWriteStream(dest, { mode: 0o777 });
	(res.body as unknown as NodeJS.ReadableStream).pipe(ws);
	await once(ws, 'close');
}

const importBinPath = (async () => {
	const dir = join(tmpdir(), Math.random().toString(32).slice(2));
	await mkdirp(dir);

	const ops: Promise<void>[] = [];
	ops.push(download('https://import.sh/?format=raw', join(dir, 'import')));

	if (!isDev) {
		// In AWS Lambda / Vercel, there is no `curl` command,
		// so download this static binary
		ops.push(
			download(
				'https://github.com/dtschan/curl-static/releases/download/v7.63.0/curl',
				join(dir, 'curl')
			)
		);
	}

	await Promise.all(ops);
	return dir;
})();

export async function action({ request }: Route.ActionArgs) {
	return handle(request);
}

export async function loader({ request }: Route.LoaderArgs) {
	// Also allow GET for basic usage, but typically POST is used
	return handle(request);
}

async function handle(request: Request): Promise<Response> {
	const origCwd = process.cwd();
	const workPath = join(tmpdir(), Math.random().toString(32).slice(2));

	try {
		await mkdirp(workPath);
		process.chdir(workPath);

		const inputFile = join(workPath, 'input.sh');
		const bodyBuffer = Buffer.from(await request.arrayBuffer());
		await writeFile(inputFile, bodyBuffer, { mode: 0o777 });

		const outputFile = join(workPath, '.output');
		const fd = await open(outputFile, 'w');

		const env: NodeJS.ProcessEnv = {
			...process.env,
			PATH: `${process.env.PATH}:${await importBinPath}`,
			CURL_CA_BUNDLE: '/etc/ssl/certs/ca-bundle.crt',
			IMPORT_CACHE: workPath,
		};

		if (isDev) {
			delete env.CURL_CA_BUNDLE;
		}

		const proc = execa(inputFile, [], {
			env,
			reject: false,
			stdio: ['ignore', fd, fd],
		});
		const result = await proc;
		await close(fd);

		const nodeStream = createReadStream(outputFile);
		const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

		// Clean up after the stream is fully consumed
		nodeStream.on('close', async () => {
			try {
				process.chdir(origCwd);
				await remove(workPath);
			} catch {
				// ignore
			}
		});

		return new Response(webStream, {
			status: 200,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Content-Type': 'text/plain; charset=utf8',
				'X-Exit-Code': String(result.exitCode),
			},
		});
	} catch (err) {
		// In case of an error, clean up now
		try {
			process.chdir(origCwd);
			await remove(workPath);
		} catch {
			// ignore
		}
		throw err;
	}
}
