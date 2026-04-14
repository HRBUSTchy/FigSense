import { describe, expect, it } from 'vitest'

import { EMBEDDING_DIMENSION_KEYS } from '@/embedding/dimension-weights'
import {
  createNodeEmbedding,
  createTreeEmbedding,
  createMergedTreeEmbedding,
  cosineSimilarity,
  euclideanDistance,
  findMostSimilarNodes,
  getEmbeddingDimension,
  mergeVectorsWeighted
} from '@/embedding/node-embedder'

function createMockNode(type: SceneNode['type'], overrides: Record<string, unknown> = {}): SceneNode {
  return {
    id: 'test-node',
    name: 'Test Node',
    type,
    visible: true,
    x: 100,
    y: 100,
    width: 200,
    height: 100,
    ...overrides
  } as unknown as SceneNode
}

describe('Node Embedding', () => {
  describe('createNodeEmbedding', () => {
    it('should create an embedding vector for a node', () => {
      const node = createMockNode('FRAME')
      const embedding = createNodeEmbedding(node)

      expect(embedding).toBeInstanceOf(Array)
      expect(embedding.length).toBeGreaterThan(0)
      expect(embedding.every(v => typeof v === 'number')).toBe(true)
    })

    it('should create different embeddings for different node types', () => {
      const frameNode = createMockNode('FRAME')
      const textNode = createMockNode('TEXT')

      const frameEmbedding = createNodeEmbedding(frameNode)
      const textEmbedding = createNodeEmbedding(textNode)

      expect(frameEmbedding).not.toEqual(textEmbedding)
    })

    it('should handle text nodes with characters', () => {
      const textNode = createMockNode('TEXT', {
        characters: 'Hello World'
      })

      const embedding = createNodeEmbedding(textNode)
      expect(embedding.length).toBeGreaterThan(0)
    })

    it('should handle nodes with fills', () => {
      const node = createMockNode('RECTANGLE', {
        fills: [
          {
            type: 'SOLID',
            color: { r: 1, g: 0, b: 0, a: 1 },
            visible: true
          }
        ]
      })

      const embedding = createNodeEmbedding(node)
      expect(embedding.length).toBeGreaterThan(0)
    })

    it('should encode color and size coupling into dedicated dimensions', () => {
      const smallNode = createMockNode('RECTANGLE', {
        width: 80,
        height: 80,
        fills: [
          {
            type: 'SOLID',
            color: { r: 0.1, g: 0.1, b: 0.1, a: 1 },
            visible: true
          }
        ]
      })

      const largeNode = createMockNode('RECTANGLE', {
        width: 320,
        height: 320,
        fills: [
          {
            type: 'SOLID',
            color: { r: 0.1, g: 0.1, b: 0.1, a: 1 },
            visible: true
          }
        ]
      })

      const smallEmbedding = createNodeEmbedding(smallNode)
      const largeEmbedding = createNodeEmbedding(largeNode)

      const lumaIndex = EMBEDDING_DIMENSION_KEYS.indexOf('color:primary_luma')
      const lumaAreaIndex = EMBEDDING_DIMENSION_KEYS.indexOf('color:primary_luma_area')

      expect(lumaIndex).toBeGreaterThanOrEqual(0)
      expect(lumaAreaIndex).toBeGreaterThanOrEqual(0)

      expect(smallEmbedding[lumaIndex]!).toBeCloseTo(largeEmbedding[lumaIndex]!, 6)
      expect(largeEmbedding[lumaAreaIndex]!).toBeGreaterThan(smallEmbedding[lumaAreaIndex]!)
    })

    it('should handle nodes with layout properties', () => {
      const node = createMockNode('FRAME', {
        layoutMode: 'HORIZONTAL',
        itemSpacing: 16,
        primaryAxisAlignItems: 'MIN'
      })

      const embedding = createNodeEmbedding(node)
      expect(embedding.length).toBeGreaterThan(0)
    })

    it('should distinguish horizontal and vertical child arrangement without layoutMode', () => {
      const horizontal = createMockNode('FRAME', {
        id: 'parent-horizontal',
        layoutMode: 'NONE',
        children: [
          createMockNode('RECTANGLE', { id: 'h-1', x: 20, y: 30, width: 40, height: 20 }),
          createMockNode('RECTANGLE', { id: 'h-2', x: 90, y: 32, width: 40, height: 20 }),
          createMockNode('RECTANGLE', { id: 'h-3', x: 160, y: 29, width: 40, height: 20 })
        ]
      })

      const vertical = createMockNode('FRAME', {
        id: 'parent-vertical',
        layoutMode: 'NONE',
        children: [
          createMockNode('RECTANGLE', { id: 'v-1', x: 40, y: 20, width: 40, height: 20 }),
          createMockNode('RECTANGLE', { id: 'v-2', x: 42, y: 90, width: 40, height: 20 }),
          createMockNode('RECTANGLE', { id: 'v-3', x: 39, y: 160, width: 40, height: 20 })
        ]
      })

      const horizontalEmbedding = createNodeEmbedding(horizontal)
      const verticalEmbedding = createNodeEmbedding(vertical)

      expect(horizontalEmbedding).not.toEqual(verticalEmbedding)
      expect(cosineSimilarity(horizontalEmbedding, verticalEmbedding)).toBeLessThan(0.9999)
    })

    it('should avoid abrupt layout jumps between one and two children', () => {
      const singleChild = createMockNode('FRAME', {
        id: 'parent-single',
        layoutMode: 'HORIZONTAL',
        width: 87,
        height: 22,
        children: [
          createMockNode('RECTANGLE', { id: 's-1', x: 20, y: 30, width: 40, height: 20 })
        ]
      })

      const twoChildren = createMockNode('FRAME', {
        id: 'parent-two',
        layoutMode: 'NONE',
        width: 190,
        height: 22,
        children: [
          createMockNode('RECTANGLE', { id: 't-1', x: 20, y: 30, width: 40, height: 20 }),
          createMockNode('RECTANGLE', { id: 't-2', x: 90, y: 32, width: 40, height: 20 })
        ]
      })

      const singleEmbedding = createNodeEmbedding(singleChild)
      const twoEmbedding = createNodeEmbedding(twoChildren)

      const biasIndex = EMBEDDING_DIMENSION_KEYS.indexOf('layout:child_horizontal_bias')
      const horizontalFlagIndex = EMBEDDING_DIMENSION_KEYS.indexOf('layout:child_horizontal_flag')

      expect(biasIndex).toBeGreaterThanOrEqual(0)
      expect(horizontalFlagIndex).toBeGreaterThanOrEqual(0)

      const singleBias = singleEmbedding[biasIndex]!
      const twoBias = twoEmbedding[biasIndex]!
      const singleHorizontalFlag = singleEmbedding[horizontalFlagIndex]!
      const twoHorizontalFlag = twoEmbedding[horizontalFlagIndex]!

      expect(singleBias).toBeGreaterThan(0)
      expect(twoBias - singleBias).toBeLessThan(0.2)
      expect(singleHorizontalFlag).toBeGreaterThan(0)
      expect(twoHorizontalFlag).toBeGreaterThan(0)
      expect(twoHorizontalFlag - singleHorizontalFlag).toBeLessThan(0.25)
    })

    it('should keep two-child and four-child horizontal orientation features close', () => {
      const twoChildren = createMockNode('FRAME', {
        id: 'parent-two-close',
        layoutMode: 'HORIZONTAL',
        children: [
          createMockNode('RECTANGLE', { id: 'two-1', x: 20, y: 30, width: 40, height: 20 }),
          createMockNode('RECTANGLE', { id: 'two-2', x: 90, y: 32, width: 40, height: 20 })
        ]
      })

      const fourChildren = createMockNode('FRAME', {
        id: 'parent-four-close',
        layoutMode: 'HORIZONTAL',
        children: [
          createMockNode('RECTANGLE', { id: 'four-1', x: 20, y: 30, width: 40, height: 20 }),
          createMockNode('RECTANGLE', { id: 'four-2', x: 90, y: 32, width: 40, height: 20 }),
          createMockNode('RECTANGLE', { id: 'four-3', x: 160, y: 31, width: 40, height: 20 }),
          createMockNode('RECTANGLE', { id: 'four-4', x: 230, y: 29, width: 40, height: 20 })
        ]
      })

      const twoEmbedding = createNodeEmbedding(twoChildren)
      const fourEmbedding = createNodeEmbedding(fourChildren)

      const horizontalFlagIndex = EMBEDDING_DIMENSION_KEYS.indexOf('layout:child_horizontal_flag')
      expect(horizontalFlagIndex).toBeGreaterThanOrEqual(0)

      const twoHorizontalFlag = twoEmbedding[horizontalFlagIndex]!
      const fourHorizontalFlag = fourEmbedding[horizontalFlagIndex]!

      expect(Math.abs(twoHorizontalFlag - fourHorizontalFlag)).toBeLessThan(0.4)
    })

    it('should keep one-child and two-child vertical orientation features close', () => {
      const oneChildVertical = createMockNode('FRAME', {
        id: 'parent-vertical-one',
        layoutMode: 'VERTICAL',
        width: 87,
        height: 22,
        children: [
          createMockNode('RECTANGLE', { id: 'v-one-1', x: 40, y: 20, width: 40, height: 20 })
        ]
      })

      const twoChildrenVertical = createMockNode('FRAME', {
        id: 'parent-vertical-two',
        layoutMode: 'VERTICAL',
        width: 87,
        height: 60,
        children: [
          createMockNode('RECTANGLE', { id: 'v-two-1', x: 40, y: 20, width: 40, height: 20 }),
          createMockNode('RECTANGLE', { id: 'v-two-2', x: 42, y: 90, width: 40, height: 20 })
        ]
      })

      const oneEmbedding = createNodeEmbedding(oneChildVertical)
      const twoEmbedding = createNodeEmbedding(twoChildrenVertical)

      const biasIndex = EMBEDDING_DIMENSION_KEYS.indexOf('layout:child_horizontal_bias')
      const horizontalFlagIndex = EMBEDDING_DIMENSION_KEYS.indexOf('layout:child_horizontal_flag')
      const verticalFlagIndex = EMBEDDING_DIMENSION_KEYS.indexOf('layout:child_vertical_flag')

      expect(biasIndex).toBeGreaterThanOrEqual(0)
      expect(horizontalFlagIndex).toBeGreaterThanOrEqual(0)
      expect(verticalFlagIndex).toBeGreaterThanOrEqual(0)

      const oneBias = oneEmbedding[biasIndex]!
      const twoBias = twoEmbedding[biasIndex]!
      const oneHorizontalFlag = oneEmbedding[horizontalFlagIndex]!
      const twoHorizontalFlag = twoEmbedding[horizontalFlagIndex]!
      const oneVerticalFlag = oneEmbedding[verticalFlagIndex]!
      const twoVerticalFlag = twoEmbedding[verticalFlagIndex]!

      expect(Math.abs(oneBias - twoBias)).toBeLessThan(0.2)
      expect(Math.abs(oneHorizontalFlag - twoHorizontalFlag)).toBeLessThan(0.2)
      expect(Math.abs(oneVerticalFlag - twoVerticalFlag)).toBeLessThan(0.2)
    })

    it('keeps one-child and two-child horizontal nodes highly similar', () => {
      const oneChildHorizontal = createMockNode('COMPONENT', {
        id: 'h-solo',
        layoutMode: 'HORIZONTAL',
        width: 87,
        height: 22,
        children: [createMockNode('INSTANCE', { id: 'h-solo-1', x: 20, y: 30, width: 40, height: 20 })]
      })

      const twoChildHorizontal = createMockNode('COMPONENT', {
        id: 'h-two',
        layoutMode: 'HORIZONTAL',
        width: 190,
        height: 22,
        children: [
          createMockNode('INSTANCE', { id: 'h-two-1', x: 20, y: 30, width: 40, height: 20 }),
          createMockNode('INSTANCE', { id: 'h-two-2', x: 90, y: 32, width: 40, height: 20 })
        ]
      })

      const oneEmbedding = createNodeEmbedding(oneChildHorizontal)
      const twoEmbedding = createNodeEmbedding(twoChildHorizontal)

      expect(cosineSimilarity(oneEmbedding, twoEmbedding)).toBeGreaterThan(0.90)
    })

    it('keeps one-child and two-child vertical nodes highly similar', () => {
      const oneChildVertical = createMockNode('COMPONENT', {
        id: 'v-solo',
        layoutMode: 'VERTICAL',
        width: 87,
        height: 22,
        children: [createMockNode('INSTANCE', { id: 'v-solo-1', x: 40, y: 20, width: 40, height: 20 })]
      })

      const twoChildVertical = createMockNode('COMPONENT', {
        id: 'v-two',
        layoutMode: 'VERTICAL',
        width: 87,
        height: 60,
        children: [
          createMockNode('INSTANCE', { id: 'v-two-1', x: 40, y: 20, width: 40, height: 20 }),
          createMockNode('INSTANCE', { id: 'v-two-2', x: 42, y: 90, width: 40, height: 20 })
        ]
      })

      const oneEmbedding = createNodeEmbedding(oneChildVertical)
      const twoEmbedding = createNodeEmbedding(twoChildVertical)

      expect(cosineSimilarity(oneEmbedding, twoEmbedding)).toBeGreaterThan(0.90)
    })

    it('should handle invisible nodes', () => {
      const visibleNode = createMockNode('FRAME', { visible: true })
      const invisibleNode = createMockNode('FRAME', { visible: false })

      const visibleEmbedding = createNodeEmbedding(visibleNode)
      const invisibleEmbedding = createNodeEmbedding(invisibleNode)

      expect(visibleEmbedding).not.toEqual(invisibleEmbedding)
    })
  })

  describe('createTreeEmbedding', () => {
    it('should create embeddings for a tree of nodes', () => {
      const parentNode = createMockNode('FRAME', {
        children: [
          createMockNode('RECTANGLE', { id: 'child-1' }),
          createMockNode('TEXT', { id: 'child-2', characters: 'Child Text' })
        ]
      })

      const embeddings = createTreeEmbedding(parentNode, { includeChildren: true })

      expect(embeddings.length).toBeGreaterThan(0)
      expect(embeddings.length).toBeGreaterThanOrEqual(3)
    })

    it('should respect maxDepth option', () => {
      const deepNode = createMockNode('FRAME', {
        children: [
          createMockNode('FRAME', {
            id: 'level-2',
            children: [
              createMockNode('FRAME', { id: 'level-3' })
            ]
          })
        ]
      })

      const embeddings = createTreeEmbedding(deepNode, { maxDepth: 2 })

      expect(embeddings.length).toBeLessThanOrEqual(3)
    })

    it('should handle includeChildren option', () => {
      const node = createMockNode('FRAME', {
        children: [
          createMockNode('RECTANGLE', { id: 'child-1' })
        ]
      })

      const withChildren = createTreeEmbedding(node, { includeChildren: true })
      const withoutChildren = createTreeEmbedding(node, { includeChildren: false })

      expect(withChildren.length).toBeGreaterThan(withoutChildren.length)
    })
  })

  describe('cosineSimilarity', () => {
    it('should calculate cosine similarity between two vectors', () => {
      const vec1 = [1, 2, 3]
      const vec2 = [1, 2, 3]

      const similarity = cosineSimilarity(vec1, vec2)

      expect(similarity).toBeCloseTo(1, 5)
    })

    it('should return 0 for orthogonal vectors', () => {
      const vec1 = [1, 0, 0]
      const vec2 = [0, 1, 0]

      const similarity = cosineSimilarity(vec1, vec2)

      expect(similarity).toBeCloseTo(0, 5)
    })

    it('should handle vectors of different lengths', () => {
      const vec1 = [1, 2, 3]
      const vec2 = [1, 2]

      expect(() => cosineSimilarity(vec1, vec2)).toThrow()
    })

    it('should return 0 for zero vectors', () => {
      const vec1 = [0, 0, 0]
      const vec2 = [1, 2, 3]

      const similarity = cosineSimilarity(vec1, vec2)

      expect(similarity).toBe(0)
    })
  })

  describe('euclideanDistance', () => {
    it('should calculate euclidean distance between two vectors', () => {
      const vec1 = [0, 0, 0]
      const vec2 = [3, 4, 0]

      const distance = euclideanDistance(vec1, vec2)

      expect(distance).toBeCloseTo(5, 5)
    })

    it('should return 0 for identical vectors', () => {
      const vec1 = [1, 2, 3]
      const vec2 = [1, 2, 3]

      const distance = euclideanDistance(vec1, vec2)

      expect(distance).toBeCloseTo(0, 5)
    })

    it('should handle vectors of different lengths', () => {
      const vec1 = [1, 2, 3]
      const vec2 = [1, 2]

      expect(() => euclideanDistance(vec1, vec2)).toThrow()
    })
  })

  describe('findMostSimilarNodes', () => {
    it('should find the most similar nodes to a query node', () => {
      const queryNode = createMockNode('FRAME', { width: 200, height: 100 })

      const candidateNodes = [
        createMockNode('FRAME', { id: 'similar-1', width: 200, height: 100 }),
        createMockNode('FRAME', { id: 'similar-2', width: 200, height: 100 }),
        createMockNode('TEXT', { id: 'different', characters: 'Different' }),
        createMockNode('RECTANGLE', { id: 'different-2', width: 50, height: 50 })
      ]

      const results = findMostSimilarNodes(queryNode, candidateNodes, 2)

      expect(results).toHaveLength(2)
      expect(results[0].similarity).toBeGreaterThanOrEqual(results[1].similarity)
      expect(results.every(r => r.node.id !== undefined)).toBe(true)
    })

    it('should respect topK parameter', () => {
      const queryNode = createMockNode('FRAME')

      const candidateNodes = [
        createMockNode('FRAME', { id: '1' }),
        createMockNode('FRAME', { id: '2' }),
        createMockNode('FRAME', { id: '3' }),
        createMockNode('FRAME', { id: '4' }),
        createMockNode('FRAME', { id: '5' })
      ]

      const results = findMostSimilarNodes(queryNode, candidateNodes, 3)

      expect(results).toHaveLength(3)
    })
  })

  describe('getEmbeddingDimension', () => {
    it('should return the correct embedding dimension', () => {
      const dimension = getEmbeddingDimension()

      expect(typeof dimension).toBe('number')
      expect(dimension).toBeGreaterThan(0)

      const node = createMockNode('FRAME')
      const embedding = createNodeEmbedding(node)

      expect(embedding.length).toBe(dimension)
    })
  })

  describe('Integration tests', () => {
    it('should work end-to-end: create embeddings and compare', () => {
      const node1 = createMockNode('FRAME', {
        width: 200,
        height: 100,
        fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 }, visible: true }]
      })

      const node2 = createMockNode('FRAME', {
        width: 200,
        height: 100,
        fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 }, visible: true }]
      })

      const node3 = createMockNode('TEXT', {
        characters: 'Different type'
      })

      const embedding1 = createNodeEmbedding(node1)
      const embedding2 = createNodeEmbedding(node2)
      const embedding3 = createNodeEmbedding(node3)

      const similarity12 = cosineSimilarity(embedding1, embedding2)
      const similarity13 = cosineSimilarity(embedding1, embedding3)

      expect(similarity12).toBeGreaterThan(similarity13)
    })

    it('should handle complex node hierarchies', () => {
      const rootNode = createMockNode('FRAME', {
        name: 'Root',
        layoutMode: 'VERTICAL',
        itemSpacing: 16,
        children: [
          createMockNode('FRAME', {
            id: 'header',
            name: 'Header',
            layoutMode: 'HORIZONTAL',
            children: [
              createMockNode('TEXT', { id: 'title', characters: 'Title' }),
              createMockNode('TEXT', { id: 'subtitle', characters: 'Subtitle' })
            ]
          }),
          createMockNode('RECTANGLE', {
            id: 'content',
            name: 'Content',
            fills: [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9, a: 1 }, visible: true }]
          })
        ]
      })

      const embeddings = createTreeEmbedding(rootNode)

      expect(embeddings.length).toBeGreaterThan(0)
      expect(embeddings.every(e => e.length === getEmbeddingDimension())).toBe(true)
    })
  })

  describe('createMergedTreeEmbedding', () => {
    it('should return single vector for merged tree embedding', () => {
      const node = createMockNode('FRAME')
      const merged = createMergedTreeEmbedding(node)

      expect(merged).toBeInstanceOf(Array)
      expect(merged.length).toBe(getEmbeddingDimension())
    })

    it('should use weighted merge strategy by default', () => {
      const parentNode = createMockNode('FRAME', {
        width: 200,
        height: 100,
        children: [
          createMockNode('FRAME', { id: 'child-1', width: 100, height: 50 }),
          createMockNode('FRAME', { id: 'child-2', width: 100, height: 50 })
        ]
      })

      const merged = createMergedTreeEmbedding(parentNode, { mergeStrategy: 'weighted' })

      expect(merged.length).toBe(getEmbeddingDimension())
      expect(merged.every(v => typeof v === 'number' && !isNaN(v))).toBe(true)
    })

    it('should use attention merge strategy', () => {
      const parentNode = createMockNode('FRAME', {
        width: 200,
        height: 100,
        children: [
          createMockNode('FRAME', { id: 'child-1', width: 200, height: 100 }),
          createMockNode('FRAME', { id: 'child-2', width: 50, height: 50 })
        ]
      })

      const merged = createMergedTreeEmbedding(parentNode, { mergeStrategy: 'attention' })

      expect(merged.length).toBe(getEmbeddingDimension())
      expect(merged.every(v => typeof v === 'number' && !isNaN(v))).toBe(true)
    })

    it('should use max merge strategy', () => {
      const parentNode = createMockNode('FRAME', {
        width: 100,
        height: 50,
        children: [
          createMockNode('FRAME', { id: 'child-1', width: 200, height: 100 }),
          createMockNode('FRAME', { id: 'child-2', width: 150, height: 75 })
        ]
      })

      const merged = createMergedTreeEmbedding(parentNode, { mergeStrategy: 'max' })

      expect(merged.length).toBe(getEmbeddingDimension())
      expect(merged.every(v => typeof v === 'number' && !isNaN(v))).toBe(true)
    })

    it('should respect decayRate parameter in weighted strategy', () => {
      const parentNode = createMockNode('FRAME', {
        width: 200,
        height: 100,
        children: [
          createMockNode('FRAME', { id: 'child-1', width: 100, height: 50 }),
          createMockNode('FRAME', { id: 'child-2', width: 100, height: 50 })
        ]
      })

      const mergedLowDecay = createMergedTreeEmbedding(parentNode, { mergeStrategy: 'weighted', decayRate: 0.8 })
      const mergedHighDecay = createMergedTreeEmbedding(parentNode, { mergeStrategy: 'weighted', decayRate: 0.2 })

      expect(mergedLowDecay.length).toBe(getEmbeddingDimension())
      expect(mergedHighDecay.length).toBe(getEmbeddingDimension())
    })

    it('keeps parent layout orientation dominant when merging children', () => {
      const dimension = getEmbeddingDimension()
      const horizontalIndex = EMBEDDING_DIMENSION_KEYS.indexOf('layout_mode:HORIZONTAL')
      const verticalIndex = EMBEDDING_DIMENSION_KEYS.indexOf('layout_mode:VERTICAL')

      expect(horizontalIndex).toBeGreaterThanOrEqual(0)
      expect(verticalIndex).toBeGreaterThanOrEqual(0)

      const parentVector = new Array(dimension).fill(0)
      parentVector[horizontalIndex] = 4

      const childVectors = [
        (() => {
          const child = new Array(dimension).fill(0)
          child[verticalIndex] = 4
          return child
        })(),
        (() => {
          const child = new Array(dimension).fill(0)
          child[verticalIndex] = 4
          return child
        })(),
        (() => {
          const child = new Array(dimension).fill(0)
          child[verticalIndex] = 4
          return child
        })()
      ]

      const merged = mergeVectorsWeighted(parentVector, childVectors, 0.5)

      expect(merged[horizontalIndex]).toBeGreaterThan(merged[verticalIndex])
    })

    it('preserves horizontal and vertical parent direction after weighted merge', () => {
      const horizontal = createMockNode('COMPONENT', {
        id: 'parent-h',
        name: 'layout-horizontal',
        layoutMode: 'HORIZONTAL',
        itemSpacing: 16,
        children: [
          createMockNode('INSTANCE', { id: 'h-1', x: 0, y: 0, width: 87, height: 22 }),
          createMockNode('INSTANCE', { id: 'h-2', x: 103, y: 0, width: 87, height: 22 }),
          createMockNode('INSTANCE', { id: 'h-3', x: 206, y: 0, width: 87, height: 22 })
        ]
      })

      const vertical = createMockNode('COMPONENT', {
        id: 'parent-v',
        name: 'layout-vertical',
        layoutMode: 'VERTICAL',
        itemSpacing: 16,
        children: [
          createMockNode('INSTANCE', { id: 'v-1', x: 0, y: 0, width: 87, height: 22 }),
          createMockNode('INSTANCE', { id: 'v-2', x: 0, y: 38, width: 87, height: 22 }),
          createMockNode('INSTANCE', { id: 'v-3', x: 0, y: 76, width: 87, height: 22 })
        ]
      })

      const horizontalVec = createMergedTreeEmbedding(horizontal, {
        mergeStrategy: 'weighted',
        decayRate: 0.5
      })
      const verticalVec = createMergedTreeEmbedding(vertical, {
        mergeStrategy: 'weighted',
        decayRate: 0.5
      })

      expect(cosineSimilarity(horizontalVec, verticalVec)).toBeLessThan(0.99)
    })

    it('should handle nodes without children', () => {
      const node = createMockNode('FRAME', {
        width: 200,
        height: 100
      })

      const merged = createMergedTreeEmbedding(node)

      const directEmbedding = createNodeEmbedding(node)
      expect(merged).toEqual(directEmbedding)
    })

    it('should handle complex hierarchies with merging', () => {
      const rootNode = createMockNode('FRAME', {
        name: 'Root',
        layoutMode: 'VERTICAL',
        itemSpacing: 16,
        children: [
          createMockNode('FRAME', {
            id: 'header',
            name: 'Header',
            layoutMode: 'HORIZONTAL',
            children: [
              createMockNode('TEXT', { id: 'title', characters: 'Title' }),
              createMockNode('TEXT', { id: 'subtitle', characters: 'Subtitle' })
            ]
          }),
          createMockNode('RECTANGLE', {
            id: 'content',
            name: 'Content',
            fills: [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9, a: 1 }, visible: true }]
          })
        ]
      })

      const merged = createMergedTreeEmbedding(rootNode, { mergeStrategy: 'weighted' })

      expect(merged.length).toBe(getEmbeddingDimension())
      expect(merged.every(v => typeof v === 'number' && !isNaN(v))).toBe(true)
    })

    it('should respect maxDepth option', () => {
      const deepNode = createMockNode('FRAME', {
        children: [
          createMockNode('FRAME', {
            id: 'level-2',
            children: [
              createMockNode('FRAME', { id: 'level-3' })
            ]
          })
        ]
      })

      const merged = createMergedTreeEmbedding(deepNode, { maxDepth: 2, mergeStrategy: 'weighted' })

      expect(merged.length).toBe(getEmbeddingDimension())
    })
  })
})
