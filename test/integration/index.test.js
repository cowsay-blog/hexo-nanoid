const Hexo = require('hexo')
const test = require('ava')
const fs = require('fs-extra')
const path = require('path')
const { spy } = require('sinon')
const shortid = require('shortid')
const streamEqual = require('stream-equal')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)

const FIXTURE_DIR = path.join(__dirname, '..', 'fixtures')
const INSTANCE_DIR = path.join(FIXTURE_DIR, 'instance')
const POST_DIR = path.join(INSTANCE_DIR, 'source', '_posts')
const TEST_SRC_FILE = path.join(FIXTURE_DIR, 'test.md')
const TEST_TARGET_FILE = path.join(POST_DIR, 'test.md')
const EXPECT_FILE = path.join(FIXTURE_DIR, 'expect.md')

test.before('init instance', async function initInstance (t) {
  await fs.ensureDir(POST_DIR)
  await fs.emptyDir(POST_DIR)

  if (!fs.existsSync(path.join(INSTANCE_DIR, 'node_modules'))) {
    // install deps
    t.log('Installing dependencies...')
    await exec('npm install')
  }
  t.log('Instance initialized.')
})

test.beforeEach('init case', async function initCase (t) {
  await fs.copy(TEST_SRC_FILE, TEST_TARGET_FILE, {
    overwrite: true
  })

  spy(shortid, 'generate')

  t.context.hexo = new Hexo(INSTANCE_DIR, {
    silent: true
  })
  await t.context.hexo.init()
})

test.afterEach('reset', function (t) {
  shortid.generate.restore()
})

test('use short id as route', async function (t) {
  await t.context.hexo.load()

  const postId = shortid.generate.firstCall.returnValue
  const postStream = t.context.hexo.route.get(`/${postId}`)
  const expectStream = fs.createReadStream(EXPECT_FILE)

  t.true(await streamEqual(postStream, expectStream))
})
