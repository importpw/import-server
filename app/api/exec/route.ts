import { Sandbox } from '@vercel/sandbox';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `/api/exec` — run a user-supplied shell script and stream its output.
 *
 * Scripts arrive from anonymous visitors via the "Run this code" popup on
 * the landing page, so we have to assume everything about them is hostile:
 * they can try to exfiltrate environment variables, burn CPU, open sockets
 * to private IPs, tamper with /tmp, etc. To contain that, each request
 * gets its own **Vercel Sandbox** — a Firecracker microVM with:
 *
 * - No inherited environment (the sandbox boots with an empty env, so none
 *   of the parent function's secrets — GITHUB_CLIENT_SECRET, AUTH_SECRET,
 *   the GITHUB_TOKEN fallback PAT, Vercel project/OIDC tokens, etc. — are
 *   visible to the user script).
 * - Private-subnet egress denied so the script can't pivot into the VPC or
 *   metadata services. Public HTTPS stays open so the `import` command can
 *   still `curl raw.githubusercontent.com` to pull modules.
 * - An ephemeral filesystem that's destroyed on `sandbox.stop()`.
 * - A 30-second hard timeout (plenty for a demo script; nothing survives
 *   beyond the HTTP request).
 */

/**
 * Lazily-fetched contents of the `import` shell function. The landing-page
 * demo shell scripts start with `#!/usr/bin/env import`, so we install
 * `import` into the sandbox's PATH before executing.
 *
 * Fetched once per server process, reused for every request.
 */
let importScript: Promise<string> | null = null;
function getImportScript(): Promise<string> {
	if (!importScript) {
		importScript = fetch('https://import.sh/?format=raw')
			.then((res) => {
				if (!res.ok) {
					importScript = null;
					throw new Error(
						`Failed to fetch import script: ${res.status}`
					);
				}
				return res.text();
			})
			.catch((err) => {
				importScript = null;
				throw err;
			});
	}
	return importScript;
}

const SCRIPT_TIMEOUT_MS = 30_000;
const MAX_SCRIPT_BYTES = 64 * 1024; // 64 KiB — generous for a demo script.

async function handle(request: Request): Promise<Response> {
	const userScript = await request.text();
	if (Buffer.byteLength(userScript, 'utf8') > MAX_SCRIPT_BYTES) {
		return new Response(
			`Script too large (max ${MAX_SCRIPT_BYTES} bytes).\n`,
			{
				status: 413,
				headers: { 'Content-Type': 'text/plain; charset=utf8' },
			}
		);
	}
	const importSh = await getImportScript();

	const sandbox = await Sandbox.create({
		runtime: 'node22',
		timeout: SCRIPT_TIMEOUT_MS,
		// Allow public Internet egress (so `curl`/`import` can fetch modules
		// from GitHub), but deny private subnets to prevent SSRF into the
		// VPC, cloud-metadata services (169.254.0.0/16), or link-local.
		networkPolicy: {
			subnets: {
				deny: [
					'10.0.0.0/8',
					'172.16.0.0/12',
					'192.168.0.0/16',
					'169.254.0.0/16',
					'127.0.0.0/8',
				],
			},
		},
		// Intentionally empty. The sandbox SDK does NOT inherit
		// process.env by default, but set this explicitly so any future
		// SDK changes can't regress us into leaking secrets.
		env: {},
	});

	try {
		// Drop the user's script and the `import` binary into the
		// sandbox. We put both in the sandbox's home directory (the
		// default cwd, /vercel/sandbox) and add that directory to PATH
		// so scripts can invoke `import` without needing sudo.
		await sandbox.writeFiles([
			{
				path: '/vercel/sandbox/bin/import',
				content: Buffer.from(importSh, 'utf8'),
				mode: 0o755,
			},
			{
				path: '/vercel/sandbox/input.sh',
				content: Buffer.from(userScript, 'utf8'),
				mode: 0o755,
			},
		]);

		// Execute the script via its shebang so that `#!/usr/bin/env
		// import` (or any other shebang the user wrote) takes effect.
		// This matters for the typical demo case, where `import` in the
		// shebang is what defines `import` as a shell function in the
		// script's scope — running the body with plain `bash input.sh`
		// would bypass that and re-invoke `import` as an executable for
		// every `import "..."` line inside, which breaks the design.
		const proc = await sandbox.runCommand({
			cmd: './input.sh',
			cwd: '/vercel/sandbox',
			env: {
				// Minimal env: nothing from the host. `import` itself
				// needs very little.
				PATH: '/vercel/sandbox/bin:/usr/bin:/bin',
				HOME: '/vercel/sandbox',
				IMPORT_CACHE: '/vercel/sandbox/.import-cache',
			},
		});

		const output = await proc.output('both');

		// Stop the sandbox asynchronously — we don't need to block the
		// response on it. The sandbox timeout provides the backstop.
		sandbox.stop().catch(() => {
			/* best-effort cleanup */
		});

		return new Response(output, {
			status: 200,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Content-Type': 'text/plain; charset=utf8',
				'X-Exit-Code': String(proc.exitCode),
			},
		});
	} catch (err) {
		sandbox.stop().catch(() => {
			/* ignore */
		});
		throw err;
	}
}

export async function POST(request: Request) {
	return handle(request);
}

export async function GET(request: Request) {
	return handle(request);
}
