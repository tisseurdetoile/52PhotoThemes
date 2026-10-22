import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ThemesDisplay from '../ThemesDisplay.vue'
import { getISOWeek } from '../../utils/weeks.mjs'

const themes = Array.from({ length: 52 }, (_, i) => ({
  summary: `Theme ${i + 1}`,
  description: `Description ${i + 1}`
}))

// L'année du projet est l'année ISO de la date (la semaine 1 peut commencer fin décembre)
const factory = (today, year = getISOWeek(today).year) =>
  mount(ThemesDisplay, { props: { themes, year, today } })

/** Texte de la semaine et du thème mis en avant */
const current = (wrapper) => ({
  week: wrapper.get('[data-test="week-number"]').text(),
  theme: wrapper.get('[data-test="theme"]').text()
})

describe('ThemesDisplay', () => {
  it("affiche le titre avec l'année", () => {
    const wrapper = factory(new Date(2026, 9, 21))
    expect(wrapper.find('h1').text()).toContain('2026')
  })

  it('affiche les 52 thèmes dans la liste', () => {
    const wrapper = factory(new Date(2026, 9, 21))
    expect(wrapper.findAll('.themes li')).toHaveLength(52)
  })

  it('affiche la semaine et le thème courants', () => {
    const wrapper = factory(new Date(2026, 9, 21)) // mercredi, semaine ISO 43
    expect(current(wrapper)).toEqual({ week: 'Semaine 43', theme: 'Theme 43' })
  })

  it('bascule de thème le lundi (et pas le dimanche)', () => {
    expect(current(factory(new Date(2026, 9, 18))).week).toBe('Semaine 42')
    expect(current(factory(new Date(2026, 9, 19))).week).toBe('Semaine 43')
  })

  it("rattache fin décembre à la semaine 1 de l'année ISO suivante", () => {
    const wrapper = factory(new Date(2025, 11, 29)) // lundi : début de la semaine 1 de 2026
    expect(current(wrapper)).toEqual({ week: 'Semaine 1', theme: 'Theme 1' })
    expect(wrapper.find('h1').text()).toContain('2026')
    expect(wrapper.get('code').text()).toBe('#tdt2026p52')
  })

  it("garde l'année ISO précédente pour les premiers jours de janvier de la semaine 53", () => {
    const wrapper = factory(new Date(2021, 0, 3)) // dimanche : semaine 53 de 2020
    expect(wrapper.find('h1').text()).toContain('2020')
    expect(current(wrapper).week).toBe('Semaine 53')
  })

  it('affiche une semaine bonus en semaine 53 (année à 53 semaines)', () => {
    const wrapper = factory(new Date(2026, 11, 31)) // jeudi : semaine 53 de 2026
    expect(current(wrapper)).toEqual({
      week: 'Semaine 53',
      theme: 'Semaine bonus : thème libre'
    })
    // les 52 thèmes sont passés : tout est dans le bloc replié, rien à venir
    expect(wrapper.get('[data-test="past-themes"]').findAll('li')).toHaveLength(52)
    expect(wrapper.findAll('.themes > ul')).toHaveLength(0)
  })

  it('revient au thème 1 dès le lundi de la semaine 1 suivante', () => {
    const wrapper = factory(new Date(2027, 0, 4))
    expect(current(wrapper)).toEqual({ week: 'Semaine 1', theme: 'Theme 1' })
    expect(wrapper.find('h1').text()).toContain('2027')
  })

  it("n'affiche pas de semaine courante quand il n'y a aucun thème", () => {
    const wrapper = mount(ThemesDisplay, {
      props: { themes: [], year: 2026, today: new Date(2026, 9, 21) }
    })
    expect(wrapper.find('[data-test="current-week"]').exists()).toBe(false)
  })

  it('met en évidence la semaine courante dans la liste', () => {
    const wrapper = factory(new Date(2026, 9, 21))
    const currentItems = wrapper.findAll('.themes li.is-current')
    expect(currentItems).toHaveLength(1)
    expect(currentItems[0].get('.name').text()).toBe('Theme 43')
  })

  it('marque les semaines passées', () => {
    const wrapper = factory(new Date(2026, 9, 21))
    expect(wrapper.findAll('.themes li.is-past')).toHaveLength(42)
  })

  it('regroupe les semaines passées dans un bloc replié par défaut', () => {
    const wrapper = factory(new Date(2026, 9, 21)) // semaine 43 → 42 semaines passées
    const past = wrapper.get('[data-test="past-themes"]')
    expect(past.element.tagName).toBe('DETAILS')
    expect(past.attributes('open')).toBeUndefined()
    expect(past.get('summary').text()).toContain('Semaines précédentes')
    expect(past.get('summary').text()).toContain('42')
    expect(past.findAll('li')).toHaveLength(42)
  })

  it('ne met dans le regroupement que les semaines passées, dans l’ordre', () => {
    const wrapper = factory(new Date(2026, 9, 21))
    const numbers = wrapper
      .get('[data-test="past-themes"]')
      .findAll('.num')
      .map((n) => n.text())
    expect(numbers[0]).toBe('1')
    expect(numbers[numbers.length - 1]).toBe('42')
  })

  it('affiche la semaine courante puis les semaines à venir hors du regroupement', () => {
    const wrapper = factory(new Date(2026, 9, 21))
    const visible = wrapper.findAll('.themes > ul > li')
    expect(visible).toHaveLength(10) // semaines 43 à 52
    expect(visible[0].classes()).toContain('is-current')
    expect(visible[0].get('.num').text()).toBe('43')
    expect(visible[9].get('.num').text()).toBe('52')
  })

  it("n'affiche pas de regroupement en première semaine de l'année", () => {
    const wrapper = factory(new Date(2026, 0, 1)) // semaine 1
    expect(wrapper.find('[data-test="past-themes"]').exists()).toBe(false)
    expect(wrapper.findAll('.themes > ul > li')).toHaveLength(52)
  })

  it("affiche le tag à utiliser pour l'année", () => {
    const wrapper = factory(new Date(2026, 9, 21))
    expect(wrapper.get('code').text()).toBe('#tdt2026p52')
  })

  it("pointe le lien d'agenda vers le fichier .ics de l'année", async () => {
    const wrapper = factory(new Date(2026, 9, 21))
    await wrapper.vm.$nextTick()
    const link = wrapper.findAll('a').find((a) => a.text().includes('agenda'))
    expect(link.attributes('href')).toBe('./2026.ics')
  })
})

describe('ThemesDisplay - copie des hashtags', () => {
  const writeText = vi.fn()

  beforeEach(() => {
    writeText.mockReset()
    writeText.mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('rend chaque thème cliquable via un bouton', () => {
    const wrapper = factory(new Date(2026, 9, 21))
    expect(wrapper.findAll('.themes li button')).toHaveLength(52)
  })

  it("copie le hashtag de l'année puis celui du thème au clic", async () => {
    const wrapper = factory(new Date(2026, 9, 21))
    await wrapper.get('.themes > ul > li.is-current button').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText).toHaveBeenCalledWith('#tdt2026p52 #theme43 #52photos')
  })

  it('fonctionne aussi pour un thème déjà passé (bloc replié)', async () => {
    const wrapper = factory(new Date(2026, 9, 21))
    await wrapper.get('[data-test="past-themes"] li button').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith('#tdt2026p52 #theme1 #52photos')
  })

  it('utilise l’année affichée et normalise le titre (accents, espaces)', async () => {
    const custom = themes.map((t, i) => (i === 42 ? { ...t, summary: 'Éclairage naturel' } : t))
    const wrapper = mount(ThemesDisplay, {
      props: { themes: custom, year: 2023, today: new Date(2026, 9, 21) }
    })
    await wrapper.get('.themes > ul > li.is-current button').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith('#tdt2023p52 #eclairagenaturel #52photos')
  })

  it('confirme la copie avec un message', async () => {
    const wrapper = factory(new Date(2026, 9, 21))
    expect(wrapper.find('[data-test="toast"]').exists()).toBe(false)
    await wrapper.get('.themes > ul > li.is-current button').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-test="toast"]').text()).toBe('Copié : #tdt2026p52 #theme43 #52photos')
  })

  it('fait disparaître le message après quelques secondes', async () => {
    vi.useFakeTimers()
    const wrapper = factory(new Date(2026, 9, 21))
    await wrapper.get('.themes > ul > li.is-current button').trigger('click')
    await vi.advanceTimersByTimeAsync(0)
    expect(wrapper.find('[data-test="toast"]').exists()).toBe(true)
    await vi.advanceTimersByTimeAsync(3000)
    expect(wrapper.find('[data-test="toast"]').exists()).toBe(false)
  })

  it('signale un échec de copie', async () => {
    writeText.mockRejectedValue(new Error('refusé'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = factory(new Date(2026, 9, 21))
    await wrapper.get('.themes > ul > li.is-current button').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-test="toast"]').text()).toBe('Copie impossible')
    errorSpy.mockRestore()
  })
})
