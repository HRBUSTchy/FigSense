export type { EmbeddingVector, EmbeddingOptions, PaintList, EmbeddingVectors, SimilarityResult } from './types.js'
export { NODE_TYPES, LAYOUT_MODES, ALIGNMENT_VALUES } from './types.js'

export { hashString, normalizeValue, oneHotEncode } from './utils.js'

export {
  extractColorFeatures,
  extractLayoutFeatures,
  extractTextFeatures,
  extractHierarchyFeatures,
  extractNameFeatures,
  extractChildSignatureFeatures,
  extractSubtreeStatsFeatures
} from './features.js'

export {
  mergeVectorsWeighted,
  mergeVectorsAttention,
  mergeVectorsMax
} from './merge.js'

export {
  createNodeEmbedding,
  createTreeEmbedding,
  createMergedTreeEmbedding,
  getEmbeddingDimension,
  createPageEmbeddings,
  selectNodeById,
  getSelectedNode,
  findMostSimilar
} from './embedding.js'

export {
  cosineSimilarity,
  euclideanDistance,
  findMostSimilarNodes
} from './similarity.js'
