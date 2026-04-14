/* eslint-disable @typescript-eslint/no-explicit-any */
import { createWorkerRequester } from '@/codegen/requester'

import type {
  CachedVectorEntry,
  EmbeddingIndexOptions,
  EmbeddingIndexProcessResponse,
  EmbeddingIndexRequestPayload,
  EmbeddingIndexResponsePayload,
  NodeSnapshot
} from './types'

import { EMBEDDING_INDEX_VERSION } from './types'
import EmbeddingIndexWorker from './worker?worker&inline'

let cachedRequester:
  | ((payload: EmbeddingIndexRequestPayload) => Promise<EmbeddingIndexResponsePayload>)
  | null = null

function getRequester(): (payload: EmbeddingIndexRequestPayload) => Promise<EmbeddingIndexResponsePayload> {
  if (cachedRequester) return cachedRequester
  if (typeof Worker === 'undefined') {
    throw new Error('Web Worker is not available in this environment.')
  }
  cachedRequester = createWorkerRequester<EmbeddingIndexRequestPayload, EmbeddingIndexResponsePayload>(
    EmbeddingIndexWorker
  )
  return cachedRequester
}

function resolveFigmaFileKey(pathname: string = location.pathname): string | null {
  const match = pathname.match(/\/(file|design)\/([^/]+)/)
  return match?.[2] ?? null
}

export function resolveEmbeddingDocKey(): { docKey: string; fileKey: string; pageId: string } | null {
  const fileKey = resolveFigmaFileKey()
  const pageId = window.figma?.currentPage?.id ?? null
  if (!fileKey || !pageId) return null
  return {
    docKey: `figma:${fileKey}:${pageId}:v${EMBEDDING_INDEX_VERSION}`,
    fileKey,
    pageId
  }
}

function serializePaint(paint: any): any {
  if (!paint || typeof paint !== 'object') return null
  const type = typeof paint.type === 'string' ? paint.type : 'UNKNOWN'
  const visible = typeof paint.visible === 'boolean' ? paint.visible : undefined
  const opacity = typeof paint.opacity === 'number' ? paint.opacity : undefined
  const colorValue = paint.color
  const color =
    colorValue && typeof colorValue === 'object'
      ? {
          r: typeof colorValue.r === 'number' ? colorValue.r : 0,
          g: typeof colorValue.g === 'number' ? colorValue.g : 0,
          b: typeof colorValue.b === 'number' ? colorValue.b : 0
        }
      : undefined

  return { type, ...(visible !== undefined ? { visible } : {}), ...(opacity !== undefined ? { opacity } : {}), ...(color ? { color } : {}) }
}

function serializePaintList(value: unknown): unknown[] | null {
  if (!Array.isArray(value)) return null
  const result = value.map(serializePaint).filter(Boolean)
  return result.length ? result : null
}

function serializeEffects(value: unknown): Array<{ type: string; visible?: boolean }> | null {
  if (!Array.isArray(value)) return null
  const effects = value
    .map((effect: any) => {
      if (!effect || typeof effect !== 'object') return null
      const type = typeof effect.type === 'string' ? effect.type : null
      if (!type) return null
      const visible = typeof effect.visible === 'boolean' ? effect.visible : undefined
      return { type, ...(visible !== undefined ? { visible } : {}) }
    })
    .filter(Boolean) as Array<{ type: string; visible?: boolean }>
  return effects.length ? effects : null
}

/**
 * Recursively serializes a child node with no depth limit.
 * All descendants are fully serialized so that embedding features
 * can access the complete subtree structure.
 */
function serializeChildNode(child: SceneNode): Record<string, unknown> {
  const obj: Record<string, unknown> = {
    id: child.id,
    type: child.type,
    name: (child as any).name ?? '',
    visible: !!child.visible
  }

  if (typeof child.x === 'number') obj.x = child.x
  if (typeof child.y === 'number') obj.y = child.y
  if (typeof child.width === 'number') obj.width = child.width
  if (typeof child.height === 'number') obj.height = child.height

  if ('fills' in child) {
    const f = serializePaintList((child as any).fills)
    if (f) obj.fills = f
  }
  if ('strokes' in child) {
    const s = serializePaintList((child as any).strokes)
    if (s) obj.strokes = s
  }
  if (typeof (child as any).opacity === 'number') obj.opacity = (child as any).opacity

  // Recursively serialize all nested children without depth limit
  if ('children' in child && Array.isArray(child.children)) {
    const nestedChildren = child.children
      .filter((gc): gc is SceneNode => !!gc && typeof (gc as any).id === 'string' && 'visible' in gc && gc.visible !== false)
      .map((gc) => serializeChildNode(gc))
    if (nestedChildren.length > 0) obj.children = nestedChildren
  }

  return obj
}

function serializeNode(node: SceneNode): NodeSnapshot {
  const base: NodeSnapshot = {
    id: node.id,
    name: node.name ?? '',
    type: node.type,
    visible: !!node.visible,
    x: typeof node.x === 'number' ? node.x : 0,
    y: typeof node.y === 'number' ? node.y : 0,
    width: typeof node.width === 'number' ? node.width : 0,
    height: typeof node.height === 'number' ? node.height : 0
  }

  if ('children' in node && Array.isArray(node.children)) {
    base.children = node.children
      .filter((child): child is SceneNode => !!child && typeof (child as any).id === 'string' && 'visible' in child && child.visible !== false)
      .map((child) => serializeChildNode(child)) as NodeSnapshot['children']
  }

  if ('layoutMode' in node && typeof (node as any).layoutMode === 'string') {
    base.layoutMode = (node as any).layoutMode
  }
  if ('primaryAxisAlignItems' in node && typeof (node as any).primaryAxisAlignItems === 'string') {
    base.primaryAxisAlignItems = (node as any).primaryAxisAlignItems
  }
  if ('itemSpacing' in node && typeof (node as any).itemSpacing === 'number') {
    base.itemSpacing = (node as any).itemSpacing
  }

  if ('fills' in node) {
    base.fills = serializePaintList((node as any).fills)
  }
  if ('strokes' in node) {
    base.strokes = serializePaintList((node as any).strokes)
  }
  if ('strokeWeight' in node && typeof (node as any).strokeWeight === 'number') {
    base.strokeWeight = (node as any).strokeWeight
  }

  if ('cornerRadius' in node && typeof (node as any).cornerRadius === 'number') {
    base.cornerRadius = (node as any).cornerRadius
  } else if ('topLeftRadius' in node) {
    const anyNode = node as any
    base.topLeftRadius = typeof anyNode.topLeftRadius === 'number' ? anyNode.topLeftRadius : 0
    base.topRightRadius = typeof anyNode.topRightRadius === 'number' ? anyNode.topRightRadius : 0
    base.bottomLeftRadius = typeof anyNode.bottomLeftRadius === 'number' ? anyNode.bottomLeftRadius : 0
    base.bottomRightRadius = typeof anyNode.bottomRightRadius === 'number' ? anyNode.bottomRightRadius : 0
  }

  if ('opacity' in node && typeof (node as any).opacity === 'number') {
    base.opacity = (node as any).opacity
  }
  if ('locked' in node && typeof (node as any).locked === 'boolean') {
    base.locked = (node as any).locked
  }
  if ('rotation' in node && typeof (node as any).rotation === 'number') {
    base.rotation = (node as any).rotation
  }
  if ('blendMode' in node && typeof (node as any).blendMode === 'string') {
    base.blendMode = (node as any).blendMode
  }

  if ('effects' in node) {
    base.effects = serializeEffects((node as any).effects)
  }

  if (node.type === 'TEXT' && 'characters' in node && typeof (node as any).characters === 'string') {
    base.characters = (node as any).characters
  }

  return base
}

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve())
      return
    }
    setTimeout(resolve, 0)
  })
}

export async function snapshotCurrentPagePostorder({
  yieldEvery = 50
}: { yieldEvery?: number } = {}): Promise<NodeSnapshot[]> {
  const page = window.figma?.currentPage
  if (!page) return []

  const result: NodeSnapshot[] = []

  type StackEntry = { node: BaseNode; visited: boolean }
  const stack: StackEntry[] = []

  // Start from page children to avoid serializing the PageNode itself.
  const pageChildren = (page as any).children as BaseNode[] | undefined
  if (Array.isArray(pageChildren)) {
    for (let i = pageChildren.length - 1; i >= 0; i -= 1) {
      stack.push({ node: pageChildren[i]!, visited: false })
    }
  }

  let steps = 0

  while (stack.length) {
    const current = stack.pop()!
    const node = current.node

    // If the container is invisible, skip its whole subtree (Figma visibility cascades).
    if ('visible' in (node as any) && (node as any).visible === false) {
      continue
    }

    if (!current.visited && 'children' in (node as any) && Array.isArray((node as any).children)) {
      stack.push({ node, visited: true })
      const children = (node as any).children as BaseNode[]
      for (let i = children.length - 1; i >= 0; i -= 1) {
        stack.push({ node: children[i]!, visited: false })
      }
      continue
    }

    if ('visible' in (node as any) && (node as any).visible === true) {
      result.push(serializeNode(node as SceneNode))
    }

    steps += 1
    if (steps % yieldEvery === 0) {
      await yieldToBrowser()
    }
  }

  return result
}

export async function streamCurrentPagePostorder({
  yieldEvery = 50,
  batchSize = 120,
  onBatch
}: {
  yieldEvery?: number
  batchSize?: number
  onBatch: (batch: NodeSnapshot[]) => Promise<void>
}): Promise<number> {
  const page = window.figma?.currentPage
  if (!page) return 0

  type StackEntry = { node: BaseNode; visited: boolean }
  const stack: StackEntry[] = []

  const pageChildren = (page as any).children as BaseNode[] | undefined
  if (Array.isArray(pageChildren)) {
    for (let i = pageChildren.length - 1; i >= 0; i -= 1) {
      stack.push({ node: pageChildren[i]!, visited: false })
    }
  }

  let steps = 0
  let total = 0
  let batch: NodeSnapshot[] = []

  async function flushBatch(): Promise<void> {
    if (!batch.length) return
    const currentBatch = batch
    batch = []
    total += currentBatch.length
    await onBatch(currentBatch)
  }

  while (stack.length) {
    const current = stack.pop()!
    const node = current.node

    if ('visible' in (node as any) && (node as any).visible === false) {
      continue
    }

    if (!current.visited && 'children' in (node as any) && Array.isArray((node as any).children)) {
      stack.push({ node, visited: true })
      const children = (node as any).children as BaseNode[]
      for (let i = children.length - 1; i >= 0; i -= 1) {
        stack.push({ node: children[i]!, visited: false })
      }
      continue
    }

    if ('visible' in (node as any) && (node as any).visible === true) {
      batch.push(serializeNode(node as SceneNode))
      if (batch.length >= batchSize) {
        await flushBatch()
      }
    }

    steps += 1
    if (steps % yieldEvery === 0) {
      await yieldToBrowser()
    }
  }

  await flushBatch()
  return total
}

export type EmbeddingIndexBatchProgress = {
  total: number
  done: number
  cacheHits: number
  updated: number
}

export type BuildEmbeddingIndexResult = {
  total: number
  processed: number
  cacheHits: number
  updated: number
}

export async function initEmbeddingIndexSession(
  docKey: string,
  options: EmbeddingIndexOptions,
  cached: CachedVectorEntry[]
): Promise<number> {
  const res = await getRequester()({
    type: 'init',
    docKey,
    options,
    cached
  })
  if (res.type !== 'init') {
    throw new Error('Unexpected embedding index init response.')
  }
  return res.cachedCount
}

export async function processEmbeddingIndexBatch(
  docKey: string,
  options: EmbeddingIndexOptions,
  nodes: NodeSnapshot[]
): Promise<EmbeddingIndexProcessResponse> {
  const res = await getRequester()({
    type: 'process',
    docKey,
    options,
    nodes
  })
  if (res.type !== 'process') {
    throw new Error('Unexpected embedding index process response.')
  }
  return res
}
