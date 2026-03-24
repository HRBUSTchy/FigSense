import {
  createNodeEmbedding,
  createTreeEmbedding,
  createMergedTreeEmbedding,
  cosineSimilarity,
  euclideanDistance,
  findMostSimilarNodes,
  getEmbeddingDimension,
  createPageEmbeddings,
  selectNodeById,
  getSelectedNode,
  findMostSimilar,
  type EmbeddingVector,
  type EmbeddingOptions
} from './node-embedder'
import { createStructureEmbedding, type ComponentStructure } from './structure-embedding'

export const InjectToWindow = ()=>{
  window.embedding = {
    createNodeEmbedding,
    createTreeEmbedding,
    createMergedTreeEmbedding,
    cosineSimilarity,
    euclideanDistance,
    findMostSimilarNodes,
    getEmbeddingDimension,
    createPageEmbeddings,
    selectNodeById,
    getSelectedNode,
    findMostSimilar,
    getEmbedding: () => {
      return console.log(figma.currentPage)
    }
  }
}

export type { EmbeddingVector, EmbeddingOptions }
export type { ComponentStructure }
export { createStructureEmbedding }
