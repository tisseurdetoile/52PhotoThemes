// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { SEASONS, getSeason, getSeasonWeeks } from '../seasons.mjs'

describe('getSeason', () => {
  it.each([
    [[2026, 0, 1], 'hiver'],
    [[2026, 2, 19], 'hiver'],
    [[2026, 2, 20], 'printemps'],
    [[2026, 5, 20], 'printemps'],
    [[2026, 5, 21], 'ete'],
    [[2026, 8, 22], 'ete'],
    [[2026, 8, 23], 'automne'],
    [[2026, 11, 20], 'automne'],
    [[2026, 11, 21], 'hiver'],
    [[2026, 11, 31], 'hiver']
  ])('%j → %s', (ymd, expected) => {
    expect(getSeason(new Date(...ymd))).toBe(expected)
  })
})

describe('getSeasonWeeks', () => {
  it.each([2024, 2025, 2026, 2027])('répartit les 52 semaines de %i sans doublon', (year) => {
    const weeks = getSeasonWeeks(year)
    const all = SEASONS.flatMap((season) => weeks[season])
    expect(all.sort((a, b) => a - b)).toEqual(Array.from({ length: 52 }, (_, i) => i + 1))
    SEASONS.forEach((season) => expect(weeks[season].length).toBeGreaterThan(0))
  })

  it('classe les semaines 2026 selon leur jeudi', () => {
    const weeks = getSeasonWeeks(2026)
    expect(weeks.hiver).toContain(1) // jeudi 1er janvier
    expect(weeks.hiver).toContain(52) // jeudi 24 décembre
    expect(weeks.hiver).not.toContain(51) // jeudi 17 décembre : encore l'automne
    expect(weeks.printemps).toContain(20)
    expect(weeks.ete).toContain(30)
    expect(weeks.automne).toContain(40)
  })
})
