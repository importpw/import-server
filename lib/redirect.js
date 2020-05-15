export default function redirect(res, url) {
	if (typeof location !== 'undefined') {
		// Client-side
		location.href = url;
	} else {
		// Server-side
		res.statusCode = 302;
		res.setHeader('Location', url);
		res.end(`Redirecting to ${url}\n`);
	}
}
