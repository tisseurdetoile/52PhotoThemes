const { readFileSync ,writeFileSync, existsSync } = require('fs')
const ics = require('ics')
const { exit } = require('process')



function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array
}

function getDateOfISOWeek(w, y) {
const simple = new Date(y, 0, 1 + (w - 1) * 7)
const dow = simple.getDay()
const ISOweekStart = simple
if (dow <= 4)
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
else
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
return ISOweekStart;
}

const path = './dist/'
const year = new Date().getFullYear() + 1

const evts = []
const jsonEvts = []

const icsFileName = `${path}${year}.ics`
const jsonFileName = `${path}${year}.json`
const ndxFile = `${path}ndx.json`
const themesFile = "themes.json"

console.log(icsFileName)
console.log(jsonFileName)
console.log(ndxFile)

let ndx = []
let themes = []


try {
  if (existsSync(ndxFile)) {
    const rawNdx = readFileSync(ndxFile)
    ndx = JSON.parse(rawNdx)
  }

  if (!existsSync(themesFile) || existsSync(icsFileName) || existsSync(jsonFileName)) {
    console.log("Problèmes avec les fichiers attendu")
    exit(5)
  } else {
    const rawThemeFile = readFileSync(themesFile)
    themes = JSON.parse(rawThemeFile)
  }
} catch(err) {
  console.error(err)
}

const yeartheme = shuffle(themes).slice(0,52)


/**
 * Boucle sur les thèmes
 */
for (let i = 0; i <= 51; i++) {
  let readtheme = yeartheme[i];

  if (typeof readtheme !== 'object') {
     readtheme = { summary: readtheme, description: readtheme}
  }

  jsonEvts.push(readtheme)


  let lundi = getDateOfISOWeek(i, year)
  let samedi = new Date(lundi)
  samedi.setDate(samedi.getDate() + 6)
  let firstEvt = {start: [lundi.getFullYear(), lundi.getMonth()+1, lundi.getDate()],
  title: `Theme: ${readtheme.summary}`,
  description: `Theme: ${readtheme.description}`,
  status: 'CONFIRMED',
  busyStatus: 'FREE'
  }

  evts.push(firstEvt)

let lastevt = {...firstEvt,
  start: [samedi.getFullYear(), samedi.getMonth()+1, samedi.getDate()],
  title: `FIN Theme: ${readtheme.summary}`,}

  evts.push(lastevt)

 }
/**
 * FIN Boucle sur les thèmes
 */

//console.log (jsonEvts)

ndx.push(year)

const icsData = ics.createEvents(evts, (error, value) => {
  if (error) {
    console.log(error)
    return undefined
  }
  return value
})

ndx = ndx.filter((x, i) => ndx.indexOf(x) === i)

writeFileSync(ndxFile, JSON.stringify(ndx))

if (icsData !== undefined) {
  writeFileSync(icsFileName, icsData)
}

if (jsonEvts !== undefined) {
  writeFileSync(jsonFileName, JSON.stringify(jsonEvts))
}
