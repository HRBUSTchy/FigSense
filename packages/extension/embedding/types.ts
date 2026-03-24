export type EmbeddingVector = number[]

export type EmbeddingOptions = {
  includeChildren?: boolean
  maxDepth?: number
  normalize?: boolean
  mergeStrategy?: 'weighted' | 'attention' | 'max'
  decayRate?: number
}

export type EmbeddingVectors = Record<string, EmbeddingVector>

export type SimilarityResult = {
  id: string
  similarity: number
}

export type PaintList = Paint[] | ReadonlyArray<Paint> | null | undefined

export const NODE_TYPES = [
  'DOCUMENT',
  'PAGE',
  'FRAME',
  'GROUP',
  'COMPONENT',
  'INSTANCE',
  'BOOLEAN_OPERATION',
  'VECTOR',
  'STAR',
  'LINE',
  'ELLIPSE',
  'POLYGON',
  'RECTANGLE',
  'TEXT',
  'SLICE',
  'COMPONENT_SET',
  'SECTION'
] as const

export const LAYOUT_MODES = ['NONE', 'HORIZONTAL', 'VERTICAL', 'GRID'] as const

export const ALIGNMENT_VALUES = ['MIN', 'CENTER', 'MAX', 'SPACE_BETWEEN'] as const
