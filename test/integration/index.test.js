const test = require('ava')
const fs = require('fs-extra')
const path = require('path')
const streamEqual = require('stream-equal')

const HexoInstance = require('../utils//HexoInstance')

const FIXTURE_DIR = path.join(__dirname, '..', 'fixtures')

test.before('Init tmp', function () {
  return HexoInstance.init()
})

test.after('Reset tmp', function () {
  return HexoInstance.destroy()
})

test.beforeEach('Init hexo instance', async function (t) {
  const instance = HexoInstance.create()
  await instance.init()
  t.context.instance = instance
})

test('use short id as route', async function (t) {
  t.plan(2)

  /**
   * @type {HexoInstance}
   */
  const instance = t.context.instance
  let postId
  instance.on('shortid:generate', function (_postId) {
    postId = _postId
  })

  await instance.createPost()
  await instance.load()

  t.is(typeof postId, 'string')

  console.log(instance.route)

  const postStream = instance.route.get(`/${postId}`)
  const expectStream = fs.createReadStream(path.join(FIXTURE_DIR, 'expect.html'))

  t.true(await streamEqual(postStream, expectStream))
})
