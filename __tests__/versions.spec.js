jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('@actions/http-client')

import { mocks } from '@actions/core'
import { createCommentMock, contextMock, pr } from '@actions/github'
import { listResourcesMock } from '@actions/http-client'
import { runAction } from '../src/runAction'
import { mockFetchResource } from './utils'

beforeEach(() => {
  jest.resetAllMocks()
  contextMock.mockReturnValue(pr)
})

it.only('should allow customizing the left and right versions', async () => {
  mocks.projectId.mockReturnValue('project-id')
  mocks.leftVersion.mockReturnValue('left')
  mocks.rightVersion.mockReturnValue('right')

  listResourcesMock.mockImplementation((url) => {
    const version = url.includes('/left') ? 'left' : 'right'
    const key = `project-id/${version}/es/common`

    return [{ url: `https://api.locize.app/${key}`, key }]
  })

  mockFetchResource(
    { 'es/common': { foo: 'bar' } },
    { 'es/common': { foo: 'baz' } }
  )

  await runAction()
  expect(createCommentMock).toHaveBeenCalledTimes(1)
  expect(createCommentMock.mock.calls[0][0].issue_number).toBe(123)
  expect(createCommentMock.mock.calls[0][0].body).toMatchSnapshot()
})
