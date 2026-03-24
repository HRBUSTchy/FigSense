import type { EmbeddingVector } from './types.js'

export function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function normalizeValue(value: number, min: number, max: number): number {
  if (max === min) return 0
  return (value - min) / (max - min)
}

export function oneHotEncode(value: string, options: readonly string[]): number[] {
  const encoding = new Array(options.length).fill(0)
  const index = options.indexOf(value)
  if (index !== -1) {
    encoding[index] = 1
  }
  return encoding
}

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

  if (norm1 === 0 || norm2 === 0) {
    return 0
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
}
