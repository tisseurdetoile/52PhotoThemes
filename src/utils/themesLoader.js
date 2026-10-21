/**
 * Charge la liste des thèmes d'une année.
 * Si le fichier de l'année demandée est absent ou invalide (réponse 404, page HTML
 * renvoyée par le serveur de dev, JSON vide…), on essaie les années précédentes.
 *
 * @param {number} year Année souhaitée
 * @param {Object} [options]
 * @param {Function} [options.fetchFn] fonction fetch (injectable pour les tests)
 * @param {number} [options.maxYearsBack] nombre d'années précédentes à essayer
 * @returns {Promise<{ year: number, themes: Array }>} année réellement chargée et ses thèmes
 */
export async function loadThemes(year, { fetchFn = fetch, maxYearsBack = 5 } = {}) {
  for (let y = year; y >= year - maxYearsBack; y--) {
    try {
      const res = await fetchFn(`./${y}.json`, {
        headers: { 'Content-type': 'application/json' }
      })
      if (!res.ok) continue

      const data = JSON.parse(await res.text())
      if (Array.isArray(data) && data.length > 0) {
        return { year: y, themes: data }
      }
    } catch {
      // fichier absent ou JSON invalide : on tente l'année précédente
    }
  }
  throw new Error(`Aucun fichier de thèmes trouvé pour ${year}`)
}
