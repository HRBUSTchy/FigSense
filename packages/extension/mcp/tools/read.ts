import type { ReadNode, ReadResult } from '@tempad-dev/shared'

import { getNonPositionStyles } from './design-common'

const DEFAULT_MAX_DEPTH = 4
const DEFAULT_MAX_CHILDREN = 80
const MAX_TEXT_PREVIEW = 400

function visibleChildren(node: SceneNode): SceneNode[] {
  if (!('children' in node)) return []
  return node.children.filter(
    (child): child is SceneNode => !!child && 'visible' in child && child.visible
  )
}

function toPreviewText(node: SceneNode): string | undefined {
  if (node.type !== 'TEXT' || typeof node.characters !== 'string') return undefined
  if (node.characters.length <= MAX_TEXT_PREVIEW) {
    return node.characters
  }
  return `${node.characters.slice(0, MAX_TEXT_PREVIEW)}...`
}

async function buildReadTree(
  node: SceneNode,
  depth: number,
  maxDepth: number,
  maxChildren: number,
  truncatedNodeIds: Set<string>
): Promise<ReadNode> {
  const children = visibleChildren(node)
  const styles = await getNonPositionStyles(node)
  const textPreview = toPreviewText(node)

  const result: ReadNode = {
    id: node.id,
    name: node.name ?? '',
    type: node.type,
    visible: !!node.visible,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    styles,
    ...(textPreview ? { text: textPreview } : {})
  }

  if (!children.length) {
    return result
  }

  if (depth >= maxDepth) {
    truncatedNodeIds.add(node.id)
    result.truncated = {
      reason: 'depth',
      omittedChildCount: children.length,
      omittedChildNodeIds: children.map((child) => child.id)
    }
    return result
  }

  const keptChildren = children.slice(0, maxChildren)
  if (keptChildren.length) {
    result.children = await Promise.all(
      keptChildren.map((child) => buildReadTree(child, depth + 1, maxDepth, maxChildren, truncatedNodeIds))
    )
  }

  if (children.length > keptChildren.length) {
    truncatedNodeIds.add(node.id)
    result.truncated = {
      reason: 'children',
      omittedChildCount: children.length - keptChildren.length,
      omittedChildNodeIds: children.slice(keptChildren.length).map((child) => child.id)
    }
  }

  return result
}

export async function handleRead(
  node: SceneNode,
  options?: { maxDepth?: number; maxChildren?: number }
): Promise<ReadResult> {
  const maxDepth = Math.max(1, options?.maxDepth ?? DEFAULT_MAX_DEPTH)
  const maxChildren = Math.max(1, options?.maxChildren ?? DEFAULT_MAX_CHILDREN)
  const truncatedNodeIds = new Set<string>()
  const root = await buildReadTree(node, 0, maxDepth, maxChildren, truncatedNodeIds)

  return {
    root,
    maxDepth,
    maxChildren,
    truncatedNodeIds: Array.from(truncatedNodeIds)
  }
}
