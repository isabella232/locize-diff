export const listResourcesMock = jest.fn()
export const fetchResourceMock = jest.fn()
export const postJsonMock = jest.fn()

export class HttpClient {
  async get(url) {
    return {
      readBody: async () => {
        const mock = url.includes('/download/')
          ? listResourcesMock
          : url.includes('/pull/')
          ? fetchResourceMock
          : null

        return JSON.stringify(mock(url))
      },
    }
  }

  postJson = postJsonMock
}
