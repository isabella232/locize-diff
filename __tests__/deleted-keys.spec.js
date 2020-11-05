jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('@actions/http-client')

import { mocks } from '@actions/core'
import { createCommentMock, contextMock, pr } from '@actions/github'
import { runAction } from '../src/runAction'
import { mockFetchResource, mockListResources } from './utils'

beforeEach(() => {
  jest.resetAllMocks()
  contextMock.mockReturnValue(pr)

  mockListResources((version) => [`projectId/${version}/en-US/translation`])
  mockFetchResource(
    { 'en-US/translation': { new: 'upcoming', current: 'active' } },
    { 'en-US/translation': { current: 'changed', old: 'gone' } }
  )
})

it('should ignore deleted keys when ignoreDeletedKeys is true', async () => {
  mocks.ignoreDeletedKeys.mockReturnValue('true')
  await runAction()

  expect(createCommentMock).toHaveBeenCalledTimes(1)
  expect(createCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(createCommentMock.mock.calls[0][0].body).toMatchSnapshot()
})

it('should not ignore deleted keys when ignoreDeletedKeys is false', async () => {
  mocks.ignoreDeletedKeys.mockReturnValue('false')
  await runAction()

  expect(createCommentMock).toHaveBeenCalledTimes(1)
  expect(createCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(createCommentMock.mock.calls[0][0].body).toMatchSnapshot()
})
