"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const spacer = '\r\n\r\n';
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const prBody = github.context.payload.pull_request.body;
            const options = {
                titlePrefix: core.getInput('title_prefix'),
                titleRegex: core.getInput('title_regex'),
                bodyStartRegex: core.getInput('body_start_regex'),
                bodyEndRegex: core.getInput('body_end_regex')
            };
            const debtIssueTitle = yield parseContent(prBody, options.titleRegex).catch(err => {
                core.setFailed(err);
            });
            const debtIssueBody = yield parseContent(prBody, options.bodyStartRegex, options.bodyEndRegex).catch(err => {
                core.setFailed(err);
                return '';
            });
            if (debtIssueTitle == '' || !debtIssueTitle) {
                core.setFailed('You must at least provide a value for [DEBT_ISSUE_TITLE]');
            }
            else {
                createIssue(options.titlePrefix, debtIssueTitle, debtIssueBody);
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function parseContent(body, StartRegex, EndRegex) {
    return new Promise(resolve => {
        const contentStart = body.match(`/${StartRegex}/im`);
        if (!contentStart || !contentStart.index)
            throw new Error('Start not matched');
        const contentStartIndex = contentStart.index;
        var contentEndIndex;
        if (EndRegex != undefined) {
            const contentEnd = body.match(`/${EndRegex}/im`);
            if (!contentEnd || !contentEnd.index)
                throw new Error('End not matched');
            contentEndIndex = contentEnd.index;
        }
        else {
            const contentEnd = body.match(`/${StartRegex}[^.\\n]*\\.?/im`);
            if (!contentEnd || !contentEnd.index)
                throw new Error('End not matched');
            contentEndIndex = contentEnd.length + contentEnd.index;
        }
        const content = body.substring(contentStartIndex, contentEndIndex).trim();
        if (content.length == 0) {
            throw new Error('Content Length is 0');
        }
        resolve(content);
    });
}
function createIssue(titlePrefix, issueTitle, issueBody) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = github.context;
        const myToken = core.getInput('token');
        const octokit = new github.GitHub(myToken);
        const prHtmlURL = context.payload.pull_request.html_url;
        const newIssue = yield octokit.issues.create(Object.assign(Object.assign({}, context.repo), { title: titlePrefix + ' ' + issueTitle, body: issueBody +
                spacer +
                'See the [Pull Request that created this Issue](' +
                prHtmlURL +
                ')' }));
        console.log('Issue created: ' + titlePrefix + ' ' + issueTitle);
    });
}
run();
