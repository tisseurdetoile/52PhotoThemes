// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'
import { loadThemes } from '../themesLoader.js'

const themes = [{ summary: 'Rouge', description: 'Rouge' }]

/** Fabrique un faux fetch à partir d'une table { url: réponse } */
const fakeFetch = (responses) =>
  vi.fn(async (url) => {
    const r = responses[url]
    if (!r) return { ok: false, status: 404, text: async () => '' }
    return { ok: true, status: 200, text: async () => r }
  })

describe('loadThemes', () => {
  it("charge le fichier de l'année demandée quand il existe", async () => {
    const fetchFn = fakeFetch({ './2026.json': JSON.stringify(themes) })
    await expect(loadThemes(2026, { fetchFn })).resolves.toEqual({ year: 2026, themes })
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it("se rabat sur l'année précédente la plus récente disponible", async () => {
    const fetchFn = fakeFetch({ './2023.json': JSON.stringify(themes) })
    await expect(loadThemes(2026, { fetchFn })).resolves.toEqual({ year: 2023, themes })
  })

  it('ignore une réponse vide (end of data) ou une page HTML renvoyée à la place du JSON', async () => {
    const fetchFn = fakeFetch({
      './2026.json': '',
      './2025.json': '<!DOCTYPE html><html></html>',
      './2024.json': '[]',
      './2023.json': JSON.stringify(themes)
    })
    await expect(loadThemes(2026, { fetchFn })).resolves.toEqual({ year: 2023, themes })
  })

  it("ignore un fetch qui échoue (réseau) et continue avec l'année précédente", async () => {
    const fetchFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify(themes) })
    await expect(loadThemes(2026, { fetchFn })).resolves.toEqual({ year: 2025, themes })
  })

  it('lève une erreur si aucune année ne convient', async () => {
    const fetchFn = fakeFetch({})
    await expect(loadThemes(2026, { fetchFn, maxYearsBack: 2 })).rejects.toThrow('2026')
    expect(fetchFn).toHaveBeenCalledTimes(3) // 2026, 2025, 2024
  })
})
