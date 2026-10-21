/**
 * Utilitaires de calcul des semaines ISO 8601
 * (la semaine commence le lundi, la semaine 1 contient le 4 janvier).
 *
 * Fichier en .mjs pour être importable à la fois par Vite (front)
 * et par Node (scripts/generate.mjs).
 */

const MS_PER_DAY = 86400000

/**
 * Numéro de semaine ISO et année ISO d'une date.
 * Attention : l'année ISO peut différer de l'année civile
 * (ex. le 1er janvier 2021 appartient à la semaine 53 de 2020).
 * @param {Date} date
 * @returns {{ week: number, year: number }}
 */
export function getISOWeek(date) {
  // Calcul en UTC pour éviter tout décalage lié à l'heure d'été
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  // On se place sur le jeudi de la semaine : il détermine l'année ISO
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const year = d.getUTCFullYear()
  const yearStart = Date.UTC(year, 0, 1)
  const week = Math.ceil(((d - yearStart) / MS_PER_DAY + 1) / 7)
  return { week, year }
}

/**
 * Nombre de semaines ISO d'une année (52 ou 53).
 * Le 28 décembre est toujours dans la dernière semaine ISO de l'année.
 * @param {number} year
 * @returns {number}
 */
export function getISOWeeksInYear(year) {
  return getISOWeek(new Date(year, 11, 28)).week
}

/**
 * Lundi (date locale à minuit) de la semaine ISO `week` de l'année ISO `year`.
 * @param {number} week 1 à 52/53
 * @param {number} year
 * @returns {Date}
 */
export function getISOWeekStart(week, year) {
  const jan4 = new Date(year, 0, 4)
  const monday = new Date(year, 0, 4 - ((jan4.getDay() || 7) - 1))
  monday.setDate(monday.getDate() + (week - 1) * 7)
  return monday
}

/**
 * Lundi et dimanche d'une semaine ISO.
 * @param {number} week
 * @param {number} year
 * @returns {{ start: Date, end: Date }}
 */
export function getISOWeekRange(week, year) {
  const start = getISOWeekStart(week, year)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return { start, end }
}

/**
 * Position (1 à 52) de la semaine d'une date dans la liste des 52 thèmes
 * de l'année civile de cette date.
 * - début janvier appartenant à la dernière semaine ISO de l'année précédente → 1
 * - fin décembre appartenant à la semaine 1 de l'année suivante → 52
 * - semaine 53 → 52 (on n'a que 52 thèmes)
 * @param {Date} date
 * @returns {number}
 */
export function getThemeWeek(date) {
  const { week, year } = getISOWeek(date)
  const calendarYear = date.getFullYear()
  if (year < calendarYear) return 1
  if (year > calendarYear) return 52
  return Math.min(week, 52)
}

/**
 * Convertit une date en tableau [année, mois, jour] attendu par la librairie `ics`.
 * @param {Date} date
 * @returns {[number, number, number]}
 */
export function toDateArray(date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
}
