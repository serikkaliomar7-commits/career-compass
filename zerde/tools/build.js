/* Зерде — сборка для продакшена: все скрипты из index.html (в том же порядке) склеиваются в один файл
 * и сжимаются esbuild, CSS тоже сжимается; имена файлов с хешем, чтобы браузер не держал старую версию.
 * Результат — папка dist/ (её и публикует хостинг). Исходники не меняются, сайт работает и без сборки.
 * Запуск: npm install && npm run build */
'use strict';
var fs = require('fs'), path = require('path'), crypto = require('crypto');
var ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'dist');
var esbuild = require('esbuild');

function hash(s) { return crypto.createHash('sha256').update(s).digest('hex').slice(0, 10); }
function rm(p) { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); }

rm(OUT); fs.mkdirSync(path.join(OUT, 'js'), { recursive: true }); fs.mkdirSync(path.join(OUT, 'css'), { recursive: true });
var html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
var scripts = (html.match(/<script src="js\/[^"]+"><\/script>/g) || []).map(function (t) { return t.match(/src="([^"]+)"/)[1]; });
if (!scripts.length) throw new Error('index.html: скрипты не найдены');

// Каждый файл — своя IIFE с 'use strict', поэтому склеиваем как есть, через «;» и перевод строки.
var js = scripts.map(function (s) { return '/* ' + s + ' */\n' + fs.readFileSync(path.join(ROOT, s), 'utf8'); }).join('\n;\n');
var min = esbuild.transformSync(js, { minify: true, target: 'es2017', charset: 'utf8', legalComments: 'none' }).code;
var jsName = 'js/zerde.' + hash(min) + '.js';
fs.writeFileSync(path.join(OUT, jsName), min);

var css = esbuild.transformSync(fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8'), { loader: 'css', minify: true, charset: 'utf8' }).code;
var cssName = 'css/style.' + hash(css) + '.css';
fs.writeFileSync(path.join(OUT, cssName), css);

var outHtml = html.replace(/\s*<script src="js\/[^"]+"><\/script>/g, '')
  .replace('href="css/style.css"', 'href="' + cssName + '"')
  .replace('</body>', '<script src="' + jsName + '"></script>\n</body>');
fs.writeFileSync(path.join(OUT, 'index.html'), outHtml);
fs.writeFileSync(path.join(OUT, '404.html'), outHtml);   // любой неизвестный адрес открывает приложение

// Статические файлы как есть.
['_headers', 'vercel.json', 'manifest.webmanifest', 'robots.txt', 'favicon.svg'].forEach(function (f) { if (fs.existsSync(path.join(ROOT, f))) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f)); });
if (fs.existsSync(path.join(ROOT, 'img'))) fs.cpSync(path.join(ROOT, 'img'), path.join(OUT, 'img'), { recursive: true });

var kb = function (p) { return Math.round(fs.statSync(path.join(OUT, p)).size / 1024) + ' КБ'; };
console.log('dist/ готов: ' + scripts.length + ' скриптов → ' + jsName + ' (' + kb(jsName) + '), ' + cssName + ' (' + kb(cssName) + ')');
