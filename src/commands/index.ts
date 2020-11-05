import { getInput } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { runCopy } from './copy'
import { runDiff, DiffResult } from './check'

async function reportResult<T extends string>(
  result: T,
  messages: Partial<Record<T, string>>
) {
  // If we don't have a message defined for this specific result, we don't need
  // to add a comment so we can exit early.
  if (!messages[result]) return

  const octokit = getOctokit(getInput('token'))
  const body = `@${context.actor} ${messages[result]}`

  await octokit.issues.createComment({
    ...context.repo,
    body,
    issue_number: context.issue.number,
  })
}

export async function runCommand() {
  const comment = context.payload.comment?.body ?? ''
  const match = comment.match(/@locize-diff\s(check|copy)/)
  const command = match?.[1]

  switch (command) {
    case 'check': {
      const result = await runDiff()

      return reportResult<DiffResult>(result, {
        'comment-minimized':
          'Looks like there are no longer any diffs, so I went ahead and resolved the outdated comment.',
        'comment-updated':
          'I found some new diffs since the last time I checked. Take a look at the comment to see what changed.',
        'no-diffs':
          "Good news! I didn't find any diffs so everything in Locize is up to date!",
      })
    }

    case 'copy': {
      return runCopy()
    }
  }
}
