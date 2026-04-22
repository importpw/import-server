import execa from 'execa';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createWriteStream, createReadStream } from 'node:fs';
import { mkdir, rm, writeFile, open } from 'node:fs/promises';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isDev = process.env.NODE_ENV !== 'production';

async function download(url: string, dest: string) {
	const res = await fetch(url);
	if (!res.ok || !res.body) {
		throw new Error(
			`Failed to download ${url}: ${res.status} ${res.statusText}`
		);
	}
	await pipeline(
		Readable.fromWeb(res.body as any),
		createWriteStream(dest, { mode: 0o777 })
	);
}

const importBinPath = (async () => {
	const dir = join(tmpdir(), Math.random().toString(32).slice(2));
	await mkdir(dir, { recursive: true });

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

async function handle(request: Request): Promise<Response> {
	const workPath = join(tmpdir(), Math.random().toString(32).slice(2));

	try {
		await mkdir(workPath, { recursive: true });

		const inputFile = join(workPath, 'input.sh');
		const bodyBuffer = Buffer.from(await request.arrayBuffer());
		await writeFile(inputFile, bodyBuffer, { mode: 0o777 });

		const outputFile = join(workPath, '.output');
		const fh = await open(outputFile, 'w');

		const env: NodeJS.ProcessEnv = {
			...process.env,
			PATH: `${process.env.PATH}:${await importBinPath}`,
			CURL_CA_BUNDLE: '/etc/ssl/certs/ca-bundle.crt',
			IMPORT_CACHE: workPath,
		};
		if (isDev) delete env.CURL_CA_BUNDLE;

		// Run the script with `cwd` set on the child process only — never
		// mutate the parent process's cwd, because that would leak across
		// concurrent requests on the same worker.
		const proc = execa(inputFile, [], {
			cwd: workPath,
			env,
			reject: false,
			stdio: ['ignore', fh.fd, fh.fd],
		});
		const result = await proc;
		await fh.close();

		const nodeStream = createReadStream(outputFile);
		const webStream = Readable.toWeb(
			nodeStream
		) as ReadableStream<Uint8Array>;

		// Clean up after the stream is fully consumed.
		nodeStream.on('close', async () => {
			try {
				await rm(workPath, { recursive: true, force: true });
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
		try {
			await rm(workPath, { recursive: true, force: true });
		} catch {
			// ignore
		}
		throw err;
	}
}

export async function POST(request: Request) {
	return handle(request);
}

export async function GET(request: Request) {
	return handle(request);
}
