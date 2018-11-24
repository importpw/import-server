export default function redirect (res, url) {
  res.statusCode = 302;
  res.setHeader('Location', url);
  res.end(`Redirecting to ${url}\n`);
}
