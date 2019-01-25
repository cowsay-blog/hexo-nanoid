const Hexo = require('hexo')
const hexocli = require('hexo-cli')
const fs = require('fs-extra')
const path = require('path')
const nanoid = require('nanoid')
const hfm = require('hexo-front-matter')
const { EventEmitter } = require('events')

const ROOT_DIR = path.resolve(__dirname, '..', '..')
const TEST_DIR = path.join(ROOT_DIR, 'test')
const TMP_DIR = path.join(TEST_DIR, '.tmp')
const HEXO_TEMPLATE_DIR = path.join(TMP_DIR, '__hexo__')
const FIXTURE_DIR = path.join(TEST_DIR, 'fixtures')
const THEMES_TEMPLATE_DIR = path.join(FIXTURE_DIR, 'themes')
const CONFIG_TEMPLATE_DIR = path.join(FIXTURE_DIR, '_config.yml')
const POST_TEMPLATE_FILE = path.join(FIXTURE_DIR, 'template.md')

/**
 * @type {Map<string, HexoInstance>}
 */
const instancePool = new Map()

class HexoInstance extends EventEmitter {
  constructor (id) {
    super()

    this.id = id
    this.cwd = path.join(TMP_DIR, this.id)
  }

  async init () {
    await fs.emptyDir(this.cwd)
    await fs.copy(HEXO_TEMPLATE_DIR, this.cwd, {
      overwrite: true
    })
    await fs.emptyDir(path.join(this.cwd, 'source', '_posts'))

    this.hexo = new Hexo(this.cwd)

    this.hexo.on('nanoid:generate', (postId) => {
      this.emit('nanoid:generate', postId)
    })

    await this.hexo.init()
    await this.hexo.loadPlugin(require.resolve(ROOT_DIR))
  }

  async createPost (name, frontMatter = {}) {
    if (typeof name === 'object') {
      frontMatter = name
      name = undefined
    }

    if (!name) {
      name = nanoid()
    }

    const template = await fs.readFile(POST_TEMPLATE_FILE, 'utf8')
    const front = hfm.parse(template)
    Object.assign(front, frontMatter)

    const targetFile = path.join(this.postDir, `${name}.md`)
    await fs.writeFile(
      targetFile,
      hfm.stringify(front),
      'utf8'
    )

    return targetFile
  }

  configure (obj) {
    Object.assign(this.hexo.config, {
      nanoid: obj
    })
  }

  async load () {
    await this.hexo.load()
  }

  get route () {
    return this.hexo.route
  }

  static async init () {
    await fs.emptyDir(TMP_DIR)
    await fs.ensureDir(HEXO_TEMPLATE_DIR)

    await hexocli(HEXO_TEMPLATE_DIR, {
      _: [ 'init' ],
      clone: false,
      install: true
    })

    await fs.copy(THEMES_TEMPLATE_DIR, path.join(HEXO_TEMPLATE_DIR, 'themes'), {
      overwrite: true
    })

    await fs.copy(CONFIG_TEMPLATE_DIR, path.join(HEXO_TEMPLATE_DIR, '_config.yml'), {
      overwrite: true
    })
  }

  static async destroy () {
    await fs.remove(TMP_DIR)
    instancePool.clear()
  }

  static create () {
    let id
    do {
      id = nanoid()
    } while (instancePool.has(id))
    return new HexoInstance(id)
  }

  get postDir () {
    return path.join(this.cwd, 'source', '_posts')
  }

  static get pool () {
    return instancePool
  }
}

module.exports = HexoInstance
