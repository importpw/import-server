import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	transpilePackages: ['shiki'],
	async rewrites() {
		return [
			// The root path `/` displays the default repo (importpw/import).
			// Perform content negotiation up-front via rewrites so that the
			// same logic runs in local dev + on Vercel.
			{
				source: '/',
				has: [
					{
						type: 'header',
						key: 'accept',
						value: 'application/json',
					},
				],
				destination: '/api/data/importpw/import',
			},
			{
				source: '/',
				has: [
					{
						type: 'header',
						key: 'user-agent',
						value: '.*(curl|wget).*',
					},
				],
				destination: '/api/raw/importpw/import',
			},
			{
				source: '/',
				destination: '/importpw/import',
			},
			// All other paths: route JSON/raw requests to dedicated route
			// handlers so we can respond with non-HTML responses.
			{
				source: '/:path*',
				has: [
					{
						type: 'header',
						key: 'accept',
						value: 'application/json',
					},
				],
				destination: '/api/data/:path*',
			},
			{
				source: '/:path*',
				has: [
					{
						type: 'header',
						key: 'user-agent',
						value: '.*(curl|wget).*',
					},
				],
				destination: '/api/raw/:path*',
			},
		];
	},
};

export default nextConfig;
