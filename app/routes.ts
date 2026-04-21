import { type RouteConfig, route } from '@react-router/dev/routes';

export default [
	route('api/exec', 'routes/api.exec.ts'),
	route('api/og', 'routes/api.og.tsx'),
	route('*', 'routes/splat.tsx'),
] satisfies RouteConfig;
