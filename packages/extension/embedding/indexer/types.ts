export const EMBEDDING_INDEX_VERSION = 1

export type EmbeddingMergeStrategy = 'weighted' | 'attention' | 'max'

export type EmbeddingIndexOptions = {
  mergeStrategy: EmbeddingMergeStrategy
  decayRate: number
}

export type NodeSnapshot = {
  id: string
  name: string
  type: string
  visible: boolean
  x: number
  y: number
  width: number
  height: number
  children?: Array<{ id: string; visible: boolean }>
  layoutMode?: string
  primaryAxisAlignItems?: string
  itemSpacing?: number
  fills?: unknown[] | null
  strokes?: unknown[] | null
  strokeWeight?: number
  cornerRadius?: number
  topLeftRadius?: number
  topRightRadius?: number
  bottomLeftRadius?: number
  bottomRightRadius?: number
  opacity?: number
  locked?: boolean
  rotation?: number
  blendMode?: string
  effects?: Array<{ type: string; visible?: boolean }> | null
  characters?: string
}

export type CachedVectorEntry = {
  nodeId: string
  sig: string
  vec: number[]
}

export type EmbeddingIndexInitRequest = {
  type: 'init'
  docKey: string
  options: EmbeddingIndexOptions
  cached: CachedVectorEntry[]
}

export type EmbeddingIndexProcessRequest = {
  type: 'process'
  docKey: string
  options: EmbeddingIndexOptions
  nodes: NodeSnapshot[]
}

export type EmbeddingIndexRequestPayload = EmbeddingIndexInitRequest | EmbeddingIndexProcessRequest

export type EmbeddingIndexInitResponse = {
  type: 'init'
  docKey: string
  cachedCount: number
}

export type EmbeddingIndexProcessResponse = {
  type: 'process'
  docKey: string
  processed: number
  cacheHits: number
  updated: number
  changed: CachedVectorEntry[]
}

export type EmbeddingIndexResponsePayload = EmbeddingIndexInitResponse | EmbeddingIndexProcessResponse

