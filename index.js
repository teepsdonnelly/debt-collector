const core = require('@actions/core');
const github = require('@actions/github');

try {

  // Get the body of our PR so we can parse it
  const prBody = github.context.payload.pull_request.body;
  // TODO: <-- Hey look, tech debt...
  // Probably use enums and make these descriptors a little cleaner
  const debtIssueTitle = parseContent(prBody, "[DEBT_ISSUE_TITLE]");
  const debtIssueBody = parseContent(prBody, "[DEBT_ISSUE_BODY]");

  if (debtIssueTitle == "" || !debtIssueTitle) {
    core.setFailed("You must at least provide a value for [DEBT_ISSUE_TITLE]")
  } else {
    createIssue(debtIssueTitle, debtIssueBody)
  }

} catch (error) {

  core.setFailed(error.message);

}

// Look for a particular descriptor in [STRING] format
// Get the trimmed String after it up to the next new line
// GitHub uses \r\n for new lines
function parseContent(body, descriptor) {

  const descriptorStartIndex = body.indexOf(descriptor);

  if (descriptorStartIndex == -1) {
  	return "";
  }

  const contentStartIndex = descriptorStartIndex + body.substring(descriptorStartIndex).indexOf(descriptor) + descriptor.length;

  var contentEndIndex = contentStartIndex + body.substring(contentStartIndex).indexOf("\r\n");

  if (contentEndIndex < contentStartIndex) {
  	contentEndIndex = body.length;
  }

  const content = body.substring(contentStartIndex, contentEndIndex).trim();

  if (content.length == 0) {
    return "";
  }

  return content;

}

// Create issue
function createIssue(issueTitle, issueBody) {

  async function run() {
      const github = require('@actions/github');
      const context = github.context;
      const myToken = core.getInput('myToken');
      const octokit = new github.GitHub(myToken);

      const newIssue = await octokit.issues.create({
        ...context.repo,
        title: "[DEBT] " + issueTitle,
        body: issueBody
      });

      console.log("Issue created: [DEBT] " + issueTitle);
  }

  run();

}
