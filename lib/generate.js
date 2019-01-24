const fs = require('fs')
const shortid = require('shortid')
const hfm = require('hexo-front-matter')

function writeFile (post, postId) {
  return new Promise(function (resolve, reject) {
    const frontMatter = hfm.parse(post.raw)
    frontMatter.shortid = postId
    fs.writeFile(
      post.full_source,
      hfm.stringify(frontMatter),
      'utf8',
      err => err ? reject(err) : resolve()
    )
  })
}

module.exports = async function generate (post, validate, maxtry = 10, writeSource = true) {
  // generate new post ID
  let postId = ''
  let tried = 0

  do {
    // ensure unique in pool
    postId = shortid.generate()
    tried++

    if (validate(postId)) {
      if (writeSource) await writeFile(post, postId)
      return postId
    }
  } while (tried < maxtry)

  throw new Error(`Max try to generate ID is reached. Post: "${post.source}"`)
}
