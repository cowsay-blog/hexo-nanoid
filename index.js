const { promisify } = require('util')
const shortid = require('shortid')

const writeFileAsync = promisify(require('fs').writeFile)

const validate = require('./lib/validate')
const getConfig = require('./lib/config')
const generate = require('./lib/generate')

const { ValidationError, GenerationError } = require('./lib/errors')

const {
  updateFrontMatter,
  updateDatabase
} = require('./lib/update')

hexo.extend.filter.register('before_generate', function () {
  const config = getConfig(this)

  if (typeof config.characters === 'string' && config.characters.length === 64) {
    shortid.characters(config.characters)
  }

  if (typeof config.seed === 'number') {
    shortid.seed(config.seed)
  }

  if (typeof config.worker === 'number') {
    shortid.worker(config.worker)
  }

  /* Validation */
  const result = validate(this.model('Post').toArray())

  if (result.conflict.size + result.invalid.length > 0 && !config.autofix) {
    return Promise.reject(new ValidationError(result))
  }

  const idPool = new Set(Array.from(result.valid.keys()))

  return Promise.all(
    []
      .concat(result.new)
      .concat(...Array.from(result.conflict.values()))
      .concat(result.invalid)
      .map(
        post => generate(
          (postId) => {
            if (!idPool.has(postId)) {
              idPool.add(postId)
              return true
            }
            return false
          },
          config.maxtry
        ).then((postId) => {
          post.shortid = postId
          return Promise.resolve(updateFrontMatter(post))
            .then(() => Promise.all([
              updateDatabase(this, post),
              writeFileAsync(post.full_source, post.raw, 'utf8')
            ]))
            .then(() => {
              // emit generate event on this
              this.emit('shortid:generate', postId)
            })
        }).catch(err => {
          throw new GenerationError(post, err)
        })
      )
  )
})
