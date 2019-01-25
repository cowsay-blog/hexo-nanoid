const { promisify } = require('util')

const writeFileAsync = promisify(require('fs').writeFile)

const getConfig = require('./lib/config')
const _validate = require('./lib/validate')
const _generate = require('./lib/generate')

const { ValidationError, GenerationError } = require('./lib/errors')

const {
  updateFrontMatter,
  updateDatabase
} = require('./lib/update')

const idPool = new Set()

hexo.extend.filter.register('before_generate', function () {
  const config = getConfig(this)
  const validate = _validate.bind(this, config)
  const generate = _generate.bind(this, config)

  /* Validation */
  const result = validate(this.model('Post').toArray())

  if (result.conflict.size + result.invalid.length > 0 && !config.autofix) {
    return Promise.reject(new ValidationError(result))
  }

  Array.from(result.valid.keys())
    .forEach(postId => idPool.add(postId))

  return Promise.all(
    []
      .concat(result.new)
      .concat(...Array.from(result.conflict.values()))
      .concat(result.invalid)
      .map(
        post => {
          const postId = generate(
            (_postId) => {
              if (!idPool.has(_postId)) {
                idPool.add(_postId)
                return true
              }
              return false
            },
            config.maxtry
          )

          post.nanoid = postId
          return Promise.resolve(updateFrontMatter(post))
            .then(() => Promise.all([
              updateDatabase(this, post),
              writeFileAsync(post.full_source, post.raw, 'utf8')
            ]))
            .then(() => {
              // emit generate event on this
              this.emit('nanoid:generate', postId)
            })
            .catch(err => {
              throw new GenerationError(post, err)
            })
        }
      )
  )
})

async function _hookedNewConsole (args) {
  const config = getConfig(this)
  const generate = _generate.bind(this, config)

  // load files and perform ID validation
  if (config.check_on_new) {
    await this.load()
  }
  args.nanoid = generate(
    (postId) => {
      if (!config.check_on_new) return true

      if (!idPool.has(postId)) {
        idPool.add(postId)
        return true
      }
      return false
    },
    config.maxtry
  )
  return _newConsole.call(this, args)
}

const _newConsole = hexo.extend.console.get('new')

// hook into Console "new"
hexo.extend.console.register('new', _newConsole.desc, _newConsole.options, _hookedNewConsole)
