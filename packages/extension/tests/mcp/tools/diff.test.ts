import { describe, expect, it, vi } from 'vitest'

import { handleDiff } from '@/mcp/tools/diff'
import { countVisibleNodes, getNonPositionStyles } from '@/mcp/tools/design-common'

vi.mock('@/mcp/tools/design-common', () => ({
  countVisibleNodes: vi.fn(),
  getNonPositionStyles: vi.fn()
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
  it('returns size, node-count, and style differences', async () => {
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
    vi.mocked(countVisibleNodes).mockReturnValueOnce(4).mockReturnValueOnce(6)

    const result = await handleDiff(createNode('a', 100, 80), createNode('b', 120, 90))

    expect(result.idA).toBe('a')
    expect(result.idB).toBe('b')
    expect(result.size.widthDelta).toBe(20)
    expect(result.size.heightDelta).toBe(10)
    expect(result.nodeCount).toEqual({ a: 4, b: 6, delta: 2 })
    expect(result.style.added).toEqual(['border-radius'])
    expect(result.style.removed).toEqual(['border'])
    expect(result.style.changed).toEqual([{ key: 'color', a: '#111111', b: '#ffffff' }])
  })
})
