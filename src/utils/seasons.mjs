import { getISOWeekStart } from './weeks.mjs'

/** Saisons reconnues dans le champ `season` des thèmes (hémisphère nord, saisons astronomiques) */
export const SEASONS = ['hiver', 'printemps', 'ete', 'automne']

/**
 * Saison d'une date (hémisphère nord) :
 * printemps dès le 20 mars, été dès le 21 juin, automne dès le 23 septembre, hiver dès le 21 décembre.
 * @param {Date} date
 * @returns {'hiver'|'printemps'|'ete'|'automne'}
 */
export function getSeason(date) {
  const monthDay = (date.getMonth() + 1) * 100 + date.getDate()
  if (monthDay >= 1221) return 'hiver'
  if (monthDay >= 923) return 'automne'
  if (monthDay >= 621) return 'ete'
  if (monthDay >= 320) return 'printemps'
  return 'hiver'
}

/**
 * Semaines (1 à 52) de chaque saison pour une année donnée.
 * Une semaine appartient à la saison de son jeudi (comme pour l'année ISO).
 * @param {number} year
 * @returns {{ hiver: number[], printemps: number[], ete: number[], automne: number[] }}
 */
export function getSeasonWeeks(year) {
  const weeks = { hiver: [], printemps: [], ete: [], automne: [] }
  for (let week = 1; week <= 52; week++) {
    const monday = getISOWeekStart(week, year)
    const thursday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 3)
    weeks[getSeason(thursday)].push(week)
  }
  return weeks
}
