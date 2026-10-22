import { getISOWeekRange, toDateArray } from './weeks.mjs'
import { SEASONS, getSeasonWeeks } from './seasons.mjs'

/** Nombre de thèmes (= de semaines) d'une année du projet photo 52 */
export const THEMES_PER_YEAR = 52

/**
 * Mélange (Fisher-Yates) une copie du tableau.
 * @param {Array} array
 * @param {() => number} [random] générateur dans [0, 1[ (injectable pour les tests)
 * @returns {Array}
 */
export function shuffle(array, random = Math.random) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Un thème peut être une simple chaîne ou un objet { summary, description, season }.
 * `season` (optionnel : hiver, printemps, ete, automne) impose la saison du thème.
 * @param {string|{summary: string, description?: string, season?: string}} theme
 * @returns {{summary: string, description: string, season?: string}}
 */
export function normalizeTheme(theme) {
  if (theme !== null && typeof theme === 'object') {
    return { ...theme, description: theme.description ?? theme.summary }
  }
  return { summary: theme, description: theme }
}

/**
 * Répartit les thèmes sur les 52 semaines : un thème avec une saison est placé sur une semaine
 * libre de cette saison (au hasard), les autres remplissent les semaines restantes dans l'ordre.
 *
 * @param {Array<{summary: string, season?: string}>} themes 52 thèmes normalisés
 * @param {number} year
 * @param {() => number} random
 * @returns {Array} 52 thèmes, le thème i étant celui de la semaine i + 1
 */
export function placeBySeason(themes, year, random = Math.random) {
  const seasonWeeks = getSeasonWeeks(year)
  const slots = new Array(themes.length).fill(null)
  const regular = []

  for (const theme of themes) {
    if (!theme.season) {
      regular.push(theme)
      continue
    }
    if (!SEASONS.includes(theme.season)) {
      throw new Error(
        `Saison inconnue pour "${theme.summary}" : "${theme.season}" (attendu : ${SEASONS.join(', ')})`
      )
    }
    const free = seasonWeeks[theme.season].filter((week) => slots[week - 1] === null)
    if (free.length === 0) {
      regular.push(theme) // plus de semaine libre dans cette saison
      continue
    }
    slots[free[Math.floor(random() * free.length)] - 1] = theme
  }

  let next = 0
  return slots.map((slot) => slot ?? regular[next++])
}

/**
 * Tire 52 thèmes au sort et construit les données d'une année :
 * - `themes` : la liste affichée par l'application (thème i → semaine ISO i + 1)
 * - `events` : les évènements agenda (début le lundi, fin le dimanche de chaque semaine)
 *
 * Les thèmes qui ont une saison (champ `season`) tombés au tirage sont placés sur une semaine
 * de cette saison.
 *
 * @param {Array} allThemes réservoir de thèmes (au moins 52)
 * @param {number} year
 * @param {() => number} [random]
 * @returns {{ themes: Array, events: Array }}
 */
export function buildYear(allThemes, year, random = Math.random) {
  if (allThemes.length < THEMES_PER_YEAR) {
    throw new Error(
      `Il faut au moins ${THEMES_PER_YEAR} thèmes (${allThemes.length} disponibles)`
    )
  }

  const drawn = shuffle(allThemes, random).slice(0, THEMES_PER_YEAR).map(normalizeTheme)
  const themes = placeBySeason(drawn, year, random)

  const events = themes.flatMap((theme, i) => {
    const { start, end } = getISOWeekRange(i + 1, year)
    const first = {
      start: toDateArray(start),
      title: `Theme: ${theme.summary}`,
      description: `Theme: ${theme.description}`,
      status: 'CONFIRMED',
      busyStatus: 'FREE'
    }
    const last = { ...first, start: toDateArray(end), title: `FIN Theme: ${theme.summary}` }
    return [first, last]
  })

  return { themes, events }
}
