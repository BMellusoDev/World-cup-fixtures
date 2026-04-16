import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SUPPORTED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif']);
let cachedMap = null;

function readPosterMap() {
  if (cachedMap) {
    return cachedMap;
  }

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const postersDir = path.resolve(currentDir, '..', '..', 'public', 'posters');
  const map = {};

  if (fs.existsSync(postersDir)) {
    const files = fs.readdirSync(postersDir);
    for (const file of files) {
      const parts = file.split('.');
      if (parts.length < 2) {
        continue;
      }

      const ext = parts[parts.length - 1].toLowerCase();
      const basename = parts.slice(0, -1).join('.');
      if (!SUPPORTED_EXTENSIONS.has(ext) || !/^\d{4}$/.test(basename)) {
        continue;
      }

      map[basename] = `/posters/${file}`;
    }
  }

  cachedMap = map;
  return map;
}

export function getPosterForYear(year) {
  const yearKey = String(year);
  return readPosterMap()[yearKey] || null;
}

export function getPosterMap() {
  return { ...readPosterMap() };
}
