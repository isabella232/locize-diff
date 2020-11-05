import { getInput } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { collectResources } from '../api'
import {
  getComment,
  minimizeComment,
  runGraphql,
  unminimizeComment,
} from '../utils/comments'
import { diffResources } from '../utils/diff'
import { createMessage } from '../utils/message'

export type DiffResult =
  | 'comment-created'
  | 'comment-updated'
  | 'comment-minimized'
  | 'no-diffs'

export async function runDiff(): Promise<DiffResult> {
  const projectId = getInput('projectId')
  const leftVersion = getInput('leftVersion')
  const rightVersion = getInput('rightVersion')

  const octokit = getOctokit(getInput('token'))
  const left = await collectResources(projectId, leftVersion)
  const right = await collectResources(projectId, rightVersion)
  const diffs = diffResources(left, right)
  const comment = await getComment()

  if (diffs.length) {
    const req = {
      ...context.repo,
      body: createMessage(diffs),
      issue_number: context.issue.number,
    }

    if (comment) {
      if (comment.body !== req.body) {
        await octokit.issues.updateComment({ ...req, comment_id: comment.id })
        await runGraphql(unminimizeComment, comment.node_id)
        return 'comment-updated'
      }
    } else {
      await octokit.issues.createComment(req)
      return 'comment-created'
    }
  }

  // If the comment exists and there are no longer any diffs, we minimize the
  // comment so it no longer shows in the GitHub UI.
  if (comment) {
    await runGraphql(minimizeComment, comment.node_id)
    return 'comment-minimized'
  }

  return 'no-diffs'
}
