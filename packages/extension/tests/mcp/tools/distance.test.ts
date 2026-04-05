import { describe, expect, it } from 'vitest'

import { handleDistance } from '@/mcp/tools/distance'

function createNode(id: string, x: number, y: number, width: number, height: number): SceneNode {
  return {
    id,
    name: id,
    type: 'FRAME',
    visible: true,
    x,
    y,
    width,
    height,
    absoluteTransform: [
      [1, 0, x],
      [0, 1, y]
    ]
  } as unknown as SceneNode
}

describe('mcp/tools/distance', () => {
  it('returns inside edge distances when one node contains another', () => {
    const outer = createNode('outer', 10, 20, 200, 100)
    const inner = createNode('inner', 30, 40, 50, 20)

    const result = handleDistance(outer, inner)

    expect(result.relationship).toBe('a_contains_b')
    expect(result.inside).toEqual({
      outerId: 'outer',
      innerId: 'inner',
      left: 20,
      right: 130,
      top: 20,
      bottom: 60
    })
  })

  it('returns horizontal and vertical gaps for non-containing nodes', () => {
    const a = createNode('a', 0, 0, 50, 40)
    const b = createNode('b', 80, 70, 20, 20)

    const result = handleDistance(a, b)

    expect(result.relationship).toBe('separate_or_overlap')
    expect(result.horizontal).toBe(30)
    expect(result.vertical).toBe(30)
    expect(result.inside).toBeUndefined()
  })

  it('returns zero gaps when nodes overlap but do not contain each other', () => {
    const a = createNode('a', 0, 0, 100, 60)
    const b = createNode('b', 70, 30, 100, 60)

    const result = handleDistance(a, b)

    expect(result.relationship).toBe('separate_or_overlap')
    expect(result.horizontal).toBe(0)
    expect(result.vertical).toBe(0)
  })
})
