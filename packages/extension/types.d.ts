interface Window {
  figma: PluginAPI
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpackChunk_figma_web_bundler: any[] & { push: (...args: any[]) => any }
  tempadTools?: Partial<import('@/mcp/runtime').MCPHandlers>
  embedding?: {
    getEmbedding: () => void
    createNodeEmbedding?: (node: SceneNode, options?: import('@/embedding/node-embedder').EmbeddingOptions) => import('@/embedding/node-embedder').EmbeddingVector
    createTreeEmbedding?: (node: SceneNode, options?: import('@/embedding/node-embedder').EmbeddingOptions) => import('@/embedding/node-embedder').EmbeddingVector[]
    createMergedTreeEmbedding?: (node: SceneNode, options?: import('@/embedding/node-embedder').EmbeddingOptions) => import('@/embedding/node-embedder').EmbeddingVector
    cosineSimilarity?: (vec1: import('@/embedding/node-embedder').EmbeddingVector, vec2: import('@/embedding/node-embedder').EmbeddingVector) => number
    euclideanDistance?: (vec1: import('@/embedding/node-embedder').EmbeddingVector, vec2: import('@/embedding/node-embedder').EmbeddingVector) => number
    findMostSimilarNodes?: (queryNode: SceneNode, candidateNodes: SceneNode[], topK?: number) => Array<{ node: SceneNode; similarity: number }>
    getEmbeddingDimension?: () => number
    createPageEmbeddings?: (options?: import('@/embedding/node-embedder').EmbeddingOptions) => import('@/embedding/node-embedder').EmbeddingVectors
    selectNodeById?: (nodeId: string) => boolean
    getSelectedNode?: () => SceneNode | null
    findMostSimilar?: (vectors: import('@/embedding/node-embedder').EmbeddingVectors, targetVector?: import('@/embedding/node-embedder').EmbeddingVector) => import('@/embedding/node-embedder').SimilarityResult | null
  }
}

declare const __DEV__: boolean
