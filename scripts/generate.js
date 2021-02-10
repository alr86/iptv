const db = require('./db')
const utils = require('./utils')

const ROOT_DIR = './.gh-pages'

db.load()

function main() {
  createRootDirectory()
  createNoJekyllFile()
  generateIndex()
  generateSFWIndex()
  generateChannelsJson()
  generateCountryIndex()
  generateLanguageIndex()
  generateCategoryIndex()
  generateCountries()
  generateLanguages()
  generateCategories()
  finish()
}

function createRootDirectory() {
  console.log('Creating .gh-pages folder...')
  utils.createDir(ROOT_DIR)
}

function createNoJekyllFile() {
  console.log('Creating .nojekyll...')
  utils.createFile(`${ROOT_DIR}/.nojekyll`)
}

function generateIndex() {
  console.log('Generating index.m3u...')
  const filename = `${ROOT_DIR}/index.m3u`
  utils.createFile(filename, '#EXTM3U\n')

  const channels = utils.sortBy(db.channels.all(), ['name', 'url'])
  for (let channel of channels) {
    utils.appendToFile(filename, channel.toString())
  }
}

function generateSFWIndex() {
  console.log('Generating index.sfw.m3u...')
  const filename = `${ROOT_DIR}/index.sfw.m3u`
  utils.createFile(filename, '#EXTM3U\n')

  const sorted = utils.sortBy(db.channels.all(), ['name', 'url'])
  const channels = utils.filterNSFW(sorted)
  for (let channel of channels) {
    utils.appendToFile(filename, channel.toString())
  }
}

function generateChannelsJson() {
  console.log('Generating channels.json...')
  const filename = `${ROOT_DIR}/channels.json`
  const channels = db.channels
    .sortBy(['name', 'url'])
    .all()
    .map(c => c.toJSON())
  utils.createFile(filename, JSON.stringify(channels))
}

function generateCountryIndex() {
  console.log('Generating index.country.m3u...')
  const filename = `${ROOT_DIR}/index.country.m3u`
  utils.createFile(filename, '#EXTM3U\n')

  const channels = db.channels.sortBy(['name', 'url']).forCountry({ code: null })
  for (const channel of channels) {
    const category = channel.category
    channel.category = ''
    utils.appendToFile(filename, channel.toString())
    channel.category = category
  }

  const countries = db.countries.sortBy(['name']).all()
  for (const country of countries) {
    const channels = db.channels.sortBy(['name', 'url']).forCountry(country)
    for (const channel of channels) {
      const category = channel.category
      channel.category = country.name
      utils.appendToFile(filename, channel.toString())
      channel.category = category
    }
  }
}

function generateLanguageIndex() {
  console.log('Generating index.language.m3u...')
  const filename = `${ROOT_DIR}/index.language.m3u`
  utils.createFile(filename, '#EXTM3U\n')

  const channels = db.channels.sortBy(['tvgLanguage', 'name', 'url']).all()
  for (const channel of channels) {
    const category = channel.category
    channel.category = channel.tvgLanguage
    utils.appendToFile(filename, channel.toString())
    channel.category = category
  }
}

function generateCategoryIndex() {
  console.log('Generating index.category.m3u...')
  const filename = `${ROOT_DIR}/index.category.m3u`
  utils.createFile(filename, '#EXTM3U\n')

  const channels = db.channels.sortBy(['category', 'name', 'url']).all()
  for (const channel of channels) {
    utils.appendToFile(filename, channel.toString())
  }
}

function generateCountries() {
  console.log('Generating /countries...')
  const outputDir = `${ROOT_DIR}/countries`
  utils.createDir(outputDir)

  for (const country of db.countries.all()) {
    const filename = `${outputDir}/${country.code}.m3u`
    utils.createFile(filename, '#EXTM3U\n')

    const channels = db.channels.sortBy(['name', 'url']).forCountry(country)
    for (const channel of channels) {
      utils.appendToFile(filename, channel.toString())
    }
  }
}

function generateLanguages() {
  console.log('Generating /languages...')
  const outputDir = `${ROOT_DIR}/languages`
  utils.createDir(outputDir)

  for (const language of db.languages.all()) {
    const filename = `${outputDir}/${language.code}.m3u`
    utils.createFile(filename, '#EXTM3U\n')

    const channels = db.channels.sortBy(['name', 'url']).forLanguage(language)
    for (const channel of channels) {
      utils.appendToFile(filename, channel.toString())
    }
  }
}

function generateCategories() {
  console.log('Generating /categories...')
  const outputDir = `${ROOT_DIR}/categories`
  utils.createDir(outputDir)

  for (const category of db.categories.all()) {
    const filename = `${outputDir}/${category.id}.m3u`
    utils.createFile(filename, '#EXTM3U\n')

    const channels = db.channels.sortBy(['name', 'url']).forCategory(category)
    for (const channel of channels) {
      utils.appendToFile(filename, channel.toString())
    }
  }
}

function finish() {
  console.log(
    `Countries: ${db.countries.count()}. Languages: ${db.languages.count()}. Categories: ${db.categories.count()}. Channels: ${db.channels.count()}.`
  )

  console.log('Done.')
}

main()
