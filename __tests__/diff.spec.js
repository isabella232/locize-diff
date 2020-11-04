jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('@actions/http-client')

import { mocks } from '@actions/core'
import {
  createCommentMock,
  listCommentsMock,
  updateCommentMock,
} from '@actions/github'
import { createMessage } from '../src/message'
import { runAction } from '../src/runAction'
import { mockListResources, mockFetchResource } from './utils'

beforeEach(() => {
  jest.resetAllMocks()
})

it('should add a comment when there are diffs', async () => {
  mocks.projectId.mockReturnValue('project-a')
  mockListResources((version) => [`project-a/${version}/en-US/translation`])
  mockFetchResource(
    { 'en-US/translation': { foo: 'bar', hi: 'ho' } },
    { 'en-US/translation': { foo: 'baz', hi: 'ho' } }
  )

  await runAction()
  expect(createCommentMock).toHaveBeenCalledTimes(1)
  expect(createCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(createCommentMock.mock.calls[0][0].body).toMatchSnapshot()
})

it('should not a comment when there are diffs', async () => {
  mockListResources((version) => [`projectId/${version}/en-US/translation`])
  mockFetchResource(
    { 'en-US/translation': { foo: 'bar', hi: 'ho' } },
    { 'en-US/translation': { foo: 'bar', hi: 'ho' } }
  )

  await runAction()
  expect(createCommentMock).not.toHaveBeenCalled()
})

const sampleComment = createMessage([
  {
    diffs: {
      foo: { left: 'bar', right: 'baz' },
    },
    key: 'en-US/translation',
  },
])

it('should not comment if the comment already exists', async () => {
  listCommentsMock.mockReturnValue([{ body: sampleComment, id: 1 }])
  mockListResources((version) => [`projectId/${version}/en-US/translation`])
  mockFetchResource(
    { 'en-US/translation': { foo: 'bar', hi: 'ho' } },
    { 'en-US/translation': { foo: 'baz', hi: 'ho' } }
  )

  await runAction()
  expect(createCommentMock).not.toHaveBeenCalled()
  expect(updateCommentMock).not.toHaveBeenCalled()
})

it('should update the existing comment if it exists', async () => {
  listCommentsMock.mockReturnValue([{ body: sampleComment, id: 2 }])
  mockListResources((version) => [`projectId/${version}/en-US/translation`])
  mockFetchResource(
    { 'en-US/translation': { foo: 'bar', hi: 'ho' } },
    { 'en-US/translation': { foo: 'baz', hi: 'howdy' } }
  )

  await runAction()
  expect(createCommentMock).not.toHaveBeenCalled()
  expect(updateCommentMock).toHaveBeenCalledTimes(1)
  expect(updateCommentMock.mock.calls[0][0].comment_id).toBe(2)
  expect(updateCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(updateCommentMock.mock.calls[0][0].body).toMatchSnapshot()
})
