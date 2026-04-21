'use client';

import { useEffect, useState } from 'react';
import Ansi from './ansi';

export default function CodeExec({ code }: { code: string }) {
	const [data, setData] = useState('');
	const write = (d: string) => setData((current) => current + d);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (cancelled) return;
			write(
				'\u001b[32m\u001b[1m$\u001b[22m\u001b[39m \u001b[3mRunning...\u001b[23m\r\n'
			);

			const res = await fetch('/api/exec', {
				method: 'POST',
				body: code,
			});
			const body = await res.text();
			if (cancelled) return;
			write(body.replace(/\n/g, '\r\n'));

			const exitCode = parseInt(
				res.headers.get('x-exit-code') ?? '0',
				10
			);
			if (exitCode !== 0) {
				write(
					`\u001b[31mScript failed with exit code \u001b[1m${exitCode}\u001b[22m\u001b[39m\r\n`
				);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [code]);

	return (
		<div className="h-full w-full bg-black p-2.5 text-white">
			<pre>
				<code>
					<Ansi>{data}</Ansi>
				</code>
			</pre>
		</div>
	);
}
