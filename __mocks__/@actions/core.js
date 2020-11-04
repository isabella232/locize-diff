export const mocks = {
  projectId: jest.fn(),
  projectSlug: jest.fn(),
  apiKey: jest.fn(),
  leftVersion: jest.fn(),
  rightVersion: jest.fn(),
  includeDrafts: jest.fn(),
  ignoreDeletedKeys: jest.fn(),
}

const defaults = {
  projectId: 'projectId',
  apiKey: 'apiKey',
  leftVersion: 'latest',
  rightVersion: 'production',
  includeDrafts: 'false',
  ignoreDeletedKeys: 'true',
}

export function getInput(key) {
  return mocks[key]?.() ?? defaults[key]
}

export const setFailed = jest.fn()
