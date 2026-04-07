interface Window {
  figma: PluginAPI
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpackChunk_figma_web_bundler: any[] & { push: (...args: any[]) => any }
  tempadTools?: Partial<import('@/mcp/runtime').MCPHandlers>
  embedding?: {
    getEmbedding: () => void
    serializeSelectedNode?: (options?: {
      maxDepth?: number
      includeInvisible?: boolean
      print?: boolean
    }) => string | null
    createNodeEmbedding?: (node: import('@/embedding/node-embedder').EmbeddableNode, options?: import('@/embedding/node-embedder').EmbeddingOptions) => import('@/embedding/node-embedder').EmbeddingVector
    createTreeEmbedding?: (node: import('@/embedding/node-embedder').EmbeddableNode, options?: import('@/embedding/node-embedder').EmbeddingOptions) => import('@/embedding/node-embedder').EmbeddingVector[]
    createMergedTreeEmbedding?: (node: import('@/embedding/node-embedder').EmbeddableNode, options?: import('@/embedding/node-embedder').EmbeddingOptions) => import('@/embedding/node-embedder').EmbeddingVector
    cosineSimilarity?: (vec1: import('@/embedding/node-embedder').EmbeddingVector, vec2: import('@/embedding/node-embedder').EmbeddingVector) => number
    euclideanDistance?: (vec1: import('@/embedding/node-embedder').EmbeddingVector, vec2: import('@/embedding/node-embedder').EmbeddingVector) => number
    findMostSimilarNodes?: (queryNode: import('@/embedding/node-embedder').EmbeddableNode, candidateNodes: import('@/embedding/node-embedder').EmbeddableNode[], topK?: number) => Array<{ node: import('@/embedding/node-embedder').EmbeddableNode; similarity: number }>
    getEmbeddingDimension?: () => number
    createPageEmbeddings?: (options?: import('@/embedding/node-embedder').EmbeddingOptions) => import('@/embedding/node-embedder').EmbeddingVectors
    selectNodeById?: (nodeId: string) => boolean
    getSelectedNode?: () => SceneNode | null
    findMostSimilar?: (vectors: import('@/embedding/node-embedder').EmbeddingVectors, targetVector?: import('@/embedding/node-embedder').EmbeddingVector) => import('@/embedding/node-embedder').SimilarityResult | null
  }
}

declare const __DEV__: boolean
