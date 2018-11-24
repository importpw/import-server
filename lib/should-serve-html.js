const isBot = require('is-bot');

export default function shouldServeHTML (req) {
  if (!req) return true; // Client-side Next.js redirect
  if (/html/i.test(req.headers.accept)) return true;
  if (/(curl|wget)/i.test(req.headers['user-agent'])) return false;
  return isBot(req.headers['user-agent']);
}
