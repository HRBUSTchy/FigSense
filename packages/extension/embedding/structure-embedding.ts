import type { EmbeddingVector } from './types.js'

import { NODE_TYPES } from './types.js'
import { hashString, normalizeValue, oneHotEncode } from './utils.js'

export interface ComponentStructure {
  componentId: string
  name: string
  type: string
  properties: {
    x?: number
    y?: number
    width?: number
    height?: number
    fills?: Array<{ type: string; color?: { r: number; g: number; b: number; a: number }; opacity?: number; visible?: boolean }>
    strokes?: Array<{ type: string; color?: { r: number; g: number; b: number; a: number }; opacity?: number; visible?: boolean }>
    strokeWeight?: number
    cornerRadius?: number
    opacity?: number
    visible?: boolean
    locked?: boolean
    characters?: string
    fontSize?: number
    rotation?: number
    blendMode?: string
    effects?: Array<{ type: string; visible?: boolean }>
    layoutMode?: string
    primaryAxisAlignItems?: string
    itemSpacing?: number
  }
  children?: ComponentStructure[]
  depth?: number
}

export function createStructureEmbedding(
  structure: ComponentStructure,
  includeStyle: boolean = true
): EmbeddingVector {
  const features: number[] = []

  const nodeType = structure.type.toUpperCase()
  features.push(...oneHotEncode(nodeType, NODE_TYPES))

  const props = structure.properties

  const x = normalizeValue(props.x ?? 0, 0, 2000)
  const y = normalizeValue(props.y ?? 0, 0, 2000)
  const width = normalizeValue(props.width ?? 0, 0, 2000)
  const height = normalizeValue(props.height ?? 0, 0, 2000)
  const aspectRatio = (props.height ?? 0) > 0 ? (props.width ?? 0) / (props.height ?? 0) : 0
  features.push(x, y, width, height, normalizeValue(aspectRatio, 0, 10))

  features.push(...extractLayoutFeaturesFromStructure(props))

  if (includeStyle) {
    features.push(...extractColorFeaturesFromStructure(props.fills))
    features.push(...extractColorFeaturesFromStructure(props.strokes))
  } else {
    features.push(...new Array(10).fill(0))
  }

  if (includeStyle && props.strokeWeight !== undefined) {
    features.push(normalizeValue(props.strokeWeight, 0, 20))
  } else {
    features.push(0)
  }

  if (includeStyle && props.cornerRadius !== undefined) {
    features.push(normalizeValue(props.cornerRadius, 0, 100))
  } else {
    features.push(0)
  }

  if (includeStyle && props.opacity !== undefined) {
    features.push(props.opacity)
  } else {
    features.push(1)
  }

  features.push(props.visible !== false ? 1 : 0)
  features.push(props.locked === true ? 1 : 0)

  features.push(...extractTextFeaturesFromStructure(props))

  features.push(...extractNameFeaturesFromStructure(structure.name))

  const depth = structure.depth ?? 0
  const childCount = structure.children?.length ?? 0
  features.push(normalizeValue(depth, 0, 10))
  features.push(normalizeValue(childCount, 0, 50))
  features.push(1)

  if (includeStyle && props.rotation !== undefined) {
    features.push(normalizeValue(props.rotation, 0, 360))
  } else {
    features.push(0)
  }

  if (includeStyle && props.blendMode !== undefined) {
    const blendModes = ['PASS_THROUGH', 'NORMAL', 'DARKEN', 'MULTIPLY', 'LIGHTEN', 'SCREEN', 'OVERLAY', 'DIM', 'COLOR_BURN', 'COLOR_DODGE', 'HARD_LIGHT', 'SOFT_LIGHT', 'DIFFERENCE', 'EXCLUSION', 'SATURATION', 'COLOR', 'LUMINOSITY']
    const blendIndex = blendModes.indexOf(props.blendMode.toUpperCase())
    features.push(blendIndex !== -1 ? blendIndex / blendModes.length : 0)
  } else {
    features.push(0)
  }

  if (includeStyle && props.effects) {
    const visibleEffects = props.effects.filter((e) => e.visible !== false)
    const shadowCount = visibleEffects.filter((e) => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW').length
    const blurCount = visibleEffects.filter((e) => e.type === 'LAYER_BLUR' || e.type === 'BACKGROUND_BLUR').length
    features.push(normalizeValue(shadowCount, 0, 5))
    features.push(normalizeValue(blurCount, 0, 3))
  } else {
    features.push(0, 0)
  }

  return features
}

function extractLayoutFeaturesFromStructure(props: ComponentStructure['properties']): number[] {
  const features = new Array(8).fill(0)

  if (props.layoutMode) {
    const modeIndex = ['NONE', 'HORIZONTAL', 'VERTICAL', 'GRID'].indexOf(props.layoutMode.toUpperCase())
    if (modeIndex !== -1) {
      features[modeIndex] = 1
    }
  }

  if (props.primaryAxisAlignItems) {
    const alignIndex = ['MIN', 'CENTER', 'MAX', 'SPACE_BETWEEN'].indexOf(props.primaryAxisAlignItems.toUpperCase())
    if (alignIndex !== -1) {
      features[3 + alignIndex] = 1
    }
  }

  if (props.itemSpacing !== undefined) {
    features[7] = normalizeValue(props.itemSpacing, 0, 100)
  }

  return features
}

function extractColorFeaturesFromStructure(paints?: ComponentStructure['properties']['fills']): number[] {
  const features = [0, 0, 0, 0, 0]

  if (!Array.isArray(paints)) return features

  const visiblePaints = paints.filter((p) => p.visible !== false)
  features[0] = visiblePaints.length > 0 ? 1 : 0

  const solidCount = visiblePaints.filter((p) => p.type === 'SOLID').length
  const gradientCount = visiblePaints.filter((p) => p.type === 'GRADIENT_LINEAR' || p.type === 'GRADIENT_RADIAL').length
  const imageCount = visiblePaints.filter((p) => p.type === 'IMAGE').length

  features[1] = normalizeValue(solidCount, 0, 5)
  features[2] = normalizeValue(gradientCount, 0, 3)
  features[3] = normalizeValue(imageCount, 0, 3)

  if (solidCount > 0) {
    const solidPaint = visiblePaints.find((p) => p.type === 'SOLID')
    if (solidPaint?.color) {
      const { r, g, b } = solidPaint.color
      const opacity = solidPaint.opacity ?? 1
      features[4] = (r * 0.299 + g * 0.587 + b * 0.114) * opacity
    }
  }

  return features
}

function extractTextFeaturesFromStructure(props: ComponentStructure['properties']): number[] {
  const features = new Array(10).fill(0)

  if (props.characters) {
    const text = props.characters
    features[0] = normalizeValue(text.length, 0, 500)
    features[1] = text.includes('\n') ? 1 : 0
    features[2] = /[A-Z]/.test(text) ? 1 : 0
    features[3] = /[0-9]/.test(text) ? 1 : 0
    features[4] = /[\u4e00-\u9fa5]/.test(text) ? 1 : 0

    const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length
    features[5] = normalizeValue(wordCount, 0, 100)
    
    const unicodeEmbedding = createUnicodeEmbedding(text)
    features[6] = unicodeEmbedding[0]
    features[7] = unicodeEmbedding[1]
    features[8] = unicodeEmbedding[2]
    features[9] = unicodeEmbedding[3]
  }

  return features
}

function createUnicodeEmbedding(text: string): number[] {
  const maxChars = 50
  const truncatedText = text.slice(0, maxChars)
  
  let weightedSum = 0
  let totalWeight = 0
  let maxUnicode = 0
  let minUnicode = Infinity
  
  for (let i = 0; i < truncatedText.length; i++) {
    const char = truncatedText[i]
    const unicode = char.codePointAt(0) || 0
    const weight = 1 - (i / maxChars)
    
    weightedSum += unicode * weight
    totalWeight += weight
    maxUnicode = Math.max(maxUnicode, unicode)
    minUnicode = Math.min(minUnicode, unicode)
  }
  
  const avgUnicode = totalWeight > 0 ? weightedSum / totalWeight : 0
  const normalizedMin = minUnicode === Infinity ? 0 : normalizeValue(minUnicode, 0, 65535)
  const normalizedMax = maxUnicode === 0 ? 0 : normalizeValue(maxUnicode, 0, 65535)
  
  return [
    normalizeValue(avgUnicode, 0, 65535),
    normalizeValue(weightedSum, 0, 65535 * maxChars),
    normalizedMin,
    normalizedMax
  ]
}

function extractNameFeaturesFromStructure(name: string): number[] {
  const features = new Array(4).fill(0)

  features[0] = normalizeValue(name.length, 0, 50)
  features[1] = /^[A-Z]/.test(name) ? 1 : 0
  features[2] = /[_-]/.test(name) ? 1 : 0
  features[3] = normalizeValue(hashString(name), 0, Number.MAX_SAFE_INTEGER)

  return features
}
