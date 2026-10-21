<script>
import ThemesDisplay from './components/ThemesDisplay.vue'
import { loadThemes } from './utils/themesLoader.js'

export default {
  name: 'App',
  components: {
    ThemesDisplay
  },
  data() {
    return {
      themes: [],
      // année demandée (année en cours) et année réellement chargée
      requestedYear: new Date().getFullYear(),
      year: new Date().getFullYear(),
      loading: true,
      error: null
    }
  },
  computed: {
    isFallback() {
      return this.themes.length > 0 && this.year !== this.requestedYear
    }
  },
  async mounted() {
    try {
      const { year, themes } = await loadThemes(this.requestedYear)
      this.year = year
      this.themes = themes
    } catch (error) {
      console.error(error)
      this.error = `Impossible de charger les thèmes pour ${this.requestedYear}.`
    } finally {
      this.loading = false
    }
  }
}
</script>

<template>
  <p v-if="isFallback" class="notice" role="status">
    Les thèmes de {{ requestedYear }} ne sont pas encore disponibles : affichage de ceux de
    {{ year }}.
  </p>
  <ThemesDisplay v-if="themes.length > 0" :themes="themes" :year="year" />
  <p v-else-if="loading" class="status" role="status">Chargement des thèmes…</p>
  <p v-else-if="error" class="status status--error" role="alert">{{ error }}</p>
</template>

<style scoped>
.notice,
.status {
  max-width: 40rem;
  margin: 1.5rem auto 0;
  padding: 0.75rem 1rem;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  font-size: 0.9rem;
  text-align: center;
}

.status {
  margin-top: 4rem;
}

.status--error {
  color: var(--text);
  border-color: var(--accent-text);
}
</style>
