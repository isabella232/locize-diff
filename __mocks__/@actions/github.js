export const listFilesMock = jest.fn()
export const createCommentMock = jest.fn()
export const updateCommentMock = jest.fn()
export const listCommentsMock = jest.fn()
export const graphqlMock = jest.fn()

const wrapResponse = () => async () => ({
  data: listCommentsMock() ?? [],
})

export const getOctokit = () => ({
  graphql: graphqlMock,
  issues: {
    createComment: createCommentMock,
    listComments: wrapResponse(listCommentsMock),
    updateComment: updateCommentMock,
  },
  pulls: {
    listFiles: wrapResponse(listFilesMock),
  },
})

export const context = {
  payload: {
    pull_request: {},
  },
  issue: {
    number: 123,
  },
}

export const draftMock = jest.fn()

Object.defineProperty(context.payload.pull_request, 'draft', {
  get: draftMock.mockReturnValue(false),
})
