import { getISOWeekRange, toDateArray } from './weeks.mjs'

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
 * Un thème peut être une simple chaîne ou un objet { summary, description }.
 * @param {string|{summary: string, description?: string}} theme
 * @returns {{summary: string, description: string}}
 */
export function normalizeTheme(theme) {
  if (theme !== null && typeof theme === 'object') {
    return { ...theme, description: theme.description ?? theme.summary }
  }
  return { summary: theme, description: theme }
}

/**
 * Tire 52 thèmes au sort et construit les données d'une année :
 * - `themes` : la liste affichée par l'application (thème i → semaine ISO i + 1)
 * - `events` : les évènements agenda (début le lundi, fin le dimanche de chaque semaine)
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

  const themes = shuffle(allThemes, random).slice(0, THEMES_PER_YEAR).map(normalizeTheme)

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
