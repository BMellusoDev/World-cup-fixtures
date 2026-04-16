// Ejecutar: node seed-db.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_API = 'https://api.github.com/repos/openfootball/worldcup.json/contents';
const RAW_BASE = 'https://raw.githubusercontent.com/openfootball/world-cup.json/master';

const HOST_BY_YEAR = {
  1930: 'Uruguay',
  1934: 'Italia',
  1938: 'Francia',
  1950: 'Brasil',
  1954: 'Suiza',
  1958: 'Suecia',
  1962: 'Chile',
  1966: 'Inglaterra',
  1970: 'Mexico',
  1974: 'Alemania Occidental',
  1978: 'Argentina',
  1982: 'Espana',
  1986: 'Mexico',
  1990: 'Italia',
  1994: 'Estados Unidos',
  1998: 'Francia',
  2002: 'Corea del Sur y Japon',
  2006: 'Alemania',
  2010: 'Sudafrica',
  2014: 'Brasil',
  2018: 'Rusia',
  2022: 'Qatar',
  2026: 'Estados Unidos, Mexico y Canada'
};

const CHAMPION_BY_YEAR = {
  1930: 'Uruguay',
  1934: 'Italia',
  1938: 'Italia',
  1950: 'Uruguay',
  1954: 'Alemania Occidental',
  1958: 'Brasil',
  1962: 'Brasil',
  1966: 'Inglaterra',
  1970: 'Brasil',
  1974: 'Alemania Occidental',
  1978: 'Argentina',
  1982: 'Italia',
  1986: 'Argentina',
  1990: 'Alemania Occidental',
  1994: 'Brasil',
  1998: 'Francia',
  2002: 'Brasil',
  2006: 'Italia',
  2010: 'Espana',
  2014: 'Alemania',
  2018: 'Francia',
  2022: 'Argentina'
};

function phaseFromMatch(match) {
  if (match.group && match.round) {
    return `${match.group} - ${match.round}`;
  }
  return match.round || match.group || 'Otro';
}

async function getAvailableYears() {
  const response = await fetch(GITHUB_API, {
    headers: { 'User-Agent': 'world-cup-fixtures-seeder' }
  });
  if (!response.ok) {
    throw new Error(`No se pudo consultar el repositorio (${response.status})`);
  }

  const entries = await response.json();
  return entries
    .filter((entry) => entry.type === 'dir' && /^\d{4}$/.test(entry.name))
    .map((entry) => Number(entry.name))
    .sort((a, b) => b - a);
}

async function getYearMatches(year) {
  const url = `${RAW_BASE}/${year}/worldcup.json`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'world-cup-fixtures-seeder' }
  });

  if (!response.ok) {
    throw new Error(`No se pudo descargar ${year} (${response.status})`);
  }

  const data = await response.json();
  const matches = Array.isArray(data.matches) ? data.matches : [];

  return matches.map((match, index) => ({
    id: index + 1,
    phase: phaseFromMatch(match),
    date: match.date || null,
    stadium: match.ground || 'N/A',
    team1: match.team1 || 'TBD',
    team2: match.team2 || 'TBD',
    score1: Array.isArray(match.score?.ft) ? match.score.ft[0] : null,
    score2: Array.isArray(match.score?.ft) ? match.score.ft[1] : null
  }));
}

async function buildDataset() {
  const years = await getAvailableYears();
  const dataset = [];

  for (const year of years) {
    let matches;
    try {
      matches = await getYearMatches(year);
    } catch (error) {
      console.log(`SKIP ${year}: ${error.message}`);
      continue;
    }

    const hasPlayedFinal = matches.some(
      (match) =>
        typeof match.phase === 'string' &&
        /final/i.test(match.phase) &&
        !/third|tercer/i.test(match.phase) &&
        match.score1 !== null &&
        match.score2 !== null
    );

    dataset.push({
      year,
      host: HOST_BY_YEAR[year] || 'Sede por confirmar',
      champion: CHAMPION_BY_YEAR[year] || null,
      upcoming: !hasPlayedFinal,
      matches
    });
    console.log(`OK ${year}: ${matches.length} partidos`);
  }

  return dataset;
}

function writeOutputs(worldcups) {
  const srcFile = path.join(__dirname, 'src', 'data', 'worldcups.js');
  const publicFile = path.join(__dirname, 'public', 'data', 'worldcups.json');

  const jsModule = `export const WORLD_CUPS = ${JSON.stringify(worldcups, null, 2)};\n`;
  const payload = {
    generatedAt: new Date().toISOString(),
    totalWorldCups: worldcups.length,
    totalMatches: worldcups.reduce((sum, wc) => sum + wc.matches.length, 0),
    worldcups
  };

  fs.mkdirSync(path.dirname(srcFile), { recursive: true });
  fs.mkdirSync(path.dirname(publicFile), { recursive: true });
  fs.writeFileSync(srcFile, jsModule, 'utf-8');
  fs.writeFileSync(publicFile, JSON.stringify(payload, null, 2), 'utf-8');

  console.log('');
  console.log(`Archivo generado: ${srcFile}`);
  console.log(`Archivo generado: ${publicFile}`);
  console.log(`Mundiales: ${payload.totalWorldCups}`);
  console.log(`Partidos: ${payload.totalMatches}`);
}

try {
  console.log('Cargando todos los partidos historicos de la Copa del Mundo...');
  const worldcups = await buildDataset();
  writeOutputs(worldcups);
  console.log('Seed completado con exito.');
} catch (error) {
  console.error('Fallo al generar dataset:', error.message);
  process.exit(1);
}