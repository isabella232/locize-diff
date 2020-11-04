import { getJSON, listResources } from './api'
import { Dict, ResourceCollection } from './types'

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
