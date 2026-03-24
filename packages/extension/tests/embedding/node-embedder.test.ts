import { describe, expect, it } from 'vitest'

import {
  createNodeEmbedding,
  createTreeEmbedding,
  createMergedTreeEmbedding,
  cosineSimilarity,
  euclideanDistance,
  findMostSimilarNodes,
  getEmbeddingDimension
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

    it('should handle nodes with layout properties', () => {
      const node = createMockNode('FRAME', {
        layoutMode: 'HORIZONTAL',
        itemSpacing: 16,
        primaryAxisAlignItems: 'MIN'
      })

      const embedding = createNodeEmbedding(node)
      expect(embedding.length).toBeGreaterThan(0)
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
