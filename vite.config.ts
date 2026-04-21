import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	resolve: {
		alias: {
			// `parse-ansi`'s package.json points "main" at "parse-ansi"
			// instead of "index.js", which breaks bundler resolution.
			'parse-ansi': 'parse-ansi/index.js',
		},
	},
});
