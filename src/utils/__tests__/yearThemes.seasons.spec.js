// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { buildYear, placeBySeason } from '../yearThemes.mjs'
import { getSeasonWeeks } from '../seasons.mjs'

/** Générateur pseudo-aléatoire reproductible (mulberry32) */
const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const regular = (n) => Array.from({ length: n }, (_, i) => ({ summary: `R${i + 1}` }))
const seasonal = [
  { summary: 'hiver', season: 'hiver' },
  { summary: 'printemps', season: 'printemps' },
  { summary: 'été', season: 'ete' },
  { summary: 'automne', season: 'automne' }
]

describe('placeBySeason', () => {
  it('place chaque thème de saison sur une semaine de sa saison', () => {
    const themes = [...seasonal, ...regular(48)]
    const placed = placeBySeason(themes, 2026, () => 0)
    const weeks = getSeasonWeeks(2026)
    expect(placed).toHaveLength(52)
    expect(placed[weeks.hiver[0] - 1].summary).toBe('hiver')
    expect(placed[weeks.printemps[0] - 1].summary).toBe('printemps')
    expect(placed[weeks.ete[0] - 1].summary).toBe('été')
    expect(placed[weeks.automne[0] - 1].summary).toBe('automne')
  })

  it('remplit les semaines restantes avec les autres thèmes, dans l’ordre', () => {
    const placed = placeBySeason([...seasonal, ...regular(48)], 2026, () => 0)
    const others = placed.filter((t) => !t.season).map((t) => t.summary)
    expect(others).toEqual(regular(48).map((t) => t.summary))
    expect(placed[1].summary).toBe('R1') // la semaine 1 est prise par « hiver »
  })

  it('met deux thèmes de la même saison sur deux semaines différentes', () => {
    const themes = [
      { summary: 'a', season: 'hiver' },
      { summary: 'b', season: 'hiver' },
      ...regular(50)
    ]
    const placed = placeBySeason(themes, 2026, () => 0)
    const weeks = getSeasonWeeks(2026).hiver
    expect(placed[weeks[0] - 1].summary).toBe('a')
    expect(placed[weeks[1] - 1].summary).toBe('b')
  })

  it('sans thème de saison, garde l’ordre d’origine', () => {
    const themes = regular(52)
    expect(placeBySeason(themes, 2026)).toEqual(themes)
  })

  it('signale une saison inconnue', () => {
    const themes = [{ summary: 'x', season: 'printemp' }, ...regular(51)]
    expect(() => placeBySeason(themes, 2026)).toThrow('printemp')
  })
})

describe('buildYear avec des thèmes de saison', () => {
  const pool = [...regular(96), ...seasonal]

  it('place les thèmes de saison tirés au sort sur la bonne saison, pour toute année', () => {
    let placedCount = 0
    for (const year of [2025, 2026, 2027]) {
      const weeks = getSeasonWeeks(year)
      for (let seed = 1; seed <= 100; seed++) {
        const { themes } = buildYear(pool, year, seeded(seed))
        expect(themes).toHaveLength(52)
        expect(new Set(themes.map((t) => t.summary)).size).toBe(52)
        themes.forEach((theme, i) => {
          if (theme.season) {
            placedCount++
            expect(weeks[theme.season], `${year} graine ${seed} semaine ${i + 1}`).toContain(i + 1)
          }
        })
      }
    }
    expect(placedCount).toBeGreaterThan(0) // le test n'est pas vide
  })
})
