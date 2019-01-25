const test = require('ava')
const fs = require('fs-extra')
const path = require('path')
const { spy } = require('sinon')
const genNanoId = require('nanoid')
const streamEqual = require('stream-equal')

const HexoInstance = require('../utils//HexoInstance')

const FIXTURE_DIR = path.join(__dirname, '..', 'fixtures')

test.before('Init tmp', function () {
  return HexoInstance.init()
})

test.after('Clear tmp', function () {
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
  instance.on('nanoid:generate', function (_postId) {
    postId = _postId
  })

  await instance.createPost()
  await instance.load()

  t.is(typeof postId, 'string')

  const postStream = instance.route.get(`${postId}/`)
  const expectStream = fs.createReadStream(path.join(FIXTURE_DIR, 'expect.html'))

  t.true(await streamEqual(postStream, expectStream))
})

test('short id conflict', async function (t) {
  t.plan(4)

  /**
   * @type {HexoInstance}
   */
  const instance = t.context.instance
  const nanoid = genNanoId()
  await Promise.all([
    instance.createPost({ nanoid }),
    instance.createPost({ nanoid })
  ])

  try {
    await instance.load()
  } catch (e) {
    t.is(e.name, 'ValidationError')
    t.is(e.result.conflict.size, 1)
    t.true(e.result.valid.has(nanoid))
    t.is(e.result.conflict.get(nanoid).length, 1)
  }
})

test('invalid short id', async function (t) {
  t.plan(2)

  /**
   * @type {HexoInstance}
   */
  const instance = t.context.instance
  await instance.createPost({
    nanoid: 'i have spaces'
  })

  try {
    await instance.load()
  } catch (e) {
    t.is(e.name, 'ValidationError')
    t.is(e.result.invalid.length, 1)
  }
})

test('autofixable', async function (t) {
  t.plan(6)

  /**
   * @type {HexoInstance}
   */
  const instance = t.context.instance
  instance.configure({
    autofix: true
  })

  const nanoid = genNanoId()
  await instance.createPost({
    nanoid: 'i have spaces'
  })
  await Promise.all([
    instance.createPost({ nanoid }),
    instance.createPost({ nanoid })
  ])

  const generationSpy = spy()
  instance.on('nanoid:generate', generationSpy)

  await instance.load()

  // one of 2 conflicted posts will keep the short ID
  // only one of them will re-generate a short ID
  t.true(generationSpy.calledTwice)

  const postIds = generationSpy.getCalls().map(call => call.args[0])
  postIds.forEach(postId => t.is(typeof postId, 'string'))

  await Promise.all(
    postIds
      .concat([ nanoid ])
      .map(postId => instance.route.get(`${postId}/`))
      .map(async postStream => {
        const expectStream = fs.createReadStream(path.join(FIXTURE_DIR, 'expect.html'))
        t.true(await streamEqual(postStream, expectStream))
      })
  )
})
