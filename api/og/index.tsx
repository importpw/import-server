import React from 'react';
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function OG(req: Request) {
	const url = new URL(req.url);
	const org = url.searchParams.get('org');
	const repo = url.searchParams.get('repo');

	let importStr = 'import';
	if (repo) {
		importStr += ' "';
		if (org) {
			importStr += `${org}/`;
		}
		importStr += `${repo}"`;
	}

	return new ImageResponse(
		(
			<div
				style={{
					fontSize: 80,
					fontWeight: 'bold',
					backgroundColor: 'black',
					color: 'white',
					width: '100%',
					height: '100%',
					display: 'flex',
					textAlign: 'center',
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'column',
					fontFamily: 'monospace',
				}}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={new URL('/import.png', url).href}
						alt="logo"
						height={300}
					/>
					{org && (
						<>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={new URL('/arrow.png', url).href}
								alt="arrow"
								height={180}
								style={{ padding: '0 50px' }}
							/>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={`https://github.com/${org}.png`}
								alt="avatar"
								height={300}
								style={{ borderRadius: 30 }}
							/>
						</>
					)}
				</div>
				<p style={{ padding: 0, margin: 0, paddingTop: '10px' }}>
					{importStr}
				</p>
			</div>
		),
		{
			width: 1200,
			height: 600,
		}
	);
}
