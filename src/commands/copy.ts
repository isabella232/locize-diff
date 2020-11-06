import { getInput } from '@actions/core'
import { context } from '@actions/github'
import { updateTranslations } from '../api'
import { getComment, minimizeComment, runGraphql } from '../utils/comments'
import { getDiffs, updateDiffComment } from '../utils/diff'
import { createMessage } from '../utils/message'
import { ResourceDiff } from '../utils/types'

async function copyDiffs(diffs: ResourceDiff[]) {
  const promises = diffs.map((diff) => {
    // Convert the diffs to an object containing the translation keys and their
    // new values.
    const updates = Object.entries(diff.diffs).reduce((acc, [key, value]) => {
      // If `ignoreDeletedKeys` is set to false, the left side of the diff could
      // be undefined so we need to set it's value to null to delete it from
      // the right version in Locize.
      acc[key] = value.left ?? null
      return acc
    }, {} as Record<string, string | null>)

    return updateTranslations(diff.key, updates)
  })

  await Promise.all(promises)
}

export async function runCopy() {
  const diffs = await getDiffs()
  const comment = await getComment()

  if (!diffs.length) {
    // If the comment exists, minimize it now that there are no diffs.
    if (comment) {
      await runGraphql(minimizeComment, comment.node_id)
    }

    return `I'd like to help, but I didn't find any diffs in Locize to copy. Did you already copy your changes?`
  }

  if (!comment) {
    const issueType = context.payload.pull_request ? 'pull request' : 'issue'

    return createMessage(
      diffs,
      `It looks like you haven't checked for diffs in this ${issueType} yet. Please check the diffs in this comment and then run \`@locize-diff copy\` again.`
    )
  }

  const body = createMessage(diffs)

  if (comment.body !== body) {
    await updateDiffComment(comment, body)
    return 'Looks like the diffs have changed since you lasted checked. Please review the diffs and then run `@locize-diff copy` again.'
  }

  // Copy the changes to locize
  await copyDiffs(diffs)

  // If the copy succeeds, we can minimize the comment since it is now outdated.
  await runGraphql(minimizeComment, comment.node_id)

  const leftVersion = getInput('leftVersion')
  const rightVersion = getInput('rightVersion')

  return `Congratulations! Your changes have been successfully copied from ${leftVersion} to ${rightVersion}.`
}
