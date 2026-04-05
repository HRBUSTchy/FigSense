import type { DiffResult } from '@tempad-dev/shared'

import { countVisibleNodes, getNonPositionStyles } from './design-common'

function diffStyles(
  styleA: Record<string, string>,
  styleB: Record<string, string>
): DiffResult['style'] {
  const keysA = new Set(Object.keys(styleA))
  const keysB = new Set(Object.keys(styleB))

  const added = Array.from(keysB)
    .filter((key) => !keysA.has(key))
    .sort()
  const removed = Array.from(keysA)
    .filter((key) => !keysB.has(key))
    .sort()
  const changed = Array.from(keysA)
    .filter((key) => keysB.has(key) && styleA[key] !== styleB[key])
    .sort()
    .map((key) => ({
      key,
      a: styleA[key],
      b: styleB[key]
    }))

  return {
    added,
    removed,
    changed
  }
}

export async function handleDiff(nodeA: SceneNode, nodeB: SceneNode): Promise<DiffResult> {
  const [styleA, styleB] = await Promise.all([getNonPositionStyles(nodeA), getNonPositionStyles(nodeB)])
  const aCount = countVisibleNodes(nodeA)
  const bCount = countVisibleNodes(nodeB)

  return {
    idA: nodeA.id,
    idB: nodeB.id,
    size: {
      a: { width: nodeA.width, height: nodeA.height },
      b: { width: nodeB.width, height: nodeB.height },
      widthDelta: nodeB.width - nodeA.width,
      heightDelta: nodeB.height - nodeA.height
    },
    nodeCount: {
      a: aCount,
      b: bCount,
      delta: bCount - aCount
    },
    style: diffStyles(styleA, styleB)
  }
}
