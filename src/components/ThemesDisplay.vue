<template>
  <div class="page">
    <header class="hero">
      <p class="eyebrow">Projet photo 52</p>
      <h1>Thèmes pour une photo par semaine en {{ year }}</h1>
    </header>

    <section v-if="currentTheme" class="current" data-test="current-week">
      <p class="current__label" data-test="week-number">Semaine {{ getWeekNumber }}</p>
      <p class="current__theme" data-test="theme">{{ currentTheme.summary }}</p>
    </section>

    <p class="intro">
      Pour une explication rapide de ce qu'est un projet photo 52, vous pouvez consulter l'article
      <a
        href="https://phototrend.fr/2015/03/mp-130-realiser-un-projet-photo-52/"
        target="_blank"
        rel="noopener"
        >sur phototrend</a
      >.
    </p>

    <section class="themes">
      <h2>Liste des thèmes</h2>

      <details v-if="pastEntries.length > 0" class="past" data-test="past-themes">
        <summary>
          Semaines précédentes
          <span class="count">{{ pastEntries.length }}</span>
        </summary>
        <ul>
          <li
            v-for="entry in pastEntries"
            :key="entry.number"
            :title="entry.item.description"
            class="is-past"
          >
            <span class="num">{{ entry.number }}</span>
            <span class="name">{{ entry.item.summary }}</span>
          </li>
        </ul>
      </details>

      <ul>
        <li
          v-for="entry in upcomingEntries"
          :key="entry.number"
          :title="entry.item.description"
          :class="{ 'is-current': entry.number === getWeekNumber }"
        >
          <span class="num">{{ entry.number }}</span>
          <span class="name">{{ entry.item.summary }}</span>
        </li>
      </ul>
    </section>

    <p class="hashtag">
      Si vous publiez vos photos, merci d'utiliser le tag <code>#tdt{{ year }}p52</code>
    </p>

    <p class="actions">
      <a class="button" :href="icsUrl" target="_blank" rel="noopener">Ajouter à votre agenda</a>
    </p>

    <footer class="footer">
      <span>
        Construit avec
        <a href="https://vuejs.org" target="_blank" rel="noopener">vuejs</a>
      </span>
      <span aria-hidden="true">·</span>
      <a href="http://www.tisseurdetoile.net" target="_blank" rel="noopener"
        >© Le TisseurDeToile</a
      >
    </footer>
  </div>
</template>

<script>
import { getThemeWeek } from '../utils/weeks.mjs'

export default {
  name: 'ThemesDisplay',
  props: {
    year: Number,
    themes: Array,
    // Date de référence (injectable pour les tests)
    today: {
      type: Date,
      default: () => new Date()
    }
  },
  computed: {
    icsUrl() {
      return `./${this.year}.ics`
    },
    // Position (1 à 52) de la semaine courante dans la liste des thèmes
    getWeekNumber() {
      return getThemeWeek(this.today)
    },
    currentTheme() {
      return this.themes[this.getWeekNumber - 1]
    },
    // Thèmes des semaines déjà passées (regroupés dans un bloc replié)
    pastEntries() {
      return this.themes
        .slice(0, this.getWeekNumber - 1)
        .map((item, index) => ({ item, number: index + 1 }))
    },
    // Semaine courante et semaines à venir
    upcomingEntries() {
      const first = this.getWeekNumber - 1
      return this.themes.slice(first).map((item, index) => ({ item, number: first + index + 1 }))
    }
  }
}
</script>

<style scoped>
.page {
  max-width: 62rem;
  margin: 0 auto;
  padding: 3.5rem 1.25rem 3rem;
  text-align: center;
}

/* --- En-tête ---------------------------------------------------- */
.eyebrow {
  margin: 0 0 0.5rem;
  color: var(--accent-text);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(1.8rem, 4.5vw, 2.8rem);
  font-weight: 600;
  line-height: 1.2;
  text-wrap: balance;
}

/* --- Semaine courante ------------------------------------------- */
.current {
  position: relative;
  max-width: 34rem;
  margin: 2.25rem auto 1.75rem;
  padding: 1.75rem 1.5rem 2rem;
  background: linear-gradient(160deg, var(--surface), var(--surface-2));
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  box-shadow: var(--shadow);
}

.current::before {
  content: '';
  position: absolute;
  inset: 0 2rem auto;
  height: 3px;
  background: var(--accent);
  border-radius: 0 0 3px 3px;
}

.current__label {
  display: inline-block;
  margin: 0;
  padding: 0.25rem 0.9rem;
  color: var(--on-accent);
  background: var(--accent);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.current__theme {
  margin: 0.9rem 0 0;
  font-family: var(--font-serif);
  font-size: clamp(2rem, 6vw, 3rem);
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.current__theme::first-letter {
  text-transform: uppercase;
}

/* --- Introduction ------------------------------------------------ */
.intro {
  max-width: 40rem;
  margin: 0 auto 2.5rem;
  color: var(--muted);
}

/* --- Liste des thèmes -------------------------------------------- */
h2 {
  margin: 0 0 1.25rem;
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.themes ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
  text-align: left;
}

.themes li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.85rem 0.55rem 0.6rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.85rem;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    opacity 0.15s ease;
}

.themes li:hover {
  border-color: var(--accent-text);
  transform: translateY(-1px);
  opacity: 1;
}

.num {
  display: grid;
  flex: none;
  place-items: center;
  min-width: 2.1rem;
  height: 2.1rem;
  color: var(--muted);
  background: var(--surface-2);
  border-radius: 50%;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}

.name {
  display: inline-block;
  min-width: 0;
  overflow-wrap: anywhere;
}

.name::first-letter {
  text-transform: uppercase;
}

/* Regroupement replié des semaines passées */
.past {
  margin-bottom: 1.25rem;
  text-align: left;
}

.past summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: fit-content;
  margin: 0 auto;
  padding: 0.5rem 1.1rem;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.9rem;
  cursor: pointer;
  list-style: none;
  user-select: none;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.past summary::-webkit-details-marker {
  display: none;
}

.past summary::before {
  content: '';
  width: 0.45rem;
  height: 0.45rem;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(-45deg);
  transition: transform 0.15s ease;
}

.past[open] summary::before {
  transform: rotate(45deg);
}

.past summary:hover {
  color: var(--text);
  border-color: var(--accent-text);
}

.past summary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.count {
  min-width: 1.6rem;
  padding: 0 0.4rem;
  color: var(--on-accent);
  background: var(--accent);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.6;
  text-align: center;
}

.past ul {
  margin-top: 1rem;
}

.themes li.is-past {
  opacity: 0.55;
}

.themes li.is-current {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
  opacity: 1;
}

.themes li.is-current .num {
  color: var(--on-accent);
  background: var(--accent);
  font-weight: 700;
}

.themes li.is-current .name {
  font-weight: 600;
}

/* --- Hashtag et agenda ------------------------------------------- */
.hashtag {
  margin: 2.5rem 0 1.25rem;
  color: var(--muted);
}

code {
  padding: 0.15rem 0.5rem;
  color: var(--accent-text);
  background: var(--surface-2);
  border-radius: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.95em;
}

.actions {
  margin: 0 0 3rem;
}

.button {
  display: inline-block;
  padding: 0.7rem 1.4rem;
  color: var(--on-accent);
  background: var(--accent);
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  transition:
    transform 0.15s ease,
    filter 0.15s ease;
}

.button:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

/* --- Pied de page ------------------------------------------------ */
.footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  justify-content: center;
  padding-top: 1.5rem;
  color: var(--muted);
  border-top: 1px solid var(--border);
  font-size: 0.85rem;
}

.footer a {
  color: var(--muted);
}

.footer a:hover {
  color: var(--accent-text);
}
</style>
