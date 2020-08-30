import * as core from '@actions/core'
import * as helpers from './helpers'
type options = {
  titlePrefix: string
  titleStart: string
  titleEnd: string
  titleEndRegex?: string
  bodyStart: string
  bodyEnd: string
  bodyEndRegex?: string
  token: string
}

/**
 * Runs the action (root of action)
 * !TODO: Confirm this move worked before using
 * TODO: cleanup
 * @author teepsdonnelly, TGTGamer
 * @since 2.0.0
 */
async function run () {
  const context: any = await helpers.getContext().catch(err => {
    core.setFailed(err)
  })
  core.debug('body: ' + context.body)
  const options: options = {
    titlePrefix: core.getInput('title_prefix') || '[DEBT]',
    titleStart: core.getInput('title_regex') || '<!--\\[DEBT_ISSUE_TITLE\\]-->',
    titleEnd: core.getInput('title_end') || 'line',
    bodyStart:
      core.getInput('body_start_regex') || '<!--\\[DEBT_BODY_START\\]-->',
    bodyEnd: core.getInput('body_end') || 'paragraph',
    token: core.getInput('token')
  }
  options.titleEndRegex = helpers.modeSwitch(
    'title',
    options.titleEnd,
    options.titleStart
  )
  options.bodyEndRegex = helpers.modeSwitch(
    'body',
    options.bodyEnd,
    options.bodyStart
  )

  /**
   * Gets the content for title
   * @author teepsdonnelly, TGTGamer
   * @since 1.0.0
   */
  const debtIssueTitle = (await helpers
    .parseContent(
      context.body,
      options.titleStart,
      options.titleEnd,
      options.titleEndRegex
    )
    .catch(err => {
      core.setFailed('Debt Title Error: ' + err)
    })) as string

  /**
   * Gets the content for body
   * @author teepsdonnelly, TGTGamer
   * @since 1.0.0
   */
  const debtIssueBody = (await helpers
    .parseContent(
      context.body,
      options.bodyStart,
      options.bodyEnd,
      options.bodyEndRegex
    )
    .catch(err => {
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
    helpers
      .createIssue(
        options.titlePrefix,
        debtIssueTitle,
        debtIssueBody,
        context.html_url,
        options.token
      )
      .catch(err => {
        core.setFailed(err)
      })
  }
}

run()
