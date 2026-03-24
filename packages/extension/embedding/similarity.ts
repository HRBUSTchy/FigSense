import type { EmbeddingVector } from './types.js'

import { createNodeEmbedding } from './embedding.js'

export function cosineSimilarity(vec1: EmbeddingVector, vec2: EmbeddingVector): number {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    norm1 += vec1[i] * vec1[i]
    norm2 += vec2[i] * vec2[i]
  }

  if (norm1 === 0 || norm2 === 0) return 0

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
}

export function euclideanDistance(vec1: EmbeddingVector, vec2: EmbeddingVector): number {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length')
  }

  let sum = 0
  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i]
    sum += diff * diff
  }

  return Math.sqrt(sum)
}

export function findMostSimilarNodes(
  queryNode: SceneNode,
  candidateNodes: SceneNode[],
  topK: number = 5
): Array<{ node: SceneNode; similarity: number }> {
  const queryEmbedding = createNodeEmbedding(queryNode)

  const filteredCandidates = candidateNodes.filter(node => node.id !== queryNode.id)

  const similarities = filteredCandidates
    .map(node => ({
      node,
      similarity: cosineSimilarity(queryEmbedding, createNodeEmbedding(node))
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)

  return similarities
}
