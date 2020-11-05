export type Dict = Record<string, string>

export interface ResourceCollection {
  key: string
  resources: Dict
}

export interface ResourceDiff {
  key: string
  diffs: Record<string, { left?: string; right?: string }>
}
