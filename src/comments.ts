import { getInput } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { credits } from './message'

const octokit = getOctokit(getInput('token'))

const query = `
mutation($subjectId: ID!) {
  minimizeComment(input: { subjectId: $subjectId, classifier: RESOLVED }) {
    clientMutationId
  }
}
`

export async function minimizeComment(id: string) {
  await octokit.graphql(query, { subjectId: id })
}

export async function getComment() {
  const { data: comments } = await octokit.issues.listComments({
    ...context.repo,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    issue_number: context.payload.pull_request!.number,
  })

  return comments.find(({ body }) => body.includes(credits))
}
