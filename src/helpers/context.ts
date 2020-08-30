import * as core from '@actions/core'
import * as github from '@actions/github'

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
    core.debug(
      `Content start = {regex: ${StartRegex}, content: ${contentStart}}`
    )
    if (!contentStart || !contentStart.index)
      throw new Error('Start not matched')

    const contentStartIndex = contentStart.index + (StartRegex.length - 2)

    /**
     * Finds the end point using `EndRegex`
     * @author TGTGamer
     * @since 2.0.0
     */
    const contentEnd = body.match(new RegExp(EndRegex, 'im'))
    core.debug(`Content end = {regex: ${EndRegex}, content: ${contentEnd}}`)
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
    core.debug('Content Start: ' + contentStartIndex)
    core.debug('Content End: ' + contentEndIndex)
    core.debug('Content: ' + content)
    if (content.length == 0) {
      throw new Error('Content Length is 0')
    }
    resolve(content)
  })
}
