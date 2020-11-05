jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('@actions/http-client')

import { contextMock, createCommentMock, prComment } from '@actions/github'
import { runAction } from '../../src/runAction'
import { mockFetchResource, mockListResources } from '../utils'

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
