import type { EmbeddableNode, PaintList } from './types.js'

import { normalizeValue, hashString } from './utils.js'

export function extractColorFeatures(paints: PaintList, areaScale = 1): number[] {
  const features = [0, 0, 0, 0, 0, 0]

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
    const solidPaint = visiblePaints.find((p): p is SolidPaint => p.type === 'SOLID')
    if (solidPaint?.color) {
      const { r, g, b } = solidPaint.color
      const opacity = solidPaint.opacity ?? 1
      const clampedR = Math.max(0, Math.min(1, r))
      const clampedG = Math.max(0, Math.min(1, g))
      const clampedB = Math.max(0, Math.min(1, b))
      features[4] = (r * 0.299 + g * 0.587 + b * 0.114) * opacity
      const packedColor =
        (Math.round(clampedR * 255) * 256 * 256 +
          Math.round(clampedG * 255) * 256 +
          Math.round(clampedB * 255)) /
        0xffffff
      features[5] = packedColor * opacity * areaScale
    }
  }

  return features
}

export function extractLayoutFeatures(node: EmbeddableNode): number[] {
  const features = new Array(12).fill(0)

  if ('layoutMode' in node && node.layoutMode) {
    const modeIndex = ['NONE', 'HORIZONTAL', 'VERTICAL', 'GRID'].indexOf(node.layoutMode)
    if (modeIndex !== -1) {
      features[modeIndex] = 1
    }
  }

  if ('primaryAxisAlignItems' in node && node.primaryAxisAlignItems) {
    const alignIndex = ['MIN', 'CENTER', 'MAX', 'SPACE_BETWEEN'].indexOf(node.primaryAxisAlignItems)
    if (alignIndex !== -1) {
      features[4 + alignIndex] = 1
    }
  }

  if ('itemSpacing' in node && typeof node.itemSpacing === 'number') {
    features[8] = normalizeValue(node.itemSpacing, 0, 100)
  }

  if ('children' in node && Array.isArray(node.children)) {
    const visibleChildrenWithGeometry = node.children.filter(
      (child): child is NonNullable<EmbeddableNode['children']>[number] & {
        x: number
        y: number
        width: number
        height: number
      } =>
        !!child &&
        child.visible !== false &&
        typeof child.x === 'number' &&
        typeof child.y === 'number' &&
        typeof child.width === 'number' &&
        typeof child.height === 'number'
    )

    if (visibleChildrenWithGeometry.length > 0) {
      const childCount = visibleChildrenWithGeometry.length
      let minCenterX = Number.POSITIVE_INFINITY
      let maxCenterX = Number.NEGATIVE_INFINITY
      let minCenterY = Number.POSITIVE_INFINITY
      let maxCenterY = Number.NEGATIVE_INFINITY

      if (childCount >= 2) {
        for (const child of visibleChildrenWithGeometry) {
          const centerX = child.x + child.width / 2
          const centerY = child.y + child.height / 2
          minCenterX = Math.min(minCenterX, centerX)
          maxCenterX = Math.max(maxCenterX, centerX)
          minCenterY = Math.min(minCenterY, centerY)
          maxCenterY = Math.max(maxCenterY, centerY)
        }
      }

      const spanX = Math.max(0, maxCenterX - minCenterX)
      const spanY = Math.max(0, maxCenterY - minCenterY)
      const totalSpan = spanX + spanY

      let horizontalBias = totalSpan > 0 ? spanX / totalSpan : 0.5
      let orientationStrength = totalSpan > 0 ? Math.abs(spanX - spanY) / totalSpan : 0

      if (childCount === 1 && totalSpan === 0) {
        if (node.layoutMode === 'HORIZONTAL') {
          horizontalBias = 1
          orientationStrength = 1
        } else if (node.layoutMode === 'VERTICAL') {
          horizontalBias = 0.2
          orientationStrength = 1
        }
      }

      const verticalBias = 1 - horizontalBias
      const confidence = 1

      features[9] = 0.5 + (horizontalBias - 0.5) * confidence
      features[10] = horizontalBias * orientationStrength * confidence
      features[11] = verticalBias * orientationStrength * confidence
    }
  }

  return features
}

export function extractTextFeatures(node: EmbeddableNode): number[] {
  const features = new Array(10).fill(0)

  if (node.type === 'TEXT' && 'characters' in node) {
    const text = node.characters || ''
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

export function extractHierarchyFeatures(node: EmbeddableNode, depth: number): number[] {
  const features = new Array(3).fill(0)

  features[0] = normalizeValue(depth, 0, 10)

  if ('children' in node && Array.isArray(node.children)) {
    const childCount = node.children.length
    features[1] = normalizeValue(childCount, 0, 50)

    const visibleChildren = node.children.filter((c) => c.visible).length
    features[2] = childCount > 0 ? visibleChildren / childCount : 0
  }

  return features
}

export function extractNameFeatures(node: EmbeddableNode): number[] {
  const features = new Array(4).fill(0)
  const name = node.name || ''

  features[0] = normalizeValue(name.length, 0, 50)
  features[1] = /^[A-Z]/.test(name) ? 1 : 0
  features[2] = /[_-]/.test(name) ? 1 : 0
  features[3] = normalizeValue(hashString(name), 0, Number.MAX_SAFE_INTEGER)

  return features
}

/**
 * Extracts child node type signature features.
 * Captures the structural "fingerprint" of direct children,
 * which is critical for distinguishing components that differ in
 * internal structure (e.g., button mode true vs false).
 *
 * Returns 8 features:
 *   [0-3]: Counts of each child type (COMPONENT, FRAME, INSTANCE, TEXT)
 *   [4]: Count of other types
 *   [5]: Total visible child count (normalized)
 *   [6]: Type diversity ratio (unique types / total children)
 *   [7]: Positional hash of child type sequence
 */
export function extractChildSignatureFeatures(node: EmbeddableNode): number[] {
  const features = new Array(8).fill(0)

  if (!('children' in node) || !Array.isArray(node.children)) return features

  const typeBuckets: Record<string, number> = {
    COMPONENT: 0,
    FRAME: 0,
    INSTANCE: 0,
    TEXT: 0,
  }
  let otherCount = 0
  const typeSequence: string[] = []

  for (const child of node.children) {
    if (!child || child.visible === false) continue

    const t = child.type
    if (t in typeBuckets) {
      typeBuckets[t]++
    } else {
      otherCount++
    }
    typeSequence.push(t)
  }

  const totalCount = typeSequence.length

  // [0-3]: Individual type counts (normalized by max expected)
  features[0] = normalizeValue(typeBuckets.COMPONENT, 0, 10)
  features[1] = normalizeValue(typeBuckets.FRAME, 0, 10)
  features[2] = normalizeValue(typeBuckets.INSTANCE, 0, 10)
  features[3] = normalizeValue(typeBuckets.TEXT, 0, 10)

  // [4]: Other types count
  features[4] = normalizeValue(otherCount, 0, 10)

  // [5]: Total visible children (already in hierarchy but repeated here for convenience)
  features[5] = normalizeValue(totalCount, 0, 20)

  // [6]: Type diversity (how many different child types exist)
  const uniqueTypes = new Set(typeSequence).size
  features[6] = totalCount > 0 ? uniqueTypes / Math.min(totalCount, 5) : 0

  // [7]: Positional hash of type sequence (differentiates [FRAME,INSTANCE] from [INSTANCE,FRAME])
  // Normalized to [0,1] range using modulo to avoid extreme values
  if (typeSequence.length > 0) {
    let hashVal = 0
    for (let i = 0; i < typeSequence.length; i++) {
      hashVal = ((hashVal << 5) - hashVal + typeSequence[i].length * (i + 1)) | 0
    }
    // Use modulo to keep the value in a bounded range for stable embedding
    features[7] = (Math.abs(hashVal) % 10000) / 10000
  }

  return features
}

/**
 * Recursively extracts statistics from the entire subtree.
 * Captures visual properties that may differ deep in the tree
 * but are averaged out by standard merge strategies.
 *
 * Returns 8 features:
 *   [0]: Subtree min fill luma
 *   [1]: Subtree max fill luma
 *   [2]: Subtree luma range (max - min)
 *   [3]: Node count with visible strokes in subtree
 *   [4]: Node count with non-full opacity in subtree
 *   [5]: Deepest level with visible content
 *   [6]: Total leaf node count
 *   [7]: Subtree visual entropy (normalized variance of luma values)
 */
export function extractSubtreeStatsFeatures(
  node: EmbeddableNode,
  currentDepth = 0
): number[] {
  const features = new Array(8).fill(0)

  const lumas: number[] = []
  let strokeNodeCount = 0
  let nonFullOpacityCount = 0
  let maxDepth = 0
  let leafCount = 0

  function traverse(n: typeof node, depth: number): void {
    maxDepth = Math.max(maxDepth, depth)
    const hasChildren =
      'children' in n && Array.isArray((n as any).children) && (n as any).children.length > 0

    if (!hasChildren) {
      leafCount++
    }

    // Collect fill luminance from paints
    const fills =
      'fills' in n && Array.isArray((n as any).fills) ? ((n as any).fills) : null
    if (Array.isArray(fills)) {
      for (const paint of fills) {
        if (!paint || paint.visible === false) continue
        if (paint.type === 'SOLID' && paint.color) {
          const { r, g, b } = paint.color
          const op = paint.opacity ?? 1
          lumas.push((0.299 * r + 0.587 * g + 0.114 * b) * op)
        }
      }
    }

    // Count stroke visibility
    const strokes =
      'strokes' in n && Array.isArray((n as any).strokes) ? ((n as any).strokes) : null
    if (Array.isArray(strokes)) {
      const hasVisibleStroke = strokes.some(
        (s: any) => s && s.visible !== false && s.type === 'SOLID'
      )
      if (hasVisibleStroke) strokeNodeCount++
    }

    // Count non-full opacity
    if ('opacity' in n && typeof n.opacity === 'number' && n.opacity < 0.99) {
      nonFullOpacityCount++
    }

    // Recurse into children
    if ('children' in n && Array.isArray((n as any).children)) {
      for (const child of (n as any).children) {
        if (child && child.visible !== false) {
          traverse(child, depth + 1)
        }
      }
    }
  }

  traverse(node, currentDepth)

  if (lumas.length > 0) {
    const minLuma = Math.min(...lumas)
    const maxLuma = Math.max(...lumas)
    features[0] = minLuma
    features[1] = maxLuma
    features[2] = maxLuma - minLuma // range

    // Visual entropy: normalized variance of luma values
    const mean = lumas.reduce((a, b) => a + b, 0) / lumas.length
    const variance = lumas.reduce((sum, v) => sum + (v - mean) ** 2, 0) / lumas.length
    // Normalize: max possible variance for [0,1] range is 0.25
    features[7] = Math.sqrt(variance) / 0.5
  } else {
    features[0] = 0.5
    features[1] = 0.5
    features[2] = 0
  }

  features[3] = normalizeValue(strokeNodeCount, 0, 10)
  features[4] = normalizeValue(nonFullOpacityCount, 0, 10)
  features[5] = normalizeValue(maxDepth, 0, 15)
  features[6] = normalizeValue(leafCount, 0, 50)

  return features
}
