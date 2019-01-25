const { isValid } = require('shortid')

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
module.exports = function validate (posts) {
  return posts.reduce((pool, post) => {
    // new post without short ID
    if (!Reflect.has(post, 'shortid')) {
      pool.new.push(post)
      return pool
    }

    // invalid
    if (!isValid(post.shortid)) {
      pool.invalid.push(post)
      return pool
    }

    // conflicted
    if (pool.valid.has(post.shortid)) {
      if (!pool.conflict.has(post.shortid)) {
        pool.conflict.set(post.shortid, [])
      }
      pool.conflict.get(post.shortid).push(post)
      return pool
    }

    pool.valid.set(post.shortid, post)
    return pool
  }, ceatePool())
}
