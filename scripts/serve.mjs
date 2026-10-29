import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.pdf': 'application/pdf'
};
export function createStaticServer(root = repositoryRoot) {
  return http.createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) {
        response.writeHead(405, {'Allow': 'GET, HEAD'}); response.end(); return;
      }
      let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname === '/') pathname = '/index.html';
      const segments = pathname.split('/');
      if (pathname.includes('\\') || segments.some(segment => segment === '..' || segment.startsWith('.')) ||
          !/^\/(?:index\.html|(?:src|styles|data|assets)\/.+)$/.test(pathname)) {
        response.writeHead(404); response.end('Not found'); return;
      }
      const file = path.resolve(root, '.' + pathname);
      if (!file.startsWith(path.resolve(root) + path.sep)) { response.writeHead(404); response.end(); return; }
      const bytes = await fs.readFile(file);
      response.writeHead(200, {
        'Content-Type': types[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff'
      });
      response.end(request.method === 'HEAD' ? undefined : bytes);
    } catch (error) {
      response.writeHead(error instanceof URIError ? 400 : 404);
      response.end(error instanceof URIError ? 'Bad request' : 'Not found');
    }
  });
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const argument = process.argv.indexOf('--port');
  const port = argument >= 0 ? Number(process.argv[argument + 1]) : Number(process.env.PORT || 5173);
  const server = createStaticServer();
  server.listen(port, '127.0.0.1', () => {
    console.log('Terpene Atlas: http://127.0.0.1:' + server.address().port);
  });
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
}
