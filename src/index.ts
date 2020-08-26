import * as core from '@actions/core'
import * as github from '@actions/github'
type options = {
  titlePrefix: string
  titleStart: string
  titleEnd: string
  titleEndRegex?: string
  bodyStart: string
  bodyEnd: string
  bodyEndRegex?: string
}

/**
 * Runs the action (root of action)
 * !TODO: Confirm this move worked before using
 * TODO: cleanup
 * @author teepsdonnelly, TGTGamer
 * @since 2.0.0
 */
async function run () {
  const body = (await getBody().catch(err => {
    core.setFailed(err)
  })) as string
  const options: options = {
    titlePrefix: core.getInput('title_prefix'),
    titleStart: core.getInput('title_regex'),
    titleEnd: core.getInput('title_end'),
    bodyStart: core.getInput('body_start_regex'),
    bodyEnd: core.getInput('body_end')
  }
  options.titleEndRegex = modeSwitch(
    'title',
    options.titleEnd,
    options.titleStart
  )
  options.bodyEndRegex = modeSwitch('body', options.bodyEnd, options.bodyStart)

  /**
   * Gets the content for title
   * @author teepsdonnelly, TGTGamer
   * @since 1.0.0
   */
  const debtIssueTitle = (await parseContent(
    body,
    options.titleStart,
    options.titleEnd,
    options.bodyEndRegex
  ).catch(err => {
    core.setFailed('Debt Title Error: ' + err)
  })) as string

  /**
   * Gets the content for body
   * @author teepsdonnelly, TGTGamer
   * @since 1.0.0
   */
  const debtIssueBody = (await parseContent(
    body,
    options.bodyStart,
    options.bodyEnd,
    options.bodyEndRegex
  ).catch(err => {
    core.setFailed('Debt Body Error: ' + err)
  })) as string

  /**
   * Creates the issue
   * @author teepsdonnelly, TGTGamer
   * @since 1.0.0
   */
  if (debtIssueTitle == '' || !debtIssueTitle) {
    core.setFailed('You must at least provide a value for the debt issue title')
  } else {
    createIssue(options.titlePrefix, debtIssueTitle, debtIssueBody).catch(
      err => {
        core.setFailed(err)
      }
    )
  }
}

/**
 * Switches the mode of the content endpoint
 * @author TGTGamer
 * @since 2.0.0
 */
function modeSwitch (content: string, mode: string, StartRegex: any) {
  switch (mode) {
    case 'paragraph':
      return `/${StartRegex}[^\\n]*\\.?/im`
    case 'line':
      return `/${StartRegex}[^.\\n]*\\.?/im`
    case 'regex':
      return `/${core.getInput(`${content}_end_regex`)}/im`
    default:
      return ''
  }
}

/**
 * Switches the context endpoint to enable comments
 * @author TGTGamer
 * @since 2.0.0
 */
function getBody (): Promise<string> {
  return new Promise(resolve => {
    switch (github.context.eventName) {
      case 'pull_request':
        if (github.context.payload.pull_request)
          resolve(github.context.payload.pull_request.body)
      case 'issue':
        if (github.context.payload.issue)
          resolve(github.context.payload.issue.body)
    }
    throw new Error(
      "This context isn't supported: " + github.context.toString()
    )
  })
}

/**
 * Look for a particular content in [STRING] format
 * @description Get the trimmed String after it up to the next new line
 * @author teepsdonnelly, TGTGamer
 * @returns String of content
 * @throws Error if regex can't be matched
 * @since 1.0.0
 */
function parseContent (
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
    const contentStart = body.match(`/${StartRegex}/im`)
    if (!contentStart || !contentStart.index)
      throw new Error('Start not matched')
    const contentStartIndex = contentStart.index + contentStart.length

    /**
     * Finds the end point using `EndRegex`
     * @author TGTGamer
     * @since 2.0.0
     */
    const contentEnd = body.match(EndRegex)
    if (!contentEnd || !contentEnd.index) throw new Error('End not matched')
    var contentEndIndex: number
    if (endMode == 'regex') {
      contentEndIndex = contentEnd.index
    } else {
      contentEndIndex = contentEnd.index + contentEnd.length
    }

    /**
     * Finds the content and checks its length.
     * @author teepsdonnelly
     * @since 1.0.0
     */
    const content = body.substring(contentStartIndex, contentEndIndex).trim()
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
async function createIssue (
  titlePrefix: string,
  issueTitle: string,
  issueBody: string
) {
  const spacer = '\r\n\r\n'
  const context = github.context
  const myToken = core.getInput('token')
  const octokit = new github.GitHub(myToken)
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

run()
