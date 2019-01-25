const _generate = require('nanoid/generate')

function isValid (id, { characters, length }) {
  if (typeof id !== 'string') return false
  if (id.length !== length) return false
  if (
    id.split('')
      .filter(
        char => !characters.includes(char)
      )
      .length > 0
  ) return false

  return true
}

function generate ({ characters, length }) {
  return _generate(characters, length)
}

module.exports = {
  isValid, generate
}
