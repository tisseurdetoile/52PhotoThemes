# 52phototheme

Site « une photo par semaine » : 52 thèmes tirés au sort chaque année, avec export agenda (`.ics`).
Application Vue 3 + Vite, déployée sur GitHub Pages.

## Installation

Node 22 (version indiquée dans `.nvmrc`, utilisée aussi par le CI) :

```
nvm use   # optionnel
npm install
```

## Développement

```
npm run dev       # serveur de dev avec rechargement à chaud
npm run build     # build de production (dossier dist/)
npm run preview   # prévisualiser le build
```

## Tests et qualité

```
npm test          # tests unitaires (une exécution)
npm run test:unit # tests unitaires en mode watch
npm run lint      # ESLint (avec correction automatique)
npm run format    # Prettier sur src/
```

## Générer les thèmes d'une année

Le script `scripts/generate.mjs` tire 52 thèmes au sort dans `themes.json` et produit
`<année>.json`, `<année>.ics` et met à jour `ndx.json`.

```
npm run generate                       # année prochaine, dans dist/
npm run generate -- 2027               # une année précise
npm run generate -- 2027 --out public  # écrire dans public/ (utile en local)
npm run generate -- 2027 --force       # écraser des fichiers existants
```

Les semaines sont les semaines ISO 8601 (du lundi au dimanche, la semaine 1 contient le 4 janvier).
Chaque thème est placé sur la semaine correspondante de l'année demandée. L'année du projet est
l'année ISO : la semaine 1 peut commencer fin décembre, et les années à 53 semaines (2026, 2032…)
ont une semaine bonus « thème libre » en semaine 53, présente aussi dans l'agenda.

## Déploiement

- `siteDeploy.yml` : build et déploiement sur la branche `gh-pages` à chaque push sur `main`.
- `siteUpdateThemes.yml` : génère les thèmes de l'année suivante le 1er décembre. Il peut aussi être
  lancé à la main, avec une année en paramètre (champ `year`).
