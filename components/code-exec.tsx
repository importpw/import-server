'use client';

import { useEffect, useRef, useState } from 'react';
import Ansi from './ansi';

export default function CodeExec({ code }: { code: string }) {
	const [data, setData] = useState('');

	// React 19 + Strict Mode runs effects twice on mount (once for real,
	// once for the "development-only simulated unmount/remount" pair).
	// A plain `let cancelled` + cleanup doesn't help us here because the
	// initial synchronous `write("$ Running...")` has already landed in
	// state by the time the cleanup runs, and the re-mounted effect then
	// prints a *second* "$ Running..." above its own request.
	//
	// Guard with a ref that we never reset across the StrictMode pair so
	// the fetch is kicked off exactly once regardless of how many times
	// the effect fires.
	const started = useRef(false);

	useEffect(() => {
		if (started.current) return;
		started.current = true;

		let cancelled = false;
		const write = (d: string) =>
			setData((current) => current + d);

		(async () => {
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
