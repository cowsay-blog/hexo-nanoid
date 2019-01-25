const { isValid } = require('./nanoid')

function ceatePool () {
  return {
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
}

/**
 * @param {Post[]} posts
 */
module.exports = function validate (config, posts) {
  return posts.reduce((pool, post) => {
    // new post without short ID
    if (!Reflect.has(post, 'nanoid')) {
      pool.new.push(post)
      return pool
    }

    // invalid
    if (!isValid(post.nanoid, config)) {
      pool.invalid.push(post)
      return pool
    }

    // conflicted
    if (pool.valid.has(post.nanoid)) {
      if (!pool.conflict.has(post.nanoid)) {
        pool.conflict.set(post.nanoid, [])
      }
      pool.conflict.get(post.nanoid).push(post)
      return pool
    }

    pool.valid.set(post.nanoid, post)
    return pool
  }, ceatePool())
}
