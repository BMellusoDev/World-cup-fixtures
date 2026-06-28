import { WORLD_CUPS } from '../src/data/worldcups.js';

function isValidTimeZone(value) {
  try {
    Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

const issues = [];

for (const worldCup of WORLD_CUPS) {
  const timedMatches = (worldCup.matches || []).filter((match) => /^\d{2}:\d{2}$/.test(String(match.time || '').trim()));
  if (!timedMatches.length) continue;

  if (!worldCup.sourceTimeZone) {
    issues.push(`World Cup ${worldCup.year} has timed matches but no sourceTimeZone metadata.`);
    continue;
  }

  if (!isValidTimeZone(worldCup.sourceTimeZone)) {
    issues.push(`World Cup ${worldCup.year} declares invalid sourceTimeZone: ${worldCup.sourceTimeZone}`);
  }
}

if (issues.length) {
  console.error('Fixture timezone validation failed:');
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log('Fixture timezone validation passed.');
