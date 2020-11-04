import { getInput } from '@actions/core'
import { HttpClient } from '@actions/http-client'
import { BearerCredentialHandler } from '@actions/http-client/auth'

const authHandler = new BearerCredentialHandler(getInput('apiKey'))
const client = new HttpClient(undefined, [authHandler])

export function getJSON<T>(url: string): Promise<T> {
  return client
    .get(url)
    .then((res) => res.readBody())
    .then((res) => JSON.parse(res))
}

interface ListResourcesResponse {
  key: string
  lastModified: string
  size: number
  url: string
}

export async function listResources(
  projectId: string,
  version: string
): Promise<ListResourcesResponse[]> {
  return getJSON(`https://api.locize.app/download/${projectId}/${version}`)
}
