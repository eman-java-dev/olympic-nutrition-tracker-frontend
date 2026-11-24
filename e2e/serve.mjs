import { createReadStream, readFileSync, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve('dist/e2e');
const index = resolve(root, 'index.html');
const apiUrl = 'http://localhost:8080/api';
const scripts = readdirSync(root).filter(name => name.endsWith('.js'))
  .map(name => readFileSync(resolve(root, name), 'utf8'));
if (!scripts.some(script => script.includes(apiUrl)) ||
    scripts.some(script => /https:\/\/[^\s"']+\.onrender\.com\/api/.test(script))) {
  throw new Error('Only an optimized loopback test build may be served');
}
statSync(index);

const csp = [
  "default-src 'none'", "script-src 'self'", "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://images.unsplash.com", "media-src 'self' blob:",
  "font-src 'self'", "connect-src 'self' http://localhost:8080", "base-uri 'self'",
  "frame-ancestors 'none'", "form-action 'self'", "object-src 'none'",
].join('; ');
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.ico': 'image/x-icon', '.mp4': 'video/mp4',
};

createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405).end();
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }
  const file = resolve(root, '.' + pathname);
  if (file !== root && !file.startsWith(root + sep)) {
    response.writeHead(403).end();
    return;
  }
  const selected = extname(file) ? file : index;
  const info = statSync(selected, { throwIfNoEntry: false });
  if (!info?.isFile()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, {
    'Content-Type': types[extname(selected)] ?? 'application/octet-stream',
    'Content-Length': info.size,
    'Content-Security-Policy': csp,
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  const stream = createReadStream(selected);
  stream.on('error', () => response.destroy());
  response.on('close', () => stream.destroy());
  stream.pipe(response);
}).listen(4200, '127.0.0.1');
