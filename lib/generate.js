const shortid = require('shortid')

module.exports = async function generate (validate = () => true, maxtry = 10) {
  // generate new post ID
  let postId = ''
  let tried = 0

  do {
    // ensure unique in pool
    postId = shortid.generate()
    tried++

    if (validate(postId)) {
      return postId
    }
  } while (tried < maxtry)

  throw new Error(`Max try of ID generation is reached. (#${maxtry})`)
}
