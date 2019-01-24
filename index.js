const createValidator = require('./lib/validate')

hexo.extend.filter.register('before_generate', createValidator(hexo))
