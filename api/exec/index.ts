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
	close
} from 'fs-extra';

const importBinPath = (async () => {
	const dir = join(tmpdir(), Math.random().toString(32).slice(2));
	await mkdirp(dir);

	const res = await fetch('https://import.pw');
	const ws = createWriteStream(join(dir, 'import'), {
		mode: 0o777
	});
	res.body.pipe(ws);
	await once(ws, 'close');

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

		const outputFile = join(workPath, '.output');
		const fd = await open(outputFile, 'w');
		const proc = execa(inputFile, [], {
			env: {
				...process.env,
				PATH: `${await importBinPath}:${process.env.PATH}`,
				IMPORT_CACHE: workPath
			},
			reject: false,
			stdio: ['ignore', fd, fd]
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
