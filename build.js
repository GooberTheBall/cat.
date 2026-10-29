// node build.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const CATS_DIR = path.join(PUBLIC, 'cats');
const MANIFEST = path.join(__dirname, 'cats.json');
const OUT_API = path.join(PUBLIC, 'api');

// Sync cats.json
function readImages() {
  return fs.readdirSync(CATS_DIR).filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f));
}
let idToFile = {};
try { idToFile = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch {}

const files = readImages();
const known = new Set(Object.values(idToFile));
for (const [id, file] of Object.entries(idToFile)) {
  if (!files.includes(file)) delete idToFile[id];
}
let next = Math.max(0, ...Object.keys(idToFile).map(Number)) + 1;
for (const file of files) {
  if (!known.has(file)) idToFile[String(next++)] = file;
}
fs.writeFileSync(MANIFEST, JSON.stringify(idToFile, null, 2));

// Emit /api/cats.json (array of image URLs)
fs.mkdirSync(OUT_API, { recursive: true });
const list = Object.values(idToFile).map(f => `cats/${f}`);
fs.writeFileSync(path.join(OUT_API, 'cats.json'), JSON.stringify(list));



// Emit /api/cats/<id>.json
fs.mkdirSync(path.join(OUT_API, 'cats'), { recursive: true });
for (const [id, file] of Object.entries(idToFile)) {
  fs.writeFileSync(
    path.join(OUT_API, 'cats', `${id}.json`),
    JSON.stringify({ id: Number(id), file, url: `cats/${file}` })
  );
}


// pages/fear/fear.html -> pages/fear/index.html
const fearSrc = path.join(PUBLIC, 'pages/fear', 'fear.html');
const fearDst = path.join(PUBLIC, 'pages/fear', 'index.html');
if (fs.existsSync(fearSrc)) fs.copyFileSync(fearSrc, fearDst);

console.log(`Done. ${Object.keys(idToFile).length} cats mapped.`);