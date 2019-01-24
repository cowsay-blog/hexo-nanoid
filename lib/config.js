const _get = require('lodash.get')

const DEFAULT_CONFIG = {
  silent: false,
  autofix: false,
  maxtry: 10
}

let cache = null

module.exports = function (hexo) {
  if (!cache) {
    cache = Object.assign(
      {},
      DEFAULT_CONFIG,
      _get(hexo, 'theme.config.shortid'),
      _get(hexo, 'config.theme_config.shortid'),
      _get(hexo, 'config.shortid')
    )

    cache.autofix = Boolean(cache.autofix)
    cache.maxtry = Number(cache.maxtry)
  }

  return cache
}

module.exports.DEFAULT_CONFIG = DEFAULT_CONFIG
