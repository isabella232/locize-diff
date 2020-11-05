jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('@actions/http-client')

import { setFailed } from '@actions/core'
import { contextMock, createCommentMock, prComment } from '@actions/github'
import { runAction } from '../../src/runAction'

beforeEach(() => {
  jest.resetAllMocks()
  contextMock.mockReturnValue(prComment('@locize-diff copy'))
})

it('should throw a not implemented error', async () => {
  await runAction()
  expect(setFailed).toHaveBeenCalledWith('Not implemented yet')
  expect(createCommentMock).not.toHaveBeenCalled()
})
