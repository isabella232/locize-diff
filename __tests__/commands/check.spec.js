jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('@actions/http-client')

import {
  contextMock,
  createCommentMock,
  graphqlMock,
  listCommentsMock,
  prComment,
  updateCommentMock,
} from '@actions/github'
import { runAction } from '../../src/runAction'
import { mockFetchResource, mockListResources, sampleComment } from '../utils'

beforeEach(() => {
  jest.resetAllMocks()
  contextMock.mockReturnValue(prComment('@locize-diff check'))
})

it('should allow manually requesting a diff', async () => {
  mockListResources((version) => [`projectId/${version}/en-US/translation`])
  mockFetchResource(
    { 'en-US/translation': { foo: 'bar', hi: 'ho' } },
    { 'en-US/translation': { foo: 'baz', hi: 'ho' } }
  )

  await runAction()
  expect(createCommentMock).toHaveBeenCalledTimes(1)
  expect(createCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(createCommentMock.mock.calls[0][0].body).toMatchSnapshot()
})

it('should notify the user when updating an existing comment', async () => {
  listCommentsMock.mockReturnValue([{ body: sampleComment }])
  mockListResources((version) => [`projectId/${version}/en-US/translation`])
  mockFetchResource(
    { 'en-US/translation': { foo: 'bar', hi: 'ho' } },
    { 'en-US/translation': { foo: 'baz', hi: 'howdy' } }
  )

  await runAction()

  // Updates the diff with the new diff
  expect(updateCommentMock).toHaveBeenCalledTimes(1)
  expect(updateCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(updateCommentMock.mock.calls[0][0].body).toMatchSnapshot()

  // Adds a message telling the user the comment was updated
  expect(createCommentMock).toHaveBeenCalledTimes(1)
  expect(createCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(createCommentMock.mock.calls[0][0].body).toMatchInlineSnapshot(
    `"@somebody I found some new diffs since the last time I checked. Take a look at the comment to see what changed."`
  )
})

it('should notify the user when resolving a comment', async () => {
  listCommentsMock.mockReturnValue([{ body: sampleComment, node_id: 3 }])
  mockListResources((version) => [`projectId/${version}/en-US/translation`])
  mockFetchResource(
    { 'en-US/translation': { foo: 'bar' } },
    { 'en-US/translation': { foo: 'bar' } }
  )

  await runAction()

  // Minimizes the comment
  expect(graphqlMock).toHaveBeenCalledWith(expect.anything(), { subjectId: 3 })

  // Adds a message telling the user the comment was minimized
  expect(createCommentMock).toHaveBeenCalledTimes(1)
  expect(createCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(createCommentMock.mock.calls[0][0].body).toMatchInlineSnapshot(
    `"@somebody Looks like there are no longer any diffs, so I went ahead and resolved the outdated comment."`
  )
})

it('should notify the user when there are no diffs', async () => {
  mockListResources((version) => [`projectId/${version}/en-US/translation`])
  mockFetchResource(
    { 'en-US/translation': { foo: 'bar' } },
    { 'en-US/translation': { foo: 'bar' } }
  )

  await runAction()
  expect(createCommentMock).toHaveBeenCalledTimes(1)
  expect(createCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(createCommentMock.mock.calls[0][0].body).toMatchInlineSnapshot(
    `"@somebody Good news! I didn't find any diffs so everything in Locize is up to date!"`
  )
})
