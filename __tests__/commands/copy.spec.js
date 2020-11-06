jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('@actions/http-client')

import { mocks } from '@actions/core'
import {
  contextMock,
  createCommentMock,
  graphqlMock,
  listCommentsMock,
  prComment,
  updateCommentMock,
} from '@actions/github'
import { postJsonMock } from '@actions/http-client'
import { runAction } from '../../src/runAction'
import { createMessage } from '../../src/utils/message'
import { mockFetchResource, mockListResources, sampleComment } from '../utils'

beforeEach(() => {
  jest.resetAllMocks()
  contextMock.mockReturnValue(prComment('@locize-diff copy'))
  mockListResources((version) => [`projectId/${version}/en-US/translation`])
})

it("should display the diff without copying if the user hasn't run the diff yet", async () => {
  mockFetchResource(
    { 'en-US/translation': { foo: 'bar' } },
    { 'en-US/translation': { foo: 'baz' } }
  )

  await runAction()
  expect(postJsonMock).not.toHaveBeenCalled()
  expect(createCommentMock).toHaveBeenCalledTimes(1)
  expect(createCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(createCommentMock.mock.calls[0][0].body).toMatchSnapshot()
})

it('should not copy the diffs if they have changed since the last comment', async () => {
  listCommentsMock.mockReturnValue([{ body: sampleComment }])
  mockFetchResource(
    { 'en-US/translation': { foo: 'bar' } },
    { 'en-US/translation': { foo: 'oops' } }
  )

  await runAction()
  expect(postJsonMock).not.toHaveBeenCalled()
  expect(updateCommentMock).toHaveBeenCalledTimes(1)
  expect(updateCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(updateCommentMock.mock.calls[0][0].body).toMatchSnapshot()
  expect(createCommentMock).toHaveBeenCalledTimes(1)
  expect(createCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(createCommentMock.mock.calls[0][0].body).toMatchInlineSnapshot(
    `"@somebody Looks like the diffs have changed since you lasted checked. Please review the diffs and then run \`@locize-diff copy\` again."`
  )
})

it('should not copy any changes if there are no diffs', async () => {
  mockFetchResource(
    { 'en-US/translation': { foo: 'bar' } },
    { 'en-US/translation': { foo: 'bar' } }
  )

  await runAction()
  expect(postJsonMock).not.toHaveBeenCalled()
  expect(createCommentMock).toHaveBeenCalledTimes(1)
  expect(createCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(createCommentMock.mock.calls[0][0].body).toMatchInlineSnapshot(
    `"@somebody I'd like to help, but I didn't find any diffs in Locize to copy. Did you already copy your changes?"`
  )
})

it('should minimize the comment if there are no longer any diffs', async () => {
  listCommentsMock.mockReturnValue([{ body: sampleComment, node_id: 1 }])
  mockFetchResource(
    { 'en-US/translation': { foo: 'bar' } },
    { 'en-US/translation': { foo: 'bar' } }
  )

  await runAction()
  expect(postJsonMock).not.toHaveBeenCalled()
  expect(graphqlMock).toHaveBeenCalledWith(expect.anything(), { subjectId: 1 })
  expect(createCommentMock).toHaveBeenCalledTimes(1)
  expect(createCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(createCommentMock.mock.calls[0][0].body).toMatchInlineSnapshot(
    `"@somebody I'd like to help, but I didn't find any diffs in Locize to copy. Did you already copy your changes?"`
  )
})

it('should copy changes if the diffs match', async () => {
  mocks.projectId.mockReturnValue('project-a')
  mocks.leftVersion.mockReturnValue('one')
  mocks.rightVersion.mockReturnValue('two')

  listCommentsMock.mockReturnValue([
    {
      body: createMessage([
        {
          diffs: {
            foo: { left: 'bar', right: 'baz' },
            newKey: { left: 'value' },
          },
          key: 'en-US/translation',
        },
      ]),
    },
  ])

  mockListResources((version) => [`project-a/${version}/en-US/translation`])
  mockFetchResource(
    { 'en-US/translation': { foo: 'bar', hi: 'ho', newKey: 'value' } },
    { 'en-US/translation': { foo: 'baz', hi: 'ho' } }
  )

  await runAction()
  expect(createCommentMock).toHaveBeenCalledTimes(1)
  expect(createCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(createCommentMock.mock.calls[0][0].body).toMatchInlineSnapshot(
    `"@somebody Congratulations! Your changes have been successfully copied from one to two."`
  )
  expect(postJsonMock).toHaveBeenCalledWith(
    'https://api.locize.app/update/project-a/two/en-US/translation',
    {
      foo: 'bar',
      newKey: 'value',
    }
  )
})
