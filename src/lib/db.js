import { WORLD_CUPS } from '../data/worldcups.js';

export class FifaDB {
  constructor() {
    this.worldcups = WORLD_CUPS;
  }

  getWorldCups() {
    return [...this.worldcups].sort((a, b) => b.year - a.year);
  }

  getWorldCup(year) {
    const normalizedYear = String(year).trim();
    return this.worldcups.find((wc) => String(wc.year) === normalizedYear);
  }

  generateUpcomingMatches(year) {
    return this.getWorldCup(year);
  }
}

export const db = new FifaDB();