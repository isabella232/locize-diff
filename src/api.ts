import { getInput } from '@actions/core'
import { HttpClient } from '@actions/http-client'
import { BearerCredentialHandler } from '@actions/http-client/auth'
import { ResourceCollection, Dict } from './utils/types'

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

export async function collectResources(
  projectId: string,
  version: string
): Promise<ResourceCollection[]> {
  const resources = await listResources(projectId, version)
  const promises = resources.map(async (resource) => {
    const [language, namespace] = resource.url.split('/').slice(-2)
    const url = resource.url.replace(projectId, `pull/${projectId}`)

    return {
      key: `${language}/${namespace}`,
      resources: await getJSON<Dict>(url),
    }
  })

  return Promise.all(promises)
}
