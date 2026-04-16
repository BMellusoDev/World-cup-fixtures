// seed-fjelstul.js
// Downloads Fjelstul World Cup Database CSVs and creates per-match JSON files
// under public/data/fjelstul/{matchId}.json
// Run with: node seed-fjelstul.js

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv';
const OUTPUT_DIR = join(__dirname, 'public', 'data', 'fjelstul');

// Known team name aliases between our app and Fjelstul
const ALIASES = [
  ['republic of ireland', 'ireland'],
  ['ivory coast', "côte d'ivoire", "cote d'ivoire"],
  ['north macedonia', 'macedonia'],
  ['trinidad and tobago', 'trinidad & tobago'],
  ['usa', 'united states'],
  ['south korea', 'korea republic'],
  ['bosnia-herzegovina', 'bosnia and herzegovina'],
];

function normalize(name) {
  return (name || '').toLowerCase().trim();
}

function teamsMatch(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  for (const group of ALIASES) {
    if (group.includes(na) && group.includes(nb)) return true;
  }
  return false;
}

async function downloadCSV(filename) {
  console.log(`  Downloading ${filename}...`);
  const res = await fetch(`${BASE_URL}/${filename}`);
  if (!res.ok) throw new Error(`Failed: ${res.status} ${res.statusText}`);
  return await res.text();
}

function parseCSV(text) {
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = [];
  let i = 0;
  const n = text.length;

  while (i < n) {
    const row = [];
    while (i < n && text[i] !== '\n') {
      let field = '';
      if (text[i] === '"') {
        i++;
        while (i < n) {
          if (text[i] === '"' && i + 1 < n && text[i + 1] === '"') {
            field += '"';
            i += 2;
          } else if (text[i] === '"') {
            i++;
            break;
          } else {
            field += text[i++];
          }
        }
      } else {
        while (i < n && text[i] !== ',' && text[i] !== '\n') {
          field += text[i++];
        }
      }
      row.push(field);
      if (i < n && text[i] === ',') i++;
    }
    if (i < n && text[i] === '\n') i++;
    if (row.length > 0 && !(row.length === 1 && row[0] === '')) {
      rows.push(row);
    }
  }
  return rows;
}

function csvToObjects(text) {
  const rows = parseCSV(text);
  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = row[idx] ?? ''; });
    return obj;
  });
}

function playerName(row) {
  const given = row.given_name !== 'not applicable' ? row.given_name : '';
  return `${given ? given + ' ' : ''}${row.family_name}`.trim();
}

async function main() {
  console.log('=== Fjelstul World Cup Data Seeder ===\n');

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}\n`);
  }

  // Load our worldcups data
  const worldcupsPath = join(__dirname, 'public', 'data', 'worldcups.json');
  const worldcupsData = JSON.parse(readFileSync(worldcupsPath, 'utf-8'));

  // Flat list of all our matches with their year
  const ourMatches = [];
  for (const wc of worldcupsData.worldcups) {
    for (const match of wc.matches || []) {
      ourMatches.push({ ...match, year: wc.year });
    }
  }
  console.log(`Loaded ${ourMatches.length} matches from worldcups.json\n`);

  // Download Fjelstul CSVs
  console.log('Downloading Fjelstul CSVs...');
  const [matchesCSV, goalsCSV, bookingsCSV, subsCSV, penaltiesCSV, appearancesCSV, refAppsCSV] = await Promise.all([
    downloadCSV('matches.csv'),
    downloadCSV('goals.csv'),
    downloadCSV('bookings.csv'),
    downloadCSV('substitutions.csv'),
    downloadCSV('penalty_kicks.csv'),
    downloadCSV('player_appearances.csv'),
    downloadCSV('referee_appearances.csv'),
  ]);
  console.log('');

  // Parse CSVs
  console.log('Parsing CSVs...');
  const fMatches      = csvToObjects(matchesCSV);
  const fGoals        = csvToObjects(goalsCSV);
  const fBookings     = csvToObjects(bookingsCSV);
  const fSubs         = csvToObjects(subsCSV);
  const fPenalties    = csvToObjects(penaltiesCSV);
  const fAppearances  = csvToObjects(appearancesCSV);
  const fRefApps      = csvToObjects(refAppsCSV);

  console.log(`  matches: ${fMatches.length}`);
  console.log(`  goals: ${fGoals.length}`);
  console.log(`  bookings: ${fBookings.length}`);
  console.log(`  substitutions: ${fSubs.length}`);
  console.log(`  penalty_kicks: ${fPenalties.length}`);
  console.log(`  player_appearances: ${fAppearances.length}`);
  console.log(`  referee_appearances: ${fRefApps.length}\n`);

  // Group events by Fjelstul match_id
  const goalsByMatch       = new Map();
  const bookingsByMatch    = new Map();
  const subsByMatch        = new Map();
  const pensByMatch        = new Map();
  const appearsByMatch     = new Map();
  const refAppsByMatch     = new Map();

  for (const g of fGoals)        { if (!goalsByMatch.has(g.match_id))      goalsByMatch.set(g.match_id, []);      goalsByMatch.get(g.match_id).push(g);      }
  for (const b of fBookings)     { if (!bookingsByMatch.has(b.match_id))   bookingsByMatch.set(b.match_id, []);   bookingsByMatch.get(b.match_id).push(b);   }
  for (const s of fSubs)         { if (!subsByMatch.has(s.match_id))       subsByMatch.set(s.match_id, []);       subsByMatch.get(s.match_id).push(s);       }
  for (const p of fPenalties)    { if (!pensByMatch.has(p.match_id))       pensByMatch.set(p.match_id, []);       pensByMatch.get(p.match_id).push(p);       }
  for (const a of fAppearances)  { if (!appearsByMatch.has(a.match_id))    appearsByMatch.set(a.match_id, []);    appearsByMatch.get(a.match_id).push(a);    }
  for (const r of fRefApps)      { if (!refAppsByMatch.has(r.match_id))    refAppsByMatch.set(r.match_id, []);    refAppsByMatch.get(r.match_id).push(r);    }

  // Build lookup: `year|date|home_norm|away_norm` → fjelstul match_id
  const fMatchLookup = new Map();
  for (const m of fMatches) {
    const year = m.tournament_id.replace('WC-', '');
    const key = `${year}|${m.match_date}|${normalize(m.home_team_name)}|${normalize(m.away_team_name)}`;
    fMatchLookup.set(key, m.match_id);
  }

  // Match and write
  console.log('Matching and writing JSON files...');
  let matched = 0;
  let skipped = 0;
  const unmatched = [];

  for (const match of ourMatches) {
    // Only process completed matches
    if (match.score1 === null || match.score2 === null) {
      skipped++;
      continue;
    }

    const year = String(match.year);
    const date = match.date;
    const t1 = normalize(match.team1);
    const t2 = normalize(match.team2);

    // Try exact lookup (home=team1, away=team2)
    let fMatchId = fMatchLookup.get(`${year}|${date}|${t1}|${t2}`);

    // Try swapped
    if (!fMatchId) {
      fMatchId = fMatchLookup.get(`${year}|${date}|${t2}|${t1}`);
    }

    // Try fuzzy match for that year+date
    if (!fMatchId) {
      for (const [key, mid] of fMatchLookup) {
        const parts = key.split('|');
        const [ky, kd, kh, ka] = parts;
        if (ky === year && kd === date) {
          if ((teamsMatch(kh, t1) && teamsMatch(ka, t2)) ||
              (teamsMatch(kh, t2) && teamsMatch(ka, t1))) {
            fMatchId = mid;
            break;
          }
        }
      }
    }

    if (!fMatchId) {
      unmatched.push(`${year} ${date} ${match.team1} vs ${match.team2}`);
      skipped++;
      continue;
    }

    // Goals
    const goals = (goalsByMatch.get(fMatchId) || []).map(g => ({
      minute: g.minute_label,
      team: g.team_name,
      player: playerName(g),
      own_goal: g.own_goal === '1',
      penalty: g.penalty === '1',
      home_team: g.home_team === '1',
    }));

    // Bookings
    const bookings = (bookingsByMatch.get(fMatchId) || []).map(b => ({
      minute: b.minute_label,
      team: b.team_name,
      player: playerName(b),
      yellow_card: b.yellow_card === '1',
      red_card: b.red_card === '1',
      second_yellow_card: b.second_yellow_card === '1',
    }));

    // Substitutions: pair going_off / coming_on
    const rawSubs = subsByMatch.get(fMatchId) || [];
    const subsOff = rawSubs.filter(s => s.going_off === '1');
    const subsOn  = rawSubs.filter(s => s.coming_on === '1');
    const usedOn  = new Set();

    const substitutions = subsOff.map(off => {
      const onIdx = subsOn.findIndex((s, idx) =>
        !usedOn.has(idx) &&
        s.team_id === off.team_id &&
        s.minute_regulation === off.minute_regulation
      );
      if (onIdx >= 0) usedOn.add(onIdx);
      const on = onIdx >= 0 ? subsOn[onIdx] : null;
      return {
        minute: off.minute_label,
        team: off.team_name,
        player_off: playerName(off),
        player_on: on ? playerName(on) : '',
        home_team: off.home_team === '1',
      };
    });

    // Penalty kicks
    const penalty_kicks = (pensByMatch.get(fMatchId) || []).map(p => ({
      team: p.team_name,
      player: playerName(p),
      converted: p.converted === '1',
      home_team: p.home_team === '1',
    }));

    // Player appearances — starters and bench
    const rawAppearances = appearsByMatch.get(fMatchId) || [];
    function mapPlayer(a) {
      return {
        number: a.shirt_number,
        player: `${a.given_name !== 'not applicable' ? a.given_name + ' ' : ''}${a.family_name}`.trim(),
        position: a.position_name,
        position_code: a.position_code,
        home_team: a.home_team === '1',
        came_on: a.substitute === '1',
      };
    }
    const starters = rawAppearances.filter(a => a.starter === '1').map(mapPlayer);
    const bench    = rawAppearances.filter(a => a.starter === '0').map(mapPlayer);

    // Referees
    const referees = (refAppsByMatch.get(fMatchId) || []).map(r => ({
      name: `${r.given_name !== 'not applicable' ? r.given_name + ' ' : ''}${r.family_name}`.trim(),
      country: r.country_name,
    }));

    const output = { fjelstul_match_id: fMatchId, goals, bookings, substitutions, penalty_kicks, starters, bench, referees };
    writeFileSync(join(OUTPUT_DIR, `${match.year}-${match.id}.json`), JSON.stringify(output));
    matched++;
  }

  console.log(`\n=== Done ===`);
  console.log(`  Matched & written: ${matched}`);
  console.log(`  Skipped (future or unmatched): ${skipped}`);

  if (unmatched.length > 0) {
    console.log(`\n  Unmatched matches (${unmatched.length}):`);
    for (const u of unmatched) console.log(`    - ${u}`);
  }
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
