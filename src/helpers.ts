import * as core from '@actions/core'
import * as github from '@actions/github'
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

/**
 * Look for a particular content in [STRING] format
 * @description Get the trimmed String after it up to the next new line
 * @author teepsdonnelly, TGTGamer
 * @returns String of content
 * @throws Error if regex can't be matched
 * @since 1.0.0
 */
export function parseContent (
  body: string,
  StartRegex: string,
  endMode: string,
  EndRegex: string
): Promise<string> {
  return new Promise(resolve => {
    /**
     * Finds the regex start point and gets the index number of it
     * TODO: Cleanup because this ugly xD
     * @author TGTGamer
     * @since 2.0.0
     */
    const contentStart = body.match(new RegExp(StartRegex, 'im'))
    if (!contentStart || !contentStart.index)
      throw new Error('Start not matched')
    const contentStartIndex = contentStart.index + (StartRegex.length - 2)

    /**
     * Finds the end point using `EndRegex`
     * @author TGTGamer
     * @since 2.0.0
     */
    const contentEnd = body.match(new RegExp(EndRegex, 'im'))
    if (!contentEnd || !contentEnd.index) throw new Error('End not matched')
    var contentEndIndex: number
    if (endMode == 'regex') {
      contentEndIndex = contentEnd.index
    } else {
      contentEndIndex = contentEnd.index + (contentEnd[0].length - 1)
    }

    /**
     * Finds the content and checks its length.
     * @author teepsdonnelly
     * @since 1.0.0
     */
    const content = body.substring(contentStartIndex, contentEndIndex).trim()
    core.debug('Content Start: ' + contentStart)
    core.debug('Content End: ' + contentEnd)
    core.debug('Content: ' + content)
    if (content.length == 0) {
      throw new Error('Content Length is 0')
    }
    resolve(content)
  })
}

/**
 * Creates new issue
 * !TODO: Check that moving this hasn't affected functionality
 * @author teepsdonnelly
 * @since 1.0.0
 */
export async function createIssue (
  titlePrefix: string,
  issueTitle: string,
  issueBody: string,
  token: string
) {
  const spacer = '\r\n\r\n'
  const context = github.context
  const octokit = new github.GitHub(token)
  // @ts-ignore
  const prHtmlURL = context.payload.pull_request.html_url

  const newIssue = await octokit.issues.create({
    ...context.repo,
    title: titlePrefix + ' ' + issueTitle,
    body:
      issueBody +
      spacer +
      'See the [Pull Request that created this Issue](' +
      prHtmlURL +
      ')'
  })

  console.log('Issue created: ' + titlePrefix + ' ' + issueTitle)
}

/**
 * Switches the context endpoint to enable comments
 * @author TGTGamer
 * @since 2.0.0
 */
export function getBody (): Promise<string> {
  return new Promise(resolve => {
    switch (github.context.eventName) {
      case 'pull_request':
        if (github.context.payload.pull_request)
          resolve(github.context.payload.pull_request.body)
      case 'issue':
        if (github.context.payload.issue)
          resolve(github.context.payload.issue.body)
      case 'issue_comment':
        if (github.context.payload.issue)
          resolve(github.context.payload.comment.body)
    }
    throw new Error(
      "This context isn't supported: " + JSON.stringify(github.context)
    )
  })
}
