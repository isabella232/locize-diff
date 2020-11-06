import { getInput } from '@actions/core'
import { fetchResourceMock, listResourcesMock } from '@actions/http-client'
import { createMessage } from '../src/utils/message'

export function mockListResources(getUrls) {
  listResourcesMock.mockImplementation((url) => {
    const [version] = url.split('/').slice(-1)

    return getUrls(version).map((url) => ({
      url: `https://api.locize.app/${url}`,
      key: url,
    }))
  })
}

export function mockFetchResource(left, right) {
  fetchResourceMock.mockImplementation((url) => {
    const [version, language, namespace] = url.split('/').slice(-3)
    const resource = version === getInput('leftVersion') ? left : right

    return resource[`${language}/${namespace}`]
  })
}

export const sampleComment = createMessage([
  {
    diffs: {
      foo: { left: 'bar', right: 'baz' },
    },
    key: 'en-US/translation',
  },
])
