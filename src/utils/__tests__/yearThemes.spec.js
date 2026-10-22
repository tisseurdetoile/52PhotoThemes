// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { shuffle, normalizeTheme, buildYear, THEMES_PER_YEAR } from '../yearThemes.mjs'

const makeThemes = (n) => Array.from({ length: n }, (_, i) => ({ summary: `T${i + 1}`, description: `D${i + 1}` }))

describe('shuffle', () => {
  it('conserve les mêmes éléments sans modifier le tableau source', () => {
    const source = [1, 2, 3, 4, 5, 6]
    const result = shuffle(source)
    expect(result).not.toBe(source)
    expect([...result].sort()).toEqual(source)
    expect(source).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('est déterministe avec un générateur fixé', () => {
    expect(shuffle([1, 2, 3, 4], () => 0)).toEqual(shuffle([1, 2, 3, 4], () => 0))
  })
})

describe('normalizeTheme', () => {
  it('transforme une chaîne en { summary, description }', () => {
    expect(normalizeTheme('Rouge')).toEqual({ summary: 'Rouge', description: 'Rouge' })
  })

  it('conserve un objet et complète la description manquante', () => {
    expect(normalizeTheme({ summary: 'Rond', description: 'autre' })).toEqual({
      summary: 'Rond',
      description: 'autre'
    })
    expect(normalizeTheme({ summary: 'Rond' })).toEqual({ summary: 'Rond', description: 'Rond' })
  })
})

describe('buildYear', () => {
  it(`refuse un réservoir de moins de ${THEMES_PER_YEAR} thèmes`, () => {
    expect(() => buildYear(makeThemes(51), 2027)).toThrow('52')
  })

  it('renvoie 52 thèmes distincts et 2 évènements par thème', () => {
    const { themes, events } = buildYear(makeThemes(80), 2027)
    expect(themes).toHaveLength(52)
    expect(new Set(themes.map((t) => t.summary)).size).toBe(52)
    expect(events).toHaveLength(104)
  })

  it('accepte des thèmes sous forme de chaînes', () => {
    const strings = Array.from({ length: 52 }, (_, i) => `S${i + 1}`)
    const { themes } = buildYear(strings, 2027, () => 0)
    expect(themes.every((t) => typeof t.summary === 'string' && t.description === t.summary)).toBe(true)
  })

  it('place chaque thème sur sa semaine ISO, du lundi au dimanche', () => {
    const { events } = buildYear(makeThemes(52), 2027, () => 0)
    // 2027 : la semaine 1 commence le lundi 4 janvier
    expect(events[0].start).toEqual([2027, 1, 4])
    expect(events[0].title).toMatch(/^Theme: /)
    expect(events[1].start).toEqual([2027, 1, 10])
    expect(events[1].title).toMatch(/^FIN Theme: /)
    // semaine 52 : du lundi 27 décembre 2027 au dimanche 2 janvier 2028
    expect(events[102].start).toEqual([2027, 12, 27])
    expect(events[103].start).toEqual([2028, 1, 2])
  })

  it("gère une année dont la semaine 1 commence en décembre de l'année précédente", () => {
    // 2026 : la semaine 1 commence le lundi 29 décembre 2025
    const { events } = buildYear(makeThemes(52), 2026, () => 0)
    expect(events[0].start).toEqual([2025, 12, 29])
    expect(events[1].start).toEqual([2026, 1, 4])
  })

  it('ajoute une semaine bonus (semaine 53) les années ISO à 53 semaines', () => {
    const { themes, events } = buildYear(makeThemes(52), 2026, () => 0)
    expect(themes).toHaveLength(52) // pas de 53e thème
    expect(events).toHaveLength(106)
    // semaine 53 de 2026 : du lundi 28 décembre 2026 au dimanche 3 janvier 2027
    expect(events[104].start).toEqual([2026, 12, 28])
    expect(events[104].title).toBe('Semaine bonus : thème libre')
    expect(events[105].start).toEqual([2027, 1, 3])
    expect(events[105].title).toBe('FIN Semaine bonus : thème libre')
  })

  it("n'ajoute pas de semaine bonus les années ISO à 52 semaines", () => {
    const { events } = buildYear(makeThemes(52), 2027, () => 0)
    expect(events).toHaveLength(104)
    expect(events.some((e) => e.title.includes('bonus'))).toBe(false)
  })
})
