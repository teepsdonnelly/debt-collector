import * as core from '@actions/core'
import * as github from '@actions/github'
/**
 * Creates new issue
 * @author teepsdonnelly
 * @since 1.0.0
 */
export async function createIssue (
  titlePrefix: string,
  issueTitle: string,
  issueBody: string,
  HtmlURL: string,
  token: string
) {
  const spacer = '\r\n\r\n'
  const context = github.context
  const octokit = new github.GitHub(token)

  const newIssue = await octokit.issues.create({
    ...context.repo,
    title: titlePrefix + issueTitle,
    body:
      issueBody +
      spacer +
      'See the [where this Issue was created](' +
      HtmlURL +
      ')'
  })

  console.log(
    'Issue created: ' + newIssue.data.number + ' ' + titlePrefix + issueTitle
  )
}
