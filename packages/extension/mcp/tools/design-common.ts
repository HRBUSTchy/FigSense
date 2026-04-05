import { resolveStylesFromNode } from '@tempad-dev/shared'

import type { EmbeddableNode } from '@/embedding/types'

import { createNodeEmbedding } from '@/embedding/node-embedder'
import { preprocessCssValue, stripFallback } from '@/utils/css'

const NON_POSITION_STYLE_KEYS = new Set([
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'inset',
  'inset-x',
  'inset-y',
  'z-index',
  'display',
  'flex',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'flex-direction',
  'flex-wrap',
  'align-self',
  'align-items',
  'justify-self',
  'justify-items',
  'justify-content',
  'place-self',
  'place-items',
  'place-content',
  'order',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'overflow',
  'overflow-x',
  'overflow-y',
  'gap',
  'row-gap',
  'column-gap',
  'transform',
  'translate',
  'rotate',
  'scale'
])

function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) / 0xffffffff
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function parsePaintList(value: unknown): unknown[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value
    .map((paint) => {
      if (!paint || typeof paint !== 'object') return null
      const obj = paint as Record<string, unknown>
      const type = asString(obj.type, 'UNKNOWN')
      const visible = obj.visible
      const opacity = obj.opacity
      const colorValue = obj.color
      const color =
        colorValue && typeof colorValue === 'object'
          ? {
              r: asNumber((colorValue as Record<string, unknown>).r, 0),
              g: asNumber((colorValue as Record<string, unknown>).g, 0),
              b: asNumber((colorValue as Record<string, unknown>).b, 0)
            }
          : undefined
      return {
        type,
        ...(typeof visible === 'boolean' ? { visible } : {}),
        ...(typeof opacity === 'number' ? { opacity } : {}),
        ...(color ? { color } : {})
      }
    })
    .filter(Boolean) as unknown[]
}

function parseEffectList(value: unknown): Array<{ type: string; visible?: boolean }> | undefined {
  if (!Array.isArray(value)) return undefined
  return value
    .map((effect) => {
      if (!effect || typeof effect !== 'object') return null
      const obj = effect as Record<string, unknown>
      const type = asString(obj.type, '')
      if (!type) return null
      const visible = obj.visible
      return {
        type,
        ...(typeof visible === 'boolean' ? { visible } : {})
      }
    })
    .filter(Boolean) as Array<{ type: string; visible?: boolean }>
}

function visibleSceneChildren(node: SceneNode): SceneNode[] {
  if (!('children' in node)) return []
  return node.children.filter(
    (child): child is SceneNode => !!child && 'visible' in child && child.visible
  )
}

export function collectVisibleSceneNodes(scopeNode?: SceneNode): SceneNode[] {
  const result: SceneNode[] = []
  const stack: SceneNode[] = []

  if (scopeNode) {
    stack.push(scopeNode)
  } else {
    const page = window.figma?.currentPage
    if (!page) return result
    for (let i = page.children.length - 1; i >= 0; i -= 1) {
      const child = page.children[i]
      if ('visible' in child && child.visible) {
        stack.push(child as SceneNode)
      }
    }
  }

  while (stack.length) {
    const node = stack.pop()!
    if (!node.visible) continue
    result.push(node)
    const children = visibleSceneChildren(node)
    for (let i = children.length - 1; i >= 0; i -= 1) {
      stack.push(children[i]!)
    }
  }

  return result
}

export function countVisibleNodes(node: SceneNode): number {
  let count = 0
  const stack: SceneNode[] = [node]
  while (stack.length) {
    const current = stack.pop()!
    if (!current.visible) continue
    count += 1
    const children = visibleSceneChildren(current)
    for (let i = children.length - 1; i >= 0; i -= 1) {
      stack.push(children[i]!)
    }
  }
  return count
}

export function getAbsoluteRect(node: SceneNode): {
  x: number
  y: number
  width: number
  height: number
} {
  if ('absoluteTransform' in node && Array.isArray(node.absoluteTransform)) {
    const [row0, row1] = node.absoluteTransform
    if (Array.isArray(row0) && Array.isArray(row1) && row0.length >= 3 && row1.length >= 3) {
      return {
        x: asNumber(row0[2], node.x),
        y: asNumber(row1[2], node.y),
        width: asNumber(node.width, 0),
        height: asNumber(node.height, 0)
      }
    }
  }
  return {
    x: asNumber(node.x, 0),
    y: asNumber(node.y, 0),
    width: asNumber(node.width, 0),
    height: asNumber(node.height, 0)
  }
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0
  let dot = 0
  let aNorm = 0
  let bNorm = 0
  for (let i = 0; i < vecA.length; i += 1) {
    const a = vecA[i] ?? 0
    const b = vecB[i] ?? 0
    dot += a * b
    aNorm += a * a
    bNorm += b * b
  }
  if (aNorm === 0 || bNorm === 0) return 0
  return dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm))
}

export function toEmbeddableNode(node: SceneNode): EmbeddableNode {
  const base: EmbeddableNode = {
    id: node.id,
    name: node.name ?? '',
    type: node.type,
    visible: !!node.visible,
    x: asNumber(node.x, 0),
    y: asNumber(node.y, 0),
    width: asNumber(node.width, 0),
    height: asNumber(node.height, 0)
  }

  const children = visibleSceneChildren(node)
  if (children.length) {
    base.children = children.map((child) => ({ id: child.id, visible: true }))
  }

  if ('layoutMode' in node && typeof node.layoutMode === 'string') {
    base.layoutMode = node.layoutMode
  }
  if ('primaryAxisAlignItems' in node && typeof node.primaryAxisAlignItems === 'string') {
    base.primaryAxisAlignItems = node.primaryAxisAlignItems
  }
  if ('itemSpacing' in node) {
    base.itemSpacing = node.itemSpacing
  }

  if ('fills' in node && Array.isArray(node.fills)) {
    base.fills = parsePaintList(node.fills)
  }
  if ('strokes' in node && Array.isArray(node.strokes)) {
    base.strokes = parsePaintList(node.strokes)
  }
  if ('strokeWeight' in node) {
    base.strokeWeight = node.strokeWeight
  }
  if ('cornerRadius' in node) {
    base.cornerRadius = node.cornerRadius
  }
  if ('topLeftRadius' in node) {
    base.topLeftRadius = node.topLeftRadius
  }
  if ('topRightRadius' in node) {
    base.topRightRadius = node.topRightRadius
  }
  if ('bottomLeftRadius' in node) {
    base.bottomLeftRadius = node.bottomLeftRadius
  }
  if ('bottomRightRadius' in node) {
    base.bottomRightRadius = node.bottomRightRadius
  }
  if ('opacity' in node) {
    base.opacity = node.opacity
  }
  if ('locked' in node) {
    base.locked = node.locked
  }
  if ('rotation' in node) {
    base.rotation = node.rotation
  }
  if ('blendMode' in node) {
    base.blendMode = node.blendMode
  }
  if ('effects' in node && Array.isArray(node.effects)) {
    base.effects = parseEffectList(node.effects)
  }
  if (node.type === 'TEXT' && typeof node.characters === 'string') {
    base.characters = node.characters
  }

  return base
}

export function toEmbeddableNodeFromDescription(
  description: Record<string, unknown>,
  structureOnly = false
): EmbeddableNode {
  const base: EmbeddableNode = {
    id: asString(description.id, 'description'),
    name: asString(description.name, 'description'),
    type: asString(description.type, 'FRAME'),
    visible: asBoolean(description.visible, true),
    x: asNumber(description.x, 0),
    y: asNumber(description.y, 0),
    width: asNumber(description.width, 0),
    height: asNumber(description.height, 0)
  }

  if (Array.isArray(description.children)) {
    base.children = description.children
      .map((child, index) => {
        if (!child || typeof child !== 'object') return null
        const obj = child as Record<string, unknown>
        return {
          id: asString(obj.id, `child-${index}`),
          visible: asBoolean(obj.visible, true)
        }
      })
      .filter(Boolean) as Array<{ id: string; visible: boolean }>
  }

  if (typeof description.layoutMode === 'string') {
    base.layoutMode = description.layoutMode
  }
  if (typeof description.primaryAxisAlignItems === 'string') {
    base.primaryAxisAlignItems = description.primaryAxisAlignItems
  }
  if (typeof description.itemSpacing === 'number') {
    base.itemSpacing = description.itemSpacing
  }
  if (!structureOnly) {
    base.fills = parsePaintList(description.fills)
    base.strokes = parsePaintList(description.strokes)
    base.effects = parseEffectList(description.effects)
    if (typeof description.strokeWeight === 'number') base.strokeWeight = description.strokeWeight
    if (typeof description.cornerRadius === 'number') base.cornerRadius = description.cornerRadius
    if (typeof description.opacity === 'number') base.opacity = description.opacity
    if (typeof description.characters === 'string') base.characters = description.characters
    if (typeof description.blendMode === 'string') base.blendMode = description.blendMode
  }

  return base
}

export function buildStructureVector(nodeLike: {
  type: string
  width: number
  height: number
  children?: ReadonlyArray<{ id: string; visible: boolean }>
  layoutMode?: string
  itemSpacing?: unknown
  characters?: string
}): number[] {
  const width = asNumber(nodeLike.width, 0)
  const height = asNumber(nodeLike.height, 0)
  const aspect = height > 0 ? width / height : 0
  const childrenCount = Array.isArray(nodeLike.children) ? nodeLike.children.length : 0
  const visibleChildrenCount = Array.isArray(nodeLike.children)
    ? nodeLike.children.filter((child) => child.visible).length
    : 0
  const layoutMode = typeof nodeLike.layoutMode === 'string' ? nodeLike.layoutMode : 'NONE'
  const textLength = typeof nodeLike.characters === 'string' ? nodeLike.characters.length : 0

  return [
    hashString(nodeLike.type),
    Math.min(width / 2000, 1),
    Math.min(height / 2000, 1),
    Math.min(aspect / 10, 1),
    Math.min(childrenCount / 20, 1),
    Math.min(visibleChildrenCount / 20, 1),
    hashString(layoutMode),
    Math.min(asNumber(nodeLike.itemSpacing, 0) / 200, 1),
    Math.min(textLength / 300, 1)
  ]
}

export function buildNodeEmbedding(node: SceneNode): number[] {
  return createNodeEmbedding(toEmbeddableNode(node))
}

export function buildDescriptionEmbedding(
  description: Record<string, unknown>,
  structureOnly = false
): number[] {
  const embeddable = toEmbeddableNodeFromDescription(description, structureOnly)
  if (structureOnly) {
    return buildStructureVector(embeddable)
  }
  return createNodeEmbedding(embeddable)
}

export async function getNonPositionStyles(node: SceneNode): Promise<Record<string, string>> {
  let css: Record<string, string>
  try {
    css = await node.getCSSAsync()
    css = await resolveStylesFromNode(css, node)
  } catch {
    return {}
  }

  const normalizedEntries = Object.entries(css)
    .filter(([key, value]) => !!key && value != null && !NON_POSITION_STYLE_KEYS.has(key))
    .map(([key, value]) => [key, stripFallback(preprocessCssValue(String(value)))])
    .filter(([, value]) => !!value)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))

  return Object.fromEntries(normalizedEntries)
}

export function resolveNodeBrief(nodeId: string): { name: string; type: string } {
  const node = figma.getNodeById(nodeId)
  if (node && 'visible' in node) {
    const sceneNode = node as SceneNode
    return {
      name: sceneNode.name ?? '',
      type: sceneNode.type
    }
  }
  return { name: '', type: 'UNKNOWN' }
}
