import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemesDisplay from '../ThemesDisplay.vue'

const themes = Array.from({ length: 52 }, (_, i) => ({
  summary: `Theme ${i + 1}`,
  description: `Description ${i + 1}`
}))

const factory = (today, year = today.getFullYear()) =>
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

  it("utilise le thème 1 pour les premiers jours de l'année rattachés à la semaine 53 précédente", () => {
    const wrapper = factory(new Date(2021, 0, 3))
    expect(current(wrapper)).toEqual({ week: 'Semaine 1', theme: 'Theme 1' })
  })

  it("ne plante pas lors d'une année à 53 semaines (utilise le thème 52)", () => {
    const wrapper = factory(new Date(2026, 11, 31))
    expect(current(wrapper)).toEqual({ week: 'Semaine 52', theme: 'Theme 52' })
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
