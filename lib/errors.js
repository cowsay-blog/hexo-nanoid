function generateReport (title, result) {
  /* Result logging */
  let sections = [ title ]

  for (let [ _id, conflicts ] of result.conflict.entries()) {
    sections.push(
      `# ShortID "${_id}" from main post, "${result.valid.get(_id).source}", ` +
        `is conflicted with the following posts.\n` +
        conflicts.map(_conflict => `    - "${_conflict.source}"`)
          .join('\n')
    )
  }

  if (result.invalid.length > 0) {
    sections.push(
      `# Each of the following posts has an invalid ShortID.\n` +
        result.invalid.map(_invalid => `    - "${_invalid.source}" with ShortID "${_invalid.shortid}"`)
          .join('\n')
    )
  }

  return sections.join('\n\n')
}

class ValidationError extends Error {
  constructor (result) {
    super(generateReport('Short ID validation failed.', result) + '\n\n')
    this.name = 'ValidationError'
    this.result = result
  }
}

class GenerationError extends Error {
  constructor (post, oError) {
    super(`Failed to generate ID for Post "${post.source}".\n\n${oError.toString()}\n\n`)
    this.name = 'GenerationError'
    this.error = oError
  }
}

module.exports = {
  ValidationError,
  GenerationError
}
