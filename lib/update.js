const hfm = require('hexo-front-matter')

function updateFrontMatter (post) {
  const frontMatter = hfm.parse(post.raw)
  frontMatter.nanoid = post.nanoid
  post.raw = hfm.stringify(frontMatter)
}

function updateDatabase (hexo, post) {
  return hexo.model('Post').updateById(post._id, post)
}

module.exports = {
  updateFrontMatter,
  updateDatabase
}
