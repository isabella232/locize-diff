export const listResourcesMock = jest.fn()
export const fetchResourceMock = jest.fn()

function getMock(url) {
  if (url.includes('/download/')) {
    return listResourcesMock
  } else if (url.includes('/pull/')) {
    return fetchResourceMock
  }
}

export class HttpClient {
  async get(url) {
    return {
      // readBody: async () => JSON.stringify('[]'),
      readBody: async () => JSON.stringify(getMock(url)(url)),
    }
  }
}
