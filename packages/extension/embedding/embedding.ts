import type {
  EmbeddableNode,
  EmbeddingVector,
  EmbeddingOptions,
  EmbeddingVectors,
  SimilarityResult
} from './types.js'

import {
  extractLayoutFeatures,
  extractColorFeatures,
  extractTextFeatures,
  extractNameFeatures,
  extractHierarchyFeatures
} from './features.js'
import {
  mergeVectorsWeighted,
  mergeVectorsAttention,
  mergeVectorsMax
} from './merge.js'
import { NODE_TYPES } from './types.js'
import { normalizeValue, oneHotEncode, cosineSimilarity } from './utils.js'

export function createNodeEmbedding(
  node: EmbeddableNode,
  _options: EmbeddingOptions = {}
): EmbeddingVector {
  void _options
  const features: number[] = []

  features.push(...oneHotEncode(node.type, NODE_TYPES))

  const x = normalizeValue(node.x, 0, 2000)
  const y = normalizeValue(node.y, 0, 2000)
  const width = normalizeValue(node.width, 0, 2000)
  const height = normalizeValue(node.height, 0, 2000)
  const aspectRatio = node.height > 0 ? node.width / node.height : 0
  features.push(x, y, width, height, normalizeValue(aspectRatio, 0, 10))

  features.push(...extractLayoutFeatures(node))

  features.push(...extractColorFeatures('fills' in node && Array.isArray((node as any).fills) ? ((node as any).fills as any) : null))
  features.push(...extractColorFeatures('strokes' in node && Array.isArray((node as any).strokes) ? ((node as any).strokes as any) : null))

  if ('strokeWeight' in node && typeof node.strokeWeight === 'number') {
    features.push(normalizeValue(node.strokeWeight, 0, 20))
  } else {
    features.push(0)
  }

  if ('cornerRadius' in node && typeof node.cornerRadius === 'number') {
    features.push(normalizeValue(node.cornerRadius, 0, 100))
  } else if ('topLeftRadius' in node) {
    const nodeWithRadii = node as { topLeftRadius: number; topRightRadius: number; bottomLeftRadius: number; bottomRightRadius: number }
    const avgRadius = (nodeWithRadii.topLeftRadius + nodeWithRadii.topRightRadius +
                       nodeWithRadii.bottomLeftRadius + nodeWithRadii.bottomRightRadius) / 4
    features.push(normalizeValue(avgRadius, 0, 100))
  } else {
    features.push(0)
  }

  if ('opacity' in node && typeof node.opacity === 'number') {
    features.push(node.opacity)
  } else {
    features.push(1)
  }

  features.push(node.visible ? 1 : 0)
  features.push('locked' in node && node.locked ? 1 : 0)

  features.push(...extractTextFeatures(node))
  features.push(...extractNameFeatures(node))

  features.push(...extractHierarchyFeatures(node, 0))

  if ('rotation' in node && typeof node.rotation === 'number') {
    features.push(normalizeValue(node.rotation, 0, 360))
  } else {
    features.push(0)
  }

  if ('blendMode' in node) {
    const blendModes = [
      'PASS_THROUGH',
      'NORMAL',
      'DARKEN',
      'MULTIPLY',
      'LIGHTEN',
      'SCREEN',
      'OVERLAY',
      'DIM',
      'COLOR_BURN',
      'COLOR_DODGE',
      'HARD_LIGHT',
      'SOFT_LIGHT',
      'DIFFERENCE',
      'EXCLUSION',
      'SATURATION',
      'COLOR',
      'LUMINOSITY'
    ]
    const blendMode = typeof (node as any).blendMode === 'string' ? ((node as any).blendMode as string) : 'PASS_THROUGH'
    const blendIndex = blendModes.indexOf(blendMode)
    features.push(blendIndex !== -1 ? blendIndex / blendModes.length : 0)
  } else {
    features.push(0)
  }

  if ('effects' in node && Array.isArray(node.effects)) {
    const visibleEffects = node.effects.filter((e) => e.visible !== false)
    const shadowCount = visibleEffects.filter((e) => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW').length
    const blurCount = visibleEffects.filter((e) => e.type === 'LAYER_BLUR' || e.type === 'BACKGROUND_BLUR').length
    features.push(normalizeValue(shadowCount, 0, 5))
    features.push(normalizeValue(blurCount, 0, 3))
  } else {
    features.push(0, 0)
  }

  return features
}

export function createTreeEmbedding(
  node: EmbeddableNode,
  options: EmbeddingOptions = {}
): EmbeddingVector[] {
  const { includeChildren = true, maxDepth = 10 } = options
  const embeddings: EmbeddingVector[] = []

  function traverse(currentNode: EmbeddableNode, depth: number): void {
    if (depth > maxDepth) return

    const embedding = createNodeEmbedding(currentNode, options)
    embeddings.push(embedding)

    if (includeChildren && 'children' in currentNode && Array.isArray((currentNode as any).children)) {
      for (const child of (currentNode as any).children as any[]) {
        if (child?.visible) {
          traverse(child as EmbeddableNode, depth + 1)
        }
      }
    }
  }

  traverse(node, 0)
  return embeddings
}

export function createMergedTreeEmbedding(
  node: EmbeddableNode,
  options: EmbeddingOptions = {}
): EmbeddingVector {
  const { mergeStrategy = 'weighted', decayRate = 0.5, maxDepth = 10 } = options

  function traverseAndMerge(currentNode: EmbeddableNode, depth: number): EmbeddingVector {
    if (depth > maxDepth) {
      return createNodeEmbedding(currentNode, options)
    }

    const currentNodeEmbedding = createNodeEmbedding(currentNode, options)

    if (!('children' in currentNode) || !Array.isArray((currentNode as any).children)) {
      return currentNodeEmbedding
    }

    const visibleChildren = ((currentNode as any).children as any[]).filter((c) => c?.visible)
    if (visibleChildren.length === 0) {
      return currentNodeEmbedding
    }

    const childEmbeddings = visibleChildren.map((child) =>
      traverseAndMerge(child as EmbeddableNode, depth + 1)
    )

    switch (mergeStrategy) {
      case 'weighted':
        return mergeVectorsWeighted(currentNodeEmbedding, childEmbeddings, decayRate)
      case 'attention':
        return mergeVectorsAttention(currentNodeEmbedding, childEmbeddings)
      case 'max':
        return mergeVectorsMax(currentNodeEmbedding, childEmbeddings)
      default:
        return mergeVectorsWeighted(currentNodeEmbedding, childEmbeddings, decayRate)
    }
  }

  return traverseAndMerge(node, 0)
}

export function getEmbeddingDimension(): number {
  return (
    NODE_TYPES.length +
    5 +
    8 +
    5 +
    5 +
    1 +
    1 +
    1 +
    1 +
    1 +
    10 +
    4 +
    3 +
    1 +
    1 +
    2
  )
}

export function selectNodeById(nodeId: string): boolean {
  const node = figma.getNodeById(nodeId)

  if (!node) {
    return false
  }

  if ('visible' in node) {
    figma.currentPage.selection = [node as SceneNode]
    return true
  }

  return false
}

export function getSelectedNode(): SceneNode | null {
  const selection = figma.currentPage.selection
  return selection.length > 0 ? selection[0] : null
}

export function createPageEmbeddings(options: EmbeddingOptions = {}): EmbeddingVectors {
  const vectors: EmbeddingVectors = {}

  if (!figma || !figma.currentPage) {
    console.warn('Figma API is not available. createPageEmbeddings can only be called in the plugin sandbox environment.')
    return vectors
  }

  const page = figma.currentPage
  console.log('Current page:', page.name, 'ID:', page.id)

  const { mergeStrategy = 'weighted', decayRate = 0.5, maxDepth = 10 } = options

  function traverseAndCreateEmbeddings(node: BaseNode, depth: number): void {
    if (depth > maxDepth) {
      return
    }

    if ('children' in node && Array.isArray((node as any).children)) {
      for (const child of (node as any).children as BaseNode[]) {
        traverseAndCreateEmbeddings(child, depth + 1)
      }
    }

    if ('visible' in node) {
      const sceneNode = node as unknown as EmbeddableNode

      if ((sceneNode as any).visible) {
        const children = (sceneNode as any).children
        if (!Array.isArray(children) || children.length === 0) {
          vectors[sceneNode.id] = createNodeEmbedding(sceneNode, options)
        } else {
          const visibleChildren = (children as any[]).filter((c) => c?.visible)
          if (visibleChildren.length === 0) {
            vectors[sceneNode.id] = createNodeEmbedding(sceneNode, options)
          } else {
            const childEmbeddings = visibleChildren
              .map(child => vectors[child.id])
              .filter((embedding): embedding is EmbeddingVector => embedding !== undefined)

            if (childEmbeddings.length === 0) {
              vectors[sceneNode.id] = createNodeEmbedding(sceneNode, options)
            } else {
              const currentNodeEmbedding = createNodeEmbedding(sceneNode, options)

              let mergedVector: EmbeddingVector
              switch (mergeStrategy) {
                case 'weighted':
                  mergedVector = mergeVectorsWeighted(currentNodeEmbedding, childEmbeddings, decayRate)
                  break
                case 'attention':
                  mergedVector = mergeVectorsAttention(currentNodeEmbedding, childEmbeddings)
                  break
                case 'max':
                  mergedVector = mergeVectorsMax(currentNodeEmbedding, childEmbeddings)
                  break
                default:
                  mergedVector = mergeVectorsWeighted(currentNodeEmbedding, childEmbeddings, decayRate)
              }

              vectors[sceneNode.id] = mergedVector
            }
          }
        }
      }
    }
  }

  traverseAndCreateEmbeddings(page, 0)

  console.log(`Created embeddings for ${Object.keys(vectors).length} nodes`)

  return vectors
}

export function findMostSimilar(
  vectors: EmbeddingVectors,
  targetVector?: EmbeddingVector
): SimilarityResult | null {
  const entries = Object.entries(vectors)

  if (entries.length === 0) {
    return null
  }

  let vectorToCompare = targetVector
  let excludeId: string | null = null

  if (!vectorToCompare) {
    const selectedNode = getSelectedNode()
    if (!selectedNode) {
      return null
    }
    vectorToCompare = createMergedTreeEmbedding(selectedNode)
    excludeId = selectedNode.id
  }

  let maxSimilarity = -1
  let bestId: string | null = null

  for (const [id, vector] of entries) {
    if (excludeId && id === excludeId) {
      continue
    }

    const similarity = cosineSimilarity(vector, vectorToCompare)

    if (similarity > maxSimilarity) {
      maxSimilarity = similarity
      bestId = id
    }
  }

  if (bestId === null) {
    return null
  }

  return {
    id: bestId,
    similarity: maxSimilarity
  }
}
