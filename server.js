import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import fearApp from './public/fear/fear_server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
const PUBLIC = path.join(__dirname, 'public');
const CATS_DIR = path.join(PUBLIC, 'cats');
const MANIFEST = path.join(__dirname, 'cats.json');

app.use('/fear', fearApp);

// fix the stupid MIME shit
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    // Force correct MIME types so the tunnel can't mess them up
    // NOTE: css is still getting fucked up and i honestly don't know why nor how to fix it atp
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (filePath.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    }
  }
}));

function readImages() {
  return fs.readdirSync(CATS_DIR).filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f));
}

function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  } catch {
    return {};
  }
}

let idToFile = loadManifest();

function syncManifest() {
  const files = readImages();
  const known = new Set(Object.values(idToFile));
  
  for (const [id, file] of Object.entries(idToFile)) {
    if (!files.includes(file)) delete idToFile[id];
  }
  
  let next = Object.keys(idToFile).reduce(
    (m, k) => Math.max(m, Number(k) || 0), 0
  ) + 1;
  
  for (const file of files) {
    if (!known.has(file)) {
      idToFile[String(next++)] = file;
    }
  }
  
  fs.writeFileSync(MANIFEST, JSON.stringify(idToFile, null, 2));
  return idToFile;
}

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
};

// sync
syncManifest();

setInterval(() => { try { syncManifest(); } catch (e) { console.error(e); } }, 60_000);

app.get('/api/cats', (req, res, next) => {
  // try {
  //   const dir = path.join(PUBLIC, 'cats');
  //   const files = fs
  //     .readdirSync(dir)
  //     .filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f));
  //   res.json(files.map(f => `cats/${f}`));
  // } catch (err) {
  //   next(err);
  // }
  res.json(Object.keys(idToFile).map(id => `/api/cats/${id}`));
});

app.get('/api/cats/:id', (req, res, next) => {
  
  const file = idToFile[req.params.id];
  if (!file) return res.status(404).json({ error: 'Not found' });
  
  const fullPath = path.join(CATS_DIR, file);
  if (!fullPath.startsWith(CATS_DIR + path.sep)) {
    return res.status(400).json({ error: 'Bad path' });
  }
  
  let stat;
  try {
    stat = fs.statSync(fullPath);
  } catch {
    return res.status(404).json({ error: 'Not found' });
  }
  
  res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Accept-Ranges', 'none');
  res.setHeader('Cache-Control', 'no-store');
  
  const stream = fs.createReadStream(fullPath);
  stream.on('error', next);
  stream.pipe(res);
});

app.listen(8000, () => console.log('Server running on port 8000'));