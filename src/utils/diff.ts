import { getInput } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { collectResources } from '../api'
import { runGraphql, unminimizeComment } from './comments'
import { ResourceCollection, ResourceDiff } from './types'
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types'

const octokit = getOctokit(getInput('token'))

function getKeys(left: ResourceCollection, right: ResourceCollection) {
  const keys = Object.keys(left.resources)

  // When including deleted keys, we need to also include the keys from the right
  // side of the comparison. Otherwise, we only include keys from the left side.
  if (getInput('ignoreDeletedKeys') !== 'true') {
    keys.push(...Object.keys(right.resources))
  }

  return keys
}

function diffCollection(
  left: ResourceCollection,
  right: ResourceCollection
): ResourceDiff {
  const diffs = getKeys(left, right)
    .filter((key) => left.resources[key] !== right.resources[key])
    .reduce((acc, key) => {
      acc[key] = {
        left: left.resources[key],
        right: right.resources[key],
      }

      return acc
    }, {} as ResourceDiff['diffs'])

  return { key: left.key, diffs }
}

function diffResources(
  left: ResourceCollection[],
  right: ResourceCollection[]
): ResourceDiff[] {
  return left
    .map((leftItem) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      diffCollection(leftItem, right.find((item) => leftItem.key === item.key)!)
    )
    .filter((diff) => Object.keys(diff.diffs).length)
}

export async function getDiffs() {
  const projectId = getInput('projectId')
  const leftVersion = getInput('leftVersion')
  const rightVersion = getInput('rightVersion')

  const left = await collectResources(projectId, leftVersion)
  const right = await collectResources(projectId, rightVersion)
  return diffResources(left, right)
}

export async function updateDiffComment(
  comment: GetResponseDataTypeFromEndpointMethod<
    typeof octokit.issues.updateComment
  >,
  body: string
) {
  await runGraphql(unminimizeComment, comment.node_id)

  await octokit.issues.updateComment({
    ...context.repo,
    body,
    issue_number: context.issue.number,
    comment_id: comment.id,
  })
}
