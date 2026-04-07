import {
  createNodeEmbedding,
  createTreeEmbedding,
  createMergedTreeEmbedding,
  cosineSimilarity,
  euclideanDistance,
  findMostSimilarNodes,
  getEmbeddingDimension,
  createPageEmbeddings,
  selectNodeById,
  getSelectedNode,
  findMostSimilar,
  type EmbeddingVector,
  type EmbeddingOptions
} from './node-embedder'
import { createStructureEmbedding, type ComponentStructure } from './structure-embedding'

type SerializeSelectedNodeOptions = {
  maxDepth?: number
  includeInvisible?: boolean
  print?: boolean
}

type SerializedEmbeddingNode = {
  id: string
  name: string
  type: string
  visible: boolean
  x: number
  y: number
  width: number
  height: number
  layoutMode?: string
  primaryAxisAlignItems?: string
  itemSpacing?: number
  fills?: Array<Record<string, unknown>> | null
  strokes?: Array<Record<string, unknown>> | null
  strokeWeight?: number
  cornerRadius?: number
  topLeftRadius?: number
  topRightRadius?: number
  bottomLeftRadius?: number
  bottomRightRadius?: number
  opacity?: number
  locked?: boolean
  rotation?: number
  blendMode?: string
  effects?: Array<Record<string, unknown>> | null
  characters?: string
  children?: SerializedEmbeddingNode[]
  truncatedChildren?: number
}

function resolveFigmaFileKey(pathname: string): string | null {
  const match = pathname.match(/\/(file|design)\/([^/]+)/)
  return match?.[2] ?? null
}

function serializePaint(paint: unknown): Record<string, unknown> | null {
  if (!paint || typeof paint !== 'object') return null
  const source = paint as Record<string, unknown>
  const result: Record<string, unknown> = {
    type: typeof source.type === 'string' ? source.type : 'UNKNOWN'
  }
  if (typeof source.visible === 'boolean') result.visible = source.visible
  if (typeof source.opacity === 'number') result.opacity = source.opacity

  const color = source.color
  if (color && typeof color === 'object') {
    const colorObject = color as Record<string, unknown>
    result.color = {
      r: typeof colorObject.r === 'number' ? colorObject.r : 0,
      g: typeof colorObject.g === 'number' ? colorObject.g : 0,
      b: typeof colorObject.b === 'number' ? colorObject.b : 0
    }
  }
  return result
}

function serializePaintList(value: unknown): Array<Record<string, unknown>> | null {
  if (!Array.isArray(value)) return null
  const list = value.map(serializePaint).filter(Boolean) as Array<Record<string, unknown>>
  return list.length ? list : null
}

function serializeEffects(value: unknown): Array<Record<string, unknown>> | null {
  if (!Array.isArray(value)) return null
  const list = value
    .map((effect) => {
      if (!effect || typeof effect !== 'object') return null
      const source = effect as Record<string, unknown>
      if (typeof source.type !== 'string') return null
      return {
        type: source.type,
        ...(typeof source.visible === 'boolean' ? { visible: source.visible } : {})
      }
    })
    .filter(Boolean) as Array<Record<string, unknown>>
  return list.length ? list : null
}

function serializeNodeForEmbedding(
  node: SceneNode,
  options: Required<SerializeSelectedNodeOptions>,
  depth = 0
): SerializedEmbeddingNode {
  const nodeData = node as unknown as Record<string, unknown>
  const base: SerializedEmbeddingNode = {
    id: node.id,
    name: node.name ?? '',
    type: node.type,
    visible: !!node.visible,
    x: typeof node.x === 'number' ? node.x : 0,
    y: typeof node.y === 'number' ? node.y : 0,
    width: typeof node.width === 'number' ? node.width : 0,
    height: typeof node.height === 'number' ? node.height : 0
  }

  if ('layoutMode' in node && typeof nodeData.layoutMode === 'string') {
    base.layoutMode = nodeData.layoutMode
  }
  if (
    'primaryAxisAlignItems' in node &&
    typeof nodeData.primaryAxisAlignItems === 'string'
  ) {
    base.primaryAxisAlignItems = nodeData.primaryAxisAlignItems
  }
  if ('itemSpacing' in node && typeof nodeData.itemSpacing === 'number') {
    base.itemSpacing = nodeData.itemSpacing
  }

  if ('fills' in node) {
    base.fills = serializePaintList(nodeData.fills)
  }
  if ('strokes' in node) {
    base.strokes = serializePaintList(nodeData.strokes)
  }
  if ('strokeWeight' in node && typeof nodeData.strokeWeight === 'number') {
    base.strokeWeight = nodeData.strokeWeight
  }

  if ('cornerRadius' in node && typeof nodeData.cornerRadius === 'number') {
    base.cornerRadius = nodeData.cornerRadius
  } else if ('topLeftRadius' in node) {
    const source = nodeData
    if (typeof source.topLeftRadius === 'number') base.topLeftRadius = source.topLeftRadius
    if (typeof source.topRightRadius === 'number') base.topRightRadius = source.topRightRadius
    if (typeof source.bottomLeftRadius === 'number') base.bottomLeftRadius = source.bottomLeftRadius
    if (typeof source.bottomRightRadius === 'number') base.bottomRightRadius = source.bottomRightRadius
  }

  if ('opacity' in node && typeof nodeData.opacity === 'number') {
    base.opacity = nodeData.opacity
  }
  if ('locked' in node && typeof nodeData.locked === 'boolean') {
    base.locked = nodeData.locked
  }
  if ('rotation' in node && typeof nodeData.rotation === 'number') {
    base.rotation = nodeData.rotation
  }
  if ('blendMode' in node && typeof nodeData.blendMode === 'string') {
    base.blendMode = nodeData.blendMode
  }
  if ('effects' in node) {
    base.effects = serializeEffects(nodeData.effects)
  }
  if (
    node.type === 'TEXT' &&
    'characters' in node &&
    typeof nodeData.characters === 'string'
  ) {
    base.characters = nodeData.characters
  }

  if (!('children' in node) || !Array.isArray(node.children)) {
    return base
  }

  const visibleChildren = node.children.filter(
    (child): child is SceneNode => !!child && 'visible' in child && child.visible
  )
  const children = options.includeInvisible
    ? node.children.filter((child): child is SceneNode => !!child && 'visible' in child)
    : visibleChildren

  if (depth >= options.maxDepth) {
    if (children.length > 0) {
      base.truncatedChildren = children.length
    }
    return base
  }

  if (children.length > 0) {
    base.children = children.map((child) => serializeNodeForEmbedding(child, options, depth + 1))
  }
  return base
}

function serializeSelectedNode(options: SerializeSelectedNodeOptions = {}): string | null {
  const selected = getSelectedNode()
  if (!selected) {
    console.warn('[embedding] serializeSelectedNode: no selected node')
    return null
  }

  const resolvedOptions: Required<SerializeSelectedNodeOptions> = {
    maxDepth: Math.max(0, Math.floor(options.maxDepth ?? 8)),
    includeInvisible: options.includeInvisible ?? false,
    print: options.print ?? true
  }

  const pathname = typeof location?.pathname === 'string' ? location.pathname : ''
  const payload = {
    schema: 'embedding-node-snapshot/v1',
    generatedAt: new Date().toISOString(),
    fileKey: resolveFigmaFileKey(pathname),
    pageId: window.figma?.currentPage?.id ?? null,
    pageName: window.figma?.currentPage?.name ?? null,
    selectedNodeId: selected.id,
    selectedNodeName: selected.name ?? '',
    options: resolvedOptions,
    node: serializeNodeForEmbedding(selected, resolvedOptions)
  }

  const json = JSON.stringify(payload, null, 2)
  if (resolvedOptions.print) {
    console.log('[embedding] serializeSelectedNode', payload)
    console.log('[embedding] serializeSelectedNode:json', json)
  }
  return json
}

export const InjectToWindow = ()=>{
  window.embedding = {
    createNodeEmbedding,
    createTreeEmbedding,
    createMergedTreeEmbedding,
    cosineSimilarity,
    euclideanDistance,
    findMostSimilarNodes,
    getEmbeddingDimension,
    createPageEmbeddings,
    selectNodeById,
    getSelectedNode,
    findMostSimilar,
    serializeSelectedNode,
    getEmbedding: () => {
      return console.log(figma.currentPage)
    }
  }
}

export type { EmbeddingVector, EmbeddingOptions }
export type { ComponentStructure }
export { createStructureEmbedding }
