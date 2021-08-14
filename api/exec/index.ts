import execa from 'execa';
import fetch from 'node-fetch';
import { join } from 'path';
import { tmpdir } from 'os';
import once from '@tootallnate/once';
import {
	createWriteStream,
	createReadStream,
	mkdirp,
	remove,
	open,
	close,
} from 'fs-extra';
import { IncomingMessage, ServerResponse } from 'http';

const isDev = process.env.NOW_REGION === 'dev1';

async function download(url: string, dest: string) {
	const res = await fetch(url);
	const ws = createWriteStream(dest, { mode: 0o777 });
	res.body.pipe(ws);
	await once(ws, 'close');
}

const importBinPath = (async () => {
	const dir = join(tmpdir(), Math.random().toString(32).slice(2));
	await mkdirp(dir);

	const ops = [];
	ops.push(download('https://import.sh/?format=raw', join(dir, 'import')));

	if (!isDev) {
		// In AWS Lambda, there is no `curl` command,
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

export default async function (req: IncomingMessage, res: ServerResponse) {
	const origCwd = process.cwd();
	const workPath = join(tmpdir(), Math.random().toString(32).slice(2));
	try {
		await mkdirp(workPath);
		process.chdir(workPath);

		const inputFile = join(workPath, 'input.sh');
		const ws = createWriteStream(inputFile, {
			mode: 0o777,
		});
		req.pipe(ws);
		await once(ws, 'close');

		const outputFile = join(workPath, '.output');
		const fd = await open(outputFile, 'w');

		const env: typeof process.env = {
			...process.env,
			PATH: `${process.env.PATH}:${await importBinPath}`,
			CURL_CA_BUNDLE: '/etc/ssl/certs/ca-bundle.crt',
			IMPORT_CACHE: workPath,
		};

		// The static `curl` binary we download for AWS Lambda has the incorrect
		// location for the SSL Certs CA, so set the proper location in prod.
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

		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'text/plain; charset=utf8');
		res.setHeader('X-Exit-Code', String(result.exitCode));
		createReadStream(outputFile).pipe(res);
		await once(res, 'close');
	} finally {
		process.chdir(origCwd);
		await remove(workPath);
	}
}
