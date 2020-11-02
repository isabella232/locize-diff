import { HttpClient } from '@actions/http-client'

const client = new HttpClient()

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
