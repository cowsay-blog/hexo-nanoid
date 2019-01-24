const { isValid } = require('shortid')

const generate = require('./generate')
const getConfig = require('./config')

const pool = {
  /**
   * @type {Post[]}
   */
  new: [],

  /**
   * @type {Map<string, Post>}
   */
  valid: new Map(),

  /**
   * @type {Post[]}
   */
  invalid: [],

  /**
   * @type {Map<string, Post[]>}
   */
  conflict: new Map()
}

function validate (post) {
  // new post without short ID
  if (!Reflect.has(post, 'shortid')) {
    pool.new.push(post)
    return true
  }

  // invalid
  if (!isValid(post.shortid)) {
    pool.invalid.push(post)
    return false
  }

  // conflicted
  if (pool.valid.has(post.shortid)) {
    if (!pool.conflict.has(post.shortid)) {
      pool.conflict.set(post.shortid, [])
    }
    pool.conflict.get(post.shortid).push(post)
    return false
  }

  pool.valid.set(post.shortid, post)
  return true
}

module.exports = function createValidator (hexo) {
  const config = getConfig(hexo)
  return function validateAll () {
    const posts = hexo.model('Post').toArray()
    posts.forEach(validate)

    const logger = config.silent ? function () { }
      : config.autofix ? hexo.log.warn.bind(hexo.log)
        : hexo.log.error.bind(hexo.log)
    for (let [ _id, conflicts ] of pool.conflict.entries()) {
      logger(
        `ShortID "%s" from main post, "%s", is conflicted with the following posts.`,
        _id,
        pool.valid.get(_id).source
      )

      conflicts.forEach(_conflict => logger('- "%s"', _conflict.source))
    }

    if (pool.invalid.length > 0) logger(`Each of the following posts has an invalid ShortID.`)
    pool.invalid.forEach(
      _invalid => logger('- "%s" with ShortID "%s"', _invalid.source, _invalid.shortid)
    )

    if (pool.conflict.size + pool.invalid.length > 0 && !config.autofix) {
      return hexo.exit(new Error(`Short ID validation failed.`))
    }

    // no conflict && no invalid || autofix enabled
    return Promise.all(
      []
        .concat(pool.new)
        .concat(...Array.from(pool.conflict.values()))
        .concat(pool.invalid)
        .map(post => generate(
          post,
          (postId) => {
            if (!pool.valid.has(postId)) {
              pool.valid.set(postId, post)
              return true
            }
            return false
          },
          config.maxtry,
          true
        ).then((postId) => {
          // emit generate event on Hexo
          hexo.emit('shortid:generate', postId)
        }))
    )
  }
}

module.exports.validate = validate
