import type { DistanceResult } from '@tempad-dev/shared'

import { getAbsoluteRect } from './design-common'

type Rect = {
  x: number
  y: number
  width: number
  height: number
}

function containsRect(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  )
}

function gap1d(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  if (aEnd < bStart) return bStart - aEnd
  if (bEnd < aStart) return aStart - bEnd
  return 0
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

export function handleDistance(nodeA: SceneNode, nodeB: SceneNode): DistanceResult {
  const rectA = getAbsoluteRect(nodeA)
  const rectB = getAbsoluteRect(nodeB)
  const aContainsB = containsRect(rectA, rectB)
  const bContainsA = containsRect(rectB, rectA)

  if (aContainsB || bContainsA) {
    const outer = aContainsB ? { node: nodeA, rect: rectA } : { node: nodeB, rect: rectB }
    const inner = aContainsB ? { node: nodeB, rect: rectB } : { node: nodeA, rect: rectA }

    return {
      idA: nodeA.id,
      idB: nodeB.id,
      relationship: aContainsB ? 'a_contains_b' : 'b_contains_a',
      horizontal: 0,
      vertical: 0,
      inside: {
        outerId: outer.node.id,
        innerId: inner.node.id,
        left: round(inner.rect.x - outer.rect.x),
        right: round(outer.rect.x + outer.rect.width - (inner.rect.x + inner.rect.width)),
        top: round(inner.rect.y - outer.rect.y),
        bottom: round(outer.rect.y + outer.rect.height - (inner.rect.y + inner.rect.height))
      }
    }
  }

  const horizontal = gap1d(rectA.x, rectA.x + rectA.width, rectB.x, rectB.x + rectB.width)
  const vertical = gap1d(rectA.y, rectA.y + rectA.height, rectB.y, rectB.y + rectB.height)

  return {
    idA: nodeA.id,
    idB: nodeB.id,
    relationship: 'separate_or_overlap',
    horizontal: round(horizontal),
    vertical: round(vertical)
  }
}
