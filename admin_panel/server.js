const fs = require('fs');
const http = require('http');
const path = require('path');

const publicDir = __dirname;
const port = Number(process.env.PORT || 8001);
const host = process.env.HOST || '0.0.0.0';
const allowedFiles = new Set(['/index.html', '/styles.css', '/admin.js', '/config.js']);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
};

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/health') {
    send(res, 200, 'ok', { 'Content-Type': 'text/plain; charset=utf-8' });
    return;
  }

  if (url.pathname === '/config.js') {
    const apiBaseUrl = process.env.PUBLIC_API_BASE_URL || process.env.API_BASE_URL || process.env.BACKEND_URL || '';
    send(res, 200, `window.EVSPEARE_CONFIG = ${JSON.stringify({ apiBaseUrl })};`, {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/javascript; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    });
    return;
  }

  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;

  if (!allowedFiles.has(pathname)) {
    send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
    return;
  }

  const filePath = path.join(publicDir, pathname);
  fs.readFile(filePath, (error, contents) => {
    if (error) {
      send(res, 500, 'Unable to load file', { 'Content-Type': 'text/plain; charset=utf-8' });
      return;
    }

    send(res, 200, contents, {
      'Cache-Control': pathname === '/index.html' ? 'no-store' : 'public, max-age=31536000, immutable',
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
  });
});

server.listen(port, host, () => {
  console.log(`Admin panel listening on ${host}:${port}`);
});
