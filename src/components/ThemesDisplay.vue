<template>
  <div class="hello">
    <h1>Thèmes pour une photo par semaine en {{ year }}</h1>

    <h3 v-if="themes.length > 0">
      Semaine : {{ getWeekNumber }} - {{ themes[getWeekNumber - 1].summary }}
    </h3>

    <p>
      Pour un explication rapide de ce qu'est un projet photo 52 vous pouvez consulter l'article ici
      <a
        href="https://phototrend.fr/2015/03/mp-130-realiser-un-projet-photo-52/"
        target="_blank"
        rel="noopener"
        >sur phototrend</a
      >.
    </p>
    <h3>Liste des thèmes</h3>
    <div class="themes">
      <ul>
        <li v-for="item in themes" :key="item.id">{{ item.summary }}</li>
      </ul>
    </div>
    <p>Si vous publier vos photos merci d'utiliser le tag #tdt{{ year }}p52</p>
    <h3>Liens utile</h3>
    <ul>
      <li><a :href="this.icsUrl" target="_blank" rel="noopener">Ajouter à votre agenda</a></li>
    </ul>
    <h3>Construit avec</h3>
    <ul>
      <li><a href="https://vuejs.org" target="_blank" rel="noopener">vuejs</a></li>
      <li>
        <a href="http://www.tisseurdetoile.net" target="_blank" rel="noopener"
          >(c) Le TisseurDeToile</a
        >
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'ThemesDisplay',
  props: {
    year: Number,
    themes: Array
  },
  data() {
    return {
      icsUrl: '/'
    }
  },
  mounted() {
    this.icsUrl = `./${this.year}.ics`
  },
  computed: {
    getWeekNumber() {
      let date = new Date()
      date.setHours(0, 0, 0)
      date.setDate(date.getDate() + 4 - (date.getDay() || 7))
      return Math.ceil(((date - new Date(date.getFullYear(), 0, 1)) / 8.64e7 + 1) / 7)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
