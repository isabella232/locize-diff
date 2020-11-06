import { getInput } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { credits } from './message'

const octokit = getOctokit(getInput('token'))

export const minimizeComment = `
mutation($subjectId: ID!) {
  minimizeComment(input: { subjectId: $subjectId, classifier: RESOLVED }) {
    clientMutationId
  }
}
`

export const unminimizeComment = `
mutation($subjectId: ID!) {
  unminimizeComment(input: { subjectId: $subjectId }) {
    clientMutationId
  }
}
`

export async function runGraphql(query: string, id: string) {
  await octokit.graphql(query, { subjectId: id })
}

export async function getComment() {
  const { data: comments } = await octokit.issues.listComments({
    ...context.repo,
    issue_number: context.issue.number,
  })

  return comments.find(({ body }) => body.includes(credits))
}

export async function createComment(body: string) {
  await octokit.issues.createComment({
    ...context.repo,
    body,
    issue_number: context.issue.number,
  })
}
