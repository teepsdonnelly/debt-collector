import * as functions from '../src/helpers'

const body =
  "## New Debt Created \r\n  <!--[DEBT_ISSUE_TITLE]--> Refactor logging in with social accounts. <!--[DEBT_BODY_START]--> Currently, the logic for logging in with social accounts is at the view layer in the app. It needs to be moved out into a helper class and we should utilize the ViewModel appropriately to give the View what it needs. Let's keep our views as dumb as possible for readability and maintainability. \r\n A second paragraph to showcase how an end descriptor can be used too <!--[DEBT_BODY_END]--> Something following it after the end \r\n And another paragraph to show it wont see this"

test('default title regex', async () => {
  await expect(
    await functions
      .parseContent(
        body,
        '<!--\\[DEBT_ISSUE_TITLE\\]-->',
        'line',
        '<!--\\[DEBT_ISSUE_TITLE\\]-->[^.\\n]*\\.?'
      )
      .catch(err => console.log(err))
  ).toBe('Refactor logging in with social accounts')
})
test('default body regex', async () => {
  await expect(
    await functions
      .parseContent(
        body,
        '<!--\\[DEBT_BODY_START\\]-->',
        'paragraph',
        '<!--\\[DEBT_BODY_START\\]-->[^\\n]*\\.?'
      )
      .catch(err => console.log(err))
  ).toBe(
    "Currently, the logic for logging in with social accounts is at the view layer in the app. It needs to be moved out into a helper class and we should utilize the ViewModel appropriately to give the View what it needs. Let's keep our views as dumb as possible for readability and maintainability."
  )
})
test('line body regex', async () => {
  await expect(
    await functions
      .parseContent(
        body,
        '<!--\\[DEBT_BODY_START\\]-->',
        'line',
        '<!--\\[DEBT_BODY_START\\]-->[^.\\n]*\\.?'
      )
      .catch(err => console.log(err))
  ).toBe(
    'Currently, the logic for logging in with social accounts is at the view layer in the app'
  )
})
test('regex body regex', async () => {
  await expect(
    await functions
      .parseContent(
        body,
        '<!--\\[DEBT_BODY_START\\]-->',
        'regex',
        '<!--\\[DEBT_BODY_END\\]-->'
      )
      .catch(err => console.log(err))
  ).toBe(
    "Currently, the logic for logging in with social accounts is at the view layer in the app. It needs to be moved out into a helper class and we should utilize the ViewModel appropriately to give the View what it needs. Let's keep our views as dumb as possible for readability and maintainability. \r\n A second paragraph to showcase how an end descriptor can be used too"
  )
})
test('modeSwitch compiles correctly (paragraph)', async () => {
  await expect(
    await functions.modeSwitch(
      'title',
      'paragraph',
      '<!--\\[DEBT_BODY_START\\]-->'
    )
  ).toBe('<!--\\[DEBT_BODY_START\\]-->[^\\n]*\\.?')
})
test('modeSwitch compiles correctly (line)', async () => {
  await expect(
    await functions.modeSwitch('title', 'line', '<!--\\[DEBT_BODY_START\\]-->')
  ).toBe('<!--\\[DEBT_BODY_START\\]-->[^.\\n]*\\.?')
})
