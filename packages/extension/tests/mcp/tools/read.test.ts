import { describe, expect, it, vi } from 'vitest'

import { getNonPositionStyles } from '@/mcp/tools/design-common'
import { handleRead } from '@/mcp/tools/read'

vi.mock('@/mcp/tools/design-common', () => ({
  getNonPositionStyles: vi.fn()
}))

function createFrame(id: string, children: SceneNode[] = []): SceneNode {
  return {
    id,
    name: id,
    type: 'FRAME',
    visible: true,
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    children
  } as unknown as SceneNode
}

describe('mcp/tools/read', () => {
  it('truncates by depth and returns omitted child ids', async () => {
    vi.mocked(getNonPositionStyles).mockResolvedValue({})
    const leaf = createFrame('leaf')
    const child = createFrame('child', [leaf])
    const root = createFrame('root', [child])

    const result = await handleRead(root, { maxDepth: 1, maxChildren: 10 })

    expect(result.root.children?.[0]?.id).toBe('child')
    expect(result.root.children?.[0]?.truncated).toEqual({
      reason: 'depth',
      omittedChildCount: 1,
      omittedChildNodeIds: ['leaf']
    })
    expect(result.truncatedNodeIds).toContain('child')
  })

  it('truncates by child count when a node is too wide', async () => {
    vi.mocked(getNonPositionStyles).mockResolvedValue({})
    const root = createFrame('root', [createFrame('c1'), createFrame('c2')])

    const result = await handleRead(root, { maxDepth: 3, maxChildren: 1 })

    expect(result.root.children?.map((child: { id: string }) => child.id)).toEqual(['c1'])
    expect(result.root.truncated).toEqual({
      reason: 'children',
      omittedChildCount: 1,
      omittedChildNodeIds: ['c2']
    })
    expect(result.truncatedNodeIds).toContain('root')
  })
})
