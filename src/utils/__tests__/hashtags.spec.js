// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { yearHashtag, toHashtag, buildHashtags } from '../hashtags.js'

describe('yearHashtag', () => {
  it("construit le hashtag de l'année", () => {
    expect(yearHashtag(2026)).toBe('#tdt2026p52')
  })
})

describe('toHashtag', () => {
  it.each([
    ['Rouge', '#rouge'],
    ['Éclairage naturel', '#eclairagenaturel'],
    ["N'importe quoi", '#nimportequoi'],
    ['Reflets & ombres', '#refletsombres'],
    ['  Noir-et-blanc  ', '#noiretblanc'],
    ['Cœur', '#coeur'],
    ['Où êtes-vous ?', '#ouetesvous'],
    ['3 couleurs', '#3couleurs'],
    ['ÇA VA', '#cava']
  ])('« %s » → %s', (input, expected) => {
    expect(toHashtag(input)).toBe(expected)
  })

  it('renvoie une chaîne vide quand rien ne reste', () => {
    expect(toHashtag('')).toBe('')
    expect(toHashtag('   ')).toBe('')
    expect(toHashtag('?!')).toBe('')
    expect(toHashtag(undefined)).toBe('')
  })
})

describe('buildHashtags', () => {
  it("met le hashtag de l'année puis celui du thème", () => {
    expect(buildHashtags(2026, 'Rouge vif')).toBe('#tdt2026p52 #rougevif')
  })

  it("ne garde que le hashtag de l'année si le titre ne donne rien", () => {
    expect(buildHashtags(2026, '?!')).toBe('#tdt2026p52')
  })
})
