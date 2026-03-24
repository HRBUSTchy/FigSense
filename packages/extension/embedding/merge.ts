import type { EmbeddingVector } from './types.js'

export function mergeVectorsWeighted(
  parentVector: EmbeddingVector,
  childVectors: EmbeddingVector[],
  decayRate: number = 0.5
): EmbeddingVector {
  if (childVectors.length === 0) return parentVector

  const result = [...parentVector]
  const weight = Math.pow(decayRate, childVectors.length)

  for (let i = 0; i < result.length; i++) {
    const childSum = childVectors.reduce((sum, vec) => sum + vec[i], 0)
    const childAvg = childSum / childVectors.length
    result[i] = parentVector[i] * weight + childAvg * (1 - weight)
  }

  return result
}

export function mergeVectorsAttention(
  parentVector: EmbeddingVector,
  childVectors: EmbeddingVector[]
): EmbeddingVector {
  if (childVectors.length === 0) return parentVector

  const result = [...parentVector]
  const dimension = result.length

  for (let i = 0; i < dimension; i++) {
    const parentValue = parentVector[i]
    const childValues = childVectors.map(vec => vec[i])

    const similarities = childValues.map(childValue => {
      const diff = Math.abs(parentValue - childValue)
      return Math.exp(-diff)
    })

    const attentionWeights = similarities.map(s => s / similarities.reduce((a, b) => a + b, 0))

    const weightedChildSum = childValues.reduce((sum, val, idx) => sum + val * attentionWeights[idx], 0)
    result[i] = parentValue * 0.3 + weightedChildSum * 0.7
  }

  return result
}

export function mergeVectorsMax(
  parentVector: EmbeddingVector,
  childVectors: EmbeddingVector[]
): EmbeddingVector {
  if (childVectors.length === 0) return parentVector

  const result = [...parentVector]
  const dimension = result.length

  for (let i = 0; i < dimension; i++) {
    const maxChildValue = Math.max(...childVectors.map(vec => vec[i]))
    result[i] = Math.max(parentVector[i], maxChildValue)
  }

  return result
}
