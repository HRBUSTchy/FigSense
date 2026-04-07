import type { EmbeddingVector } from './types.js'

import {
  ATTENTION_PARENT_WEIGHT_BY_DIMENSION,
  DEFAULT_ATTENTION_PARENT_WEIGHT,
  DEFAULT_WEIGHTED_MIN_PARENT_WEIGHT,
  EMBEDDING_DIMENSION_KEYS,
  WEIGHTED_MIN_PARENT_WEIGHT_BY_DIMENSION
} from './dimension-weights.js'

const WEIGHTED_MIN_PARENT_WEIGHTS = EMBEDDING_DIMENSION_KEYS.map(
  (key) => WEIGHTED_MIN_PARENT_WEIGHT_BY_DIMENSION[key] ?? DEFAULT_WEIGHTED_MIN_PARENT_WEIGHT
)

const ATTENTION_PARENT_WEIGHTS = EMBEDDING_DIMENSION_KEYS.map(
  (key) => ATTENTION_PARENT_WEIGHT_BY_DIMENSION[key] ?? DEFAULT_ATTENTION_PARENT_WEIGHT
)

function resolveWeightedParentWeight(baseWeight: number, index: number): number {
  const perDimensionMinWeight = WEIGHTED_MIN_PARENT_WEIGHTS[index] ?? DEFAULT_WEIGHTED_MIN_PARENT_WEIGHT
  return Math.max(baseWeight, perDimensionMinWeight)
}

function resolveAttentionParentWeight(index: number): number {
  return ATTENTION_PARENT_WEIGHTS[index] ?? DEFAULT_ATTENTION_PARENT_WEIGHT
}

export function mergeVectorsWeighted(
  parentVector: EmbeddingVector,
  childVectors: EmbeddingVector[],
  decayRate: number = 0.5
): EmbeddingVector {
  if (childVectors.length === 0) return parentVector

  const result = [...parentVector]
  const weight = Math.max(DEFAULT_WEIGHTED_MIN_PARENT_WEIGHT, Math.pow(decayRate, childVectors.length))

  for (let i = 0; i < result.length; i++) {
    const parentWeight = resolveWeightedParentWeight(weight, i)
    const childSum = childVectors.reduce((sum, vec) => sum + vec[i], 0)
    const childAvg = childSum / childVectors.length
    result[i] = parentVector[i] * parentWeight + childAvg * (1 - parentWeight)
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
    const parentWeight = resolveAttentionParentWeight(i)
    const parentValue = parentVector[i]
    const childValues = childVectors.map(vec => vec[i])

    const similarities = childValues.map(childValue => {
      const diff = Math.abs(parentValue - childValue)
      return Math.exp(-diff)
    })

    const attentionWeights = similarities.map(s => s / similarities.reduce((a, b) => a + b, 0))

    const weightedChildSum = childValues.reduce((sum, val, idx) => sum + val * attentionWeights[idx], 0)
    result[i] = parentValue * parentWeight + weightedChildSum * (1 - parentWeight)
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
