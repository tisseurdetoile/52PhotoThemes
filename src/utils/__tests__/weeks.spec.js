// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  getISOWeek,
  getISOWeeksInYear,
  getISOWeekStart,
  getISOWeekRange,
  toDateArray
} from '../weeks.mjs'

/** Formate une date locale en YYYY-MM-DD (évite les pièges de toISOString / fuseau horaire) */
const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

describe('getISOWeek', () => {
  it.each([
    // [date (y, m0, d), semaine, année ISO]
    [[2026, 0, 1], 1, 2026], // jeudi 1er janvier → semaine 1
    [[2025, 11, 29], 1, 2026], // lundi 29/12/2025 appartient à la semaine 1 de 2026
    [[2026, 9, 21], 43, 2026], // mercredi
    [[2026, 9, 18], 42, 2026], // dimanche : dernier jour de la semaine 42
    [[2026, 9, 19], 43, 2026], // lundi : premier jour de la semaine 43
    [[2020, 11, 31], 53, 2020], // année à 53 semaines
    [[2021, 0, 3], 53, 2020], // dimanche 3 janvier 2021 → encore semaine 53 de 2020
    [[2021, 0, 4], 1, 2021],
    [[2024, 11, 30], 1, 2025], // fin décembre → semaine 1 de l'année suivante
    [[2023, 0, 1], 52, 2022], // dimanche 1er janvier 2023 → semaine 52 de 2022
    [[2023, 0, 2], 1, 2023],
    [[2026, 2, 29], 13, 2026], // jour du passage à l'heure d'été (Europe)
    [[2026, 2, 30], 14, 2026],
    [[2026, 9, 25], 43, 2026], // dimanche du passage à l'heure d'hiver (Europe)
    [[2026, 9, 26], 44, 2026]
  ])('%j → semaine %i de %i', (ymd, week, year) => {
    expect(getISOWeek(new Date(...ymd))).toEqual({ week, year })
  })

  it("ne tient pas compte de l'heure de la journée", () => {
    expect(getISOWeek(new Date(2026, 9, 18, 23, 59, 59))).toEqual({ week: 42, year: 2026 })
    expect(getISOWeek(new Date(2026, 9, 19, 0, 0, 1))).toEqual({ week: 43, year: 2026 })
  })

  it('ne modifie pas la date passée en paramètre', () => {
    const date = new Date(2026, 9, 21, 10, 30)
    const copy = new Date(date)
    getISOWeek(date)
    expect(date.getTime()).toBe(copy.getTime())
  })
})

describe('getISOWeeksInYear', () => {
  it.each([
    [2015, 53],
    [2020, 53],
    [2021, 52],
    [2024, 52],
    [2025, 52],
    [2026, 53]
  ])('%i a %i semaines', (year, expected) => {
    expect(getISOWeeksInYear(year)).toBe(expected)
  })
})

describe('getISOWeekStart', () => {
  it.each([
    [1, 2026, '2025-12-29'],
    [1, 2025, '2024-12-30'],
    [1, 2023, '2023-01-02'],
    [1, 2022, '2022-01-03'],
    [1, 2021, '2021-01-04'],
    [1, 2020, '2019-12-30'],
    [43, 2026, '2026-10-19'],
    [52, 2026, '2026-12-21'],
    [53, 2020, '2020-12-28']
  ])('semaine %i de %i commence le %s', (week, year, expected) => {
    expect(fmt(getISOWeekStart(week, year))).toBe(expected)
  })

  it('renvoie toujours un lundi à minuit (heure locale)', () => {
    for (let year = 2000; year <= 2040; year++) {
      const monday = getISOWeekStart(1, year)
      expect(monday.getDay()).toBe(1)
      expect(monday.getHours()).toBe(0)
    }
  })

  it('est cohérent avec getISOWeek pour toutes les semaines de 2000 à 2040', () => {
    for (let year = 2000; year <= 2040; year++) {
      for (let week = 1; week <= getISOWeeksInYear(year); week++) {
        const start = getISOWeekStart(week, year)
        expect(getISOWeek(start), `${year} S${week}`).toEqual({ week, year })
      }
    }
  })
})

describe('getISOWeekRange', () => {
  it('renvoie le lundi et le dimanche de la semaine', () => {
    const { start, end } = getISOWeekRange(43, 2026)
    expect(fmt(start)).toBe('2026-10-19')
    expect(fmt(end)).toBe('2026-10-25')
    expect(start.getDay()).toBe(1)
    expect(end.getDay()).toBe(0)
  })

  it('couvre bien 7 jours à travers un changement d’année', () => {
    const { start, end } = getISOWeekRange(1, 2026)
    expect(fmt(start)).toBe('2025-12-29')
    expect(fmt(end)).toBe('2026-01-04')
  })

  it('les 52 semaines générées se suivent sans trou ni chevauchement', () => {
    for (const year of [2024, 2025, 2026, 2027]) {
      let previousEnd = null
      for (let week = 1; week <= 52; week++) {
        const { start, end } = getISOWeekRange(week, year)
        if (previousEnd) {
          const nextDay = new Date(previousEnd)
          nextDay.setDate(nextDay.getDate() + 1)
          expect(fmt(start), `${year} S${week}`).toBe(fmt(nextDay))
        }
        previousEnd = end
      }
    }
  })
})

describe('toDateArray', () => {
  it('renvoie [année, mois (1-12), jour]', () => {
    expect(toDateArray(new Date(2026, 0, 5))).toEqual([2026, 1, 5])
    expect(toDateArray(new Date(2026, 11, 31))).toEqual([2026, 12, 31])
  })
})
