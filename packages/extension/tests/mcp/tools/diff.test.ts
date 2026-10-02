import { describe, expect, it, vi } from 'vitest'

import { buildNodeEmbedding, cosineSimilarity, getNonPositionStyles } from '@/mcp/tools/design-common'
import { handleDiff } from '@/mcp/tools/diff'

vi.mock('@/mcp/tools/design-common', () => ({
  buildNodeEmbedding: vi.fn(),
  cosineSimilarity: vi.fn(),
  getNonPositionStyles: vi.fn(),
  toEmbeddableNode: vi.fn(),
  countVisibleNodes: vi.fn()
}))

vi.mock('@/embedding/indexer/client', () => ({
  resolveEmbeddingDocKey: vi.fn(() => null)
}))

vi.mock('@/embedding/indexer/memory', () => ({
  getEmbeddingMemory: vi.fn(() => null)
}))

function createNode(id: string, width: number, height: number): SceneNode {
  return {
    id,
    name: id,
    type: 'FRAME',
    visible: true,
    x: 0,
    y: 0,
    width,
    height
  } as unknown as SceneNode
}

describe('mcp/tools/diff', () => {
  it('returns similarity and diff tree with style details', async () => {
    vi.mocked(buildNodeEmbedding)
      .mockReturnValueOnce([0.1, 0.2, 0.3])
      .mockReturnValueOnce([0.1, 0.2, 0.35])
    vi.mocked(cosineSimilarity).mockReturnValue(0.92)
    vi.mocked(getNonPositionStyles)
      .mockResolvedValueOnce({
        color: '#111111',
        border: '1px solid #000',
        opacity: '0.8'
      })
      .mockResolvedValueOnce({
        color: '#ffffff',
        'border-radius': '8px',
        opacity: '0.8'
      })

    const result = await handleDiff(createNode('a', 100, 80), createNode('b', 120, 90))

    expect(result.idA).toBe('a')
    expect(result.idB).toBe('b')
    expect(result.similarity).toBe(0.92)
    expect(result.rootLevel).toBe('size')
    expect(result.diffTree.level).toBe('size')
    expect(result.diffTree.details?.sizeDelta).toEqual({ width: 20, height: 10 })
    expect(result.diffTree.details?.styleDeltaCount).toBe(1) // color changed
    expect(result.summary.totalCompared).toBeGreaterThanOrEqual(1)
  })

  it('returns identical when similarity >= 0.98', async () => {
    vi.mocked(buildNodeEmbedding)
      .mockReturnValueOnce([0.5, 0.5])
      .mockReturnValueOnce([0.5, 0.5])
    vi.mocked(cosineSimilarity).mockReturnValue(0.99)
    vi.mocked(getNonPositionStyles)
      .mockResolvedValueOnce({ color: 'red' })
      .mockResolvedValueOnce({ color: 'red' })

    const result = await handleDiff(createNode('a', 100, 100), createNode('b', 100, 100))

    expect(result.rootLevel).toBe('identical')
    expect(result.diffTree.level).toBe('identical')
    expect(result.summary.identicalCount).toBe(1)
  })
})
