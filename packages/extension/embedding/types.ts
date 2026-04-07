export type EmbeddingVector = number[]

export type EmbeddablePaint = {
  type?: string
  visible?: boolean
  opacity?: number
  color?: { r: number; g: number; b: number }
}

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

export type PaintList = ReadonlyArray<EmbeddablePaint> | null | undefined

export type EmbeddableNode = {
  id: string
  name: string
  type: string
  visible: boolean
  x: number
  y: number
  width: number
  height: number
  children?: ReadonlyArray<{
    id: string
    visible: boolean
    x?: number
    y?: number
    width?: number
    height?: number
  }>
  layoutMode?: string
  primaryAxisAlignItems?: string
  itemSpacing?: unknown
  fills?: unknown
  strokes?: unknown
  strokeWeight?: unknown
  cornerRadius?: unknown
  topLeftRadius?: unknown
  topRightRadius?: unknown
  bottomLeftRadius?: unknown
  bottomRightRadius?: unknown
  opacity?: unknown
  locked?: unknown
  rotation?: unknown
  blendMode?: string
  effects?: unknown
  characters?: string
}

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
