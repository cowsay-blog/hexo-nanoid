const _get = require('lodash.get')

const DEFAULT_CONFIG = {
  autofix: false,
  check_on_new: true,
  maxtry: 10,
  length: 21,
  characters: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-'
}

module.exports = function (hexo) {
  const config = Object.assign(
    {},
    DEFAULT_CONFIG,
    _get(hexo, 'theme.config.nanoid'),
    _get(hexo, 'config.theme_config.nanoid'),
    _get(hexo, 'config.nanoid')
  )

  config.autofix = Boolean(config.autofix)
  config.maxtry = Number(config.maxtry)

  return config
}

module.exports.DEFAULT_CONFIG = DEFAULT_CONFIG
