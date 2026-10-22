/**
 * Hashtags Instagram des thèmes.
 */

/**
 * Hashtag de l'année du projet (ex. « #tdt2026p52 »).
 * @param {number} year
 * @returns {string}
 */
export function yearHashtag(year) {
  return `#tdt${year}p52`
}

/**
 * Transforme un titre de thème en hashtag : minuscules, sans accents,
 * sans espaces ni ponctuation (ex. « Éclairage naturel » → « #eclairagenaturel »).
 * Renvoie une chaîne vide si rien d'exploitable ne reste.
 * @param {string} text
 * @returns {string}
 */
export function toHashtag(text) {
  const slug = String(text ?? '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
  return slug ? `#${slug}` : ''
}

/**
 * Hashtags à copier pour un thème : celui de l'année puis celui du titre du thème.
 * @param {number} year
 * @param {string} summary titre du thème
 * @param {string[]} additionalHashtags hashtags supplémentaires
 * @returns {string} ex. « #tdt2026p52 #rouge »
 */
export function buildHashtags(year, summary, additionalHashtags = []) {
  return [yearHashtag(year), toHashtag(summary), ...additionalHashtags].filter(Boolean).join(' ')
}
