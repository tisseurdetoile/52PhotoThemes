/**
 * Copie un texte dans le presse-papier.
 * Utilise l'API Clipboard (contexte sécurisé : https ou localhost) et, à défaut,
 * un repli via un champ texte temporaire.
 *
 * @param {string} text
 * @returns {Promise<void>} rejette si la copie est impossible
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.appendChild(field)
  field.select()
  try {
    if (!document.execCommand('copy')) {
      throw new Error('La copie dans le presse-papier a échoué')
    }
  } finally {
    field.remove()
  }
}
