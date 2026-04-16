const SUPPORTED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif']);

// import.meta.glob is resolved statically by Vite at build time,
// avoiding fs.readdirSync path issues in SSG/Vercel environments.
const posterFiles = import.meta.glob('/public/posters/*', { eager: true });

function buildPosterMap() {
  const map = {};
  for (const key of Object.keys(posterFiles)) {
    // key example: '/public/posters/1930.jpg'
    const filename = key.split('/').pop();
    const parts = filename.split('.');
    if (parts.length < 2) continue;

    const ext = parts[parts.length - 1].toLowerCase();
    const basename = parts.slice(0, -1).join('.');
    if (!SUPPORTED_EXTENSIONS.has(ext) || !/^\d{4}$/.test(basename)) continue;

    // public/ files are served at the root, so strip the '/public' prefix
    map[basename] = `/posters/${filename}`;
  }
  return map;
}

const posterMap = buildPosterMap();

export function getPosterForYear(year) {
  return posterMap[String(year)] || null;
}

export function getPosterMap() {
  return { ...posterMap };
}
