/* Локальный сервер для проверки: node tools/serve.js [dist] → http://localhost:8080 */
'use strict';
var http = require('http'), fs = require('fs'), path = require('path');
var ROOT = path.join(__dirname, '..', process.argv[2] || ''), PORT = +process.env.PORT || 8080;
var TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8' };
http.createServer(function (q, r) {
  var u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u);
  if (f.indexOf(ROOT) !== 0) { r.writeHead(403); return r.end(); }
  fs.readFile(f, function (e, d) {
    if (e) { r.writeHead(404, { 'Content-Type': TYPES['.html'] }); return r.end(fs.existsSync(path.join(ROOT, '404.html')) ? fs.readFileSync(path.join(ROOT, '404.html')) : 'Not found'); }
    r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d);
  });
}).listen(PORT, function () { console.log('http://localhost:' + PORT + ' ← ' + ROOT); });
