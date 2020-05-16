import { tmpdir } from 'os';
import { join } from 'path';
import fetch from 'node-fetch';
import { spawn } from 'node-pty';
import { EventEmitter } from 'events';
import once from '@tootallnate/once';
import {
	createWriteStream,
	mkdirp,
	remove,
} from 'fs-extra';

const isDev = process.env.VERCEL_REGION === 'dev1';

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
	ops.push(download('https://import.pw', join(dir, 'import')));

	if (!isDev) {
		// In AWS Lambda, there is no `curl` command,
		// so download this static binary
		ops.push(download('https://github.com/dtschan/curl-static/releases/download/v7.63.0/curl', join(dir, 'curl')));
	}

	await Promise.all(ops);
	return dir;
})();

export default async function (req, res) {
	const origCwd = process.cwd();
	const workPath = join(tmpdir(), Math.random().toString(32).slice(2));
	try {
		await mkdirp(workPath);
		process.chdir(workPath);

		const inputFile = join(workPath, 'input.sh');
		const ws = createWriteStream(inputFile, {
			mode: 0o777
		});
		req.pipe(ws);
		await once(ws, 'close');

		const env = {
			...process.env,
			PATH: `${process.env.PATH}:${await importBinPath}`,
			// The static `curl` binary we download for AWS Lambda has the
			// incorrect location for the SSL Certs CA, so set the proper
			// location in prod.
			CURL_CA_BUNDLE: '/etc/ssl/certs/ca-bundle.crt',
			IMPORT_CACHE: workPath
		};

		if (isDev) {
			delete env.CURL_CA_BUNDLE;
		}

		const proc = spawn(inputFile, [], {
			cols: 80,
			rows: 30,
			env
		});
		const result: string[] = [];
		proc.on('data', (data) => {
			result.push(data);
		});
		// The `node-pty` types don't properly extend `EventEmitter`,
		// so manually case here.
		const onEnd = once(proc as unknown as EventEmitter, 'end');
		const [exitCode, signal] = await once.spread<[ number, number ]>(proc as unknown as EventEmitter, 'exit');
		await onEnd;

		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'text/plain; charset=utf8');
		res.setHeader('X-Exit-Code', String(exitCode));
		res.setHeader('X-Exit-Signal', String(signal));
		res.end(result.join(''));
	} finally {
		process.chdir(origCwd);
		await remove(workPath);
	}
}
