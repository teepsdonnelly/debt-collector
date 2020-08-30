import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * Switches the context endpoint to enable comments
 * @author TGTGamer
 * @since 2.0.0
 */
export function getContext () {
  core.debug(JSON.stringify(github.context))
  return new Promise(resolve => {
    switch (github.context.eventName) {
      case 'pull_request':
        resolve(github.context.payload.pull_request)
      case 'pull_request_review':
        resolve(github.context.payload.review)
      case 'issue_comment':
        resolve(github.context.payload.comment)
    }
    throw new Error(
      "This context isn't supported: " + JSON.stringify(github.context)
    )
  })
}

/**
 * Switches the mode of the content endpoint
 * @author TGTGamer
 * @since 2.0.0
 */
export function modeSwitch (content: string, mode: string, StartRegex: any) {
  switch (mode) {
    case 'paragraph':
      return `${StartRegex}[^\\n]*\\.?`
    case 'line':
      return `${StartRegex}[^.\\n]*\\.?`
    case 'regex':
      return core.getInput(`${content}_end_regex`)
    default:
      return ''
  }
}
