const { isValid, generate } = require('shortid')

const CONFIG_KEY = 'shortid'
let configCache = null
const pool = new Set()

module.exports = function (data) {
  if (data.layout === 'post') {
    const _get = this._.get
    const config = configCache || Object.assign(
      {
        autofix: false,
        maxtry: Infinity
      },
      _get(this, [ 'theme', 'config', CONFIG_KEY ]),
      _get(this, [ 'config', 'theme_config', CONFIG_KEY ]),
      _get(this, [ 'config', CONFIG_KEY ])
    )

    config.autofix = Boolean(config.autofix)
    config.maxtry = Number(config.maxtry)

    let postId = data.shortid

    if (postId === undefined || (!isValid(data.shortid) && config.autofix)) {
      // generate new post ID
      let genTry = 0
      do {
        // ensure unique in pool
        postId = generate()
        genTry++
      } while (pool.has(postId) && genTry < config.maxtry)

      if (pool.has(postId)) {
        this.exit(new Error(`Failed to find an unique ID in ${genTry} tr${genTry === 1 ? 'y' : 'ies'}.`))
        return data
      }
    }
  }
  return data
}
