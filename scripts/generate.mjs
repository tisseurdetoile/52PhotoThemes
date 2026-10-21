/**
 * Génère les thèmes d'une année : <année>.json, <année>.ics et met à jour ndx.json.
 *
 * Usage :
 *   npm run generate                      → année prochaine, dans ./dist
 *   npm run generate -- 2026              → année 2026, dans ./dist
 *   npm run generate -- 2026 --out public → écrit dans ./public (utile en local)
 *   npm run generate -- 2026 --force      → écrase les fichiers existants
 */
import { parseArgs } from 'node:util'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { exit } from 'node:process'
import ics from 'ics'
import { buildYear } from '../src/utils/yearThemes.mjs'

const THEMES_FILE = 'themes.json'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', short: 'o', default: 'dist' },
    force: { type: 'boolean', short: 'f', default: false },
    help: { type: 'boolean', short: 'h', default: false }
  }
})

if (values.help) {
  console.log('Usage : npm run generate -- [année] [--out <dossier>] [--force]')
  exit(0)
}

// Année en paramètre (une valeur vide, ex. depuis un workflow, donne l'année prochaine)
const rawYear = positionals[0] || String(new Date().getFullYear() + 1)
if (!/^\d{4}$/.test(rawYear)) {
  console.error(`Année invalide : "${rawYear}" (attendu : 4 chiffres, ex. 2026)`)
  exit(1)
}
const year = Number(rawYear)

const outDir = values.out
const icsFileName = join(outDir, `${year}.ics`)
const jsonFileName = join(outDir, `${year}.json`)
const ndxFileName = join(outDir, 'ndx.json')

if (!existsSync(THEMES_FILE)) {
  console.error(`Fichier ${THEMES_FILE} introuvable (à lancer depuis la racine du projet)`)
  exit(1)
}

if (!values.force && (existsSync(icsFileName) || existsSync(jsonFileName))) {
  console.error(`Les fichiers de ${year} existent déjà dans ${outDir} (utiliser --force pour les écraser)`)
  exit(5)
}

const allThemes = JSON.parse(readFileSync(THEMES_FILE, 'utf8'))
const { themes, events } = buildYear(allThemes, year)

const { error, value: icsData } = ics.createEvents(events)
if (error) {
  console.error(error)
  exit(1)
}

// Index des années disponibles
const ndx = existsSync(ndxFileName) ? JSON.parse(readFileSync(ndxFileName, 'utf8')) : []
const years = [...new Set([...ndx, year])].sort((a, b) => a - b)

mkdirSync(outDir, { recursive: true })
writeFileSync(jsonFileName, JSON.stringify(themes))
writeFileSync(icsFileName, icsData)
writeFileSync(ndxFileName, JSON.stringify(years))

console.log(`${jsonFileName}\n${icsFileName}\n${ndxFileName}`)
