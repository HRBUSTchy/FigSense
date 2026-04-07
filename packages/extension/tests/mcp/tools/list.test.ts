/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { resolveEmbeddingDocKey } from '@/embedding/indexer/client'
import { getEmbeddingMemory } from '@/embedding/indexer/memory'
import { handleList } from '@/mcp/tools/list'

vi.mock('@/embedding/indexer/client', () => ({
  resolveEmbeddingDocKey: vi.fn(() => null)
}))

vi.mock('@/embedding/indexer/memory', () => ({
  getEmbeddingMemory: vi.fn(() => null)
}))

function createNode(
  id: string,
  type: SceneNode['type'] = 'FRAME',
  children: SceneNode[] = []
): SceneNode {
  return {
    id,
    name: id,
    type,
    visible: true,
    x: 0,
    y: 0,
    width: 100,
    height: 20,
    children
  } as unknown as SceneNode
}

function createPage(id: string, children: SceneNode[]): PageNode {
  return {
    id,
    name: id,
    type: 'PAGE',
    children
  } as unknown as PageNode
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.mocked(resolveEmbeddingDocKey).mockReset()
  vi.mocked(getEmbeddingMemory).mockReset()
  vi.mocked(resolveEmbeddingDocKey).mockReturnValue(null)
  vi.mocked(getEmbeddingMemory).mockReturnValue(null)
})

describe('mcp/tools/list', () => {
  it('clusters only first-level children when scope node is omitted', async () => {
    const deepChild = createNode('deep', 'TEXT')
    const childA = createNode('a', 'FRAME', [deepChild])
    const childB = createNode('b', 'FRAME')

    vi.stubGlobal('window', {
      figma: {
        currentPage: createPage('page', [childA, childB])
      }
    } as unknown as Window)

    const result = await handleList()

    expect(result.scopeNodeId).toBe('page')
    expect(result.totalNodes).toBe(2)
    const ids = result.clusters.flatMap((cluster) => cluster.memberNodeIds)
    expect(ids).toContain('a')
    expect(ids).toContain('b')
    expect(ids).not.toContain('deep')
  })

  it('clusters only first-level children under provided scope node', async () => {
    const deepChild = createNode('deep-2', 'TEXT')
    const childA = createNode('c1', 'FRAME', [deepChild])
    const childB = createNode('c2', 'FRAME')
    const scope = createNode('scope', 'FRAME', [childA, childB])

    vi.stubGlobal('window', {
      figma: {
        currentPage: createPage('page', [scope])
      }
    } as unknown as Window)

    const result = await handleList(scope)

    expect(result.scopeNodeId).toBe('scope')
    expect(result.totalNodes).toBe(2)
    const ids = result.clusters.flatMap((cluster) => cluster.memberNodeIds)
    expect(ids).toContain('c1')
    expect(ids).toContain('c2')
    expect(ids).not.toContain('scope')
    expect(ids).not.toContain('deep-2')
  })

  it('merges nodes by vector similarity even if layout orientation differs', async () => {
    const sharedVec = [0.12, 0.34, 0.56, 0.78]
    const vectorStore = new Map<string, { vec: number[] }>([
      ['h-1', { vec: sharedVec }],
      ['h-2', { vec: sharedVec }],
      ['v-1', { vec: sharedVec }],
      ['v-2', { vec: sharedVec }]
    ])

    vi.mocked(resolveEmbeddingDocKey).mockReturnValue({
      docKey: 'figma:file:page:v1'
    } as any)
    vi.mocked(getEmbeddingMemory).mockReturnValue({
      get: (id: string) => vectorStore.get(id)
    } as any)

    const horizontal1 = createNode('h-1', 'COMPONENT', [createNode('h-1-c1'), createNode('h-1-c2')])
    ;(horizontal1 as any).layoutMode = 'HORIZONTAL'
    const horizontal2 = createNode('h-2', 'COMPONENT', [createNode('h-2-c1'), createNode('h-2-c2')])
    ;(horizontal2 as any).layoutMode = 'HORIZONTAL'
    const vertical1 = createNode('v-1', 'COMPONENT', [createNode('v-1-c1'), createNode('v-1-c2')])
    ;(vertical1 as any).layoutMode = 'VERTICAL'
    const vertical2 = createNode('v-2', 'COMPONENT', [createNode('v-2-c1'), createNode('v-2-c2')])
    ;(vertical2 as any).layoutMode = 'VERTICAL'

    vi.stubGlobal('window', {
      figma: {
        currentPage: createPage('page', [horizontal1, horizontal2, vertical1, vertical2])
      }
    } as unknown as Window)

    const result = await handleList()
    const clusterByNodeId = new Map<string, string>()
    for (const cluster of result.clusters) {
      for (const nodeId of cluster.memberNodeIds) {
        clusterByNodeId.set(nodeId, cluster.clusterId)
      }
    }

    expect(result.clusters).toHaveLength(1)
    expect(clusterByNodeId.get('h-1')).toBe(clusterByNodeId.get('h-2'))
    expect(clusterByNodeId.get('v-1')).toBe(clusterByNodeId.get('v-2'))
    expect(clusterByNodeId.get('h-1')).toBe(clusterByNodeId.get('v-1'))
  })

  it('refines coarse vector cluster into tighter subclusters', async () => {
    const vectorStore = new Map<string, { vec: number[] }>([
      ['a-1', { vec: [1, 0, 0, 0] }],
      ['a-2', { vec: [0.999, 0.001, 0, 0] }],
      ['b-1', { vec: [0.95, 0.31225, 0, 0] }],
      ['b-2', { vec: [0.949, 0.315, 0, 0] }]
    ])

    vi.mocked(resolveEmbeddingDocKey).mockReturnValue({
      docKey: 'figma:file:page:v1'
    } as any)
    vi.mocked(getEmbeddingMemory).mockReturnValue({
      get: (id: string) => vectorStore.get(id)
    } as any)

    vi.stubGlobal('window', {
      figma: {
        currentPage: createPage('page', [
          createNode('a-1', 'COMPONENT'),
          createNode('a-2', 'COMPONENT'),
          createNode('b-1', 'COMPONENT'),
          createNode('b-2', 'COMPONENT')
        ])
      }
    } as unknown as Window)

    const result = await handleList()

    expect(result.clusters).toHaveLength(2)
    const sortedSizes = result.clusters.map((cluster) => cluster.size).sort((a, b) => b - a)
    expect(sortedSizes).toEqual([2, 2])
  })

  it('keeps transitive-high-similarity nodes in one refined cluster', async () => {
    const vectorStore = new Map<string, { vec: number[] }>([
      ['a', { vec: [1, 0, 0, 0] }],
      ['c', { vec: [0.9902680687415704, 0.13917310096006544, 0, 0] }],
      ['e', { vec: [0.9396926207859084, 0.3420201433256687, 0, 0] }],
      ['b', { vec: [0.9975640502598242, 0.0697564737441253, 0, 0] }],
      ['d', { vec: [0.9781476007338057, 0.20791169081775934, 0, 0] }]
    ])

    vi.mocked(resolveEmbeddingDocKey).mockReturnValue({
      docKey: 'figma:file:page:v1'
    } as any)
    vi.mocked(getEmbeddingMemory).mockReturnValue({
      get: (id: string) => vectorStore.get(id)
    } as any)

    vi.stubGlobal('window', {
      figma: {
        currentPage: createPage('page', [
          createNode('a', 'COMPONENT'),
          createNode('c', 'COMPONENT'),
          createNode('e', 'COMPONENT'),
          createNode('b', 'COMPONENT'),
          createNode('d', 'COMPONENT')
        ])
      }
    } as unknown as Window)

    const result = await handleList()

    expect(result.clusters).toHaveLength(2)
    const sortedSizes = result.clusters.map((cluster) => cluster.size).sort((a, b) => b - a)
    expect(sortedSizes).toEqual([4, 1])
  })

  it('keeps nodes without vectors as separate fallback clusters', async () => {
    const childA = createNode('no-vec-a', 'FRAME')
    const childB = createNode('no-vec-b', 'FRAME')

    vi.stubGlobal('window', {
      figma: {
        currentPage: createPage('page', [childA, childB])
      }
    } as unknown as Window)

    const result = await handleList()

    expect(result.clusters).toHaveLength(2)
    const ids = result.clusters.flatMap((cluster) => cluster.memberNodeIds)
    expect(ids).toContain('no-vec-a')
    expect(ids).toContain('no-vec-b')
  })
})
