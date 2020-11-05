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

export const pr = {
  eventName: 'pull_request',
  issue: {
    number: 123,
  },
}

export const prComment = (body) => ({
  eventName: 'issue_comment',
  issue: {
    number: 123,
  },
  payload: {
    comment: {
      id: 492700400,
      node_id: 'MDEyOklzc3VlQ29tbWVudDQ5MjcwMDQwMA==',
      body,
    },
  },
})

export const contextMock = jest.fn()
export const context = new Proxy(
  {},
  { get: (_, property) => contextMock()[property] }
)
