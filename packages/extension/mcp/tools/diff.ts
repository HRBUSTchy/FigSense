import type { DiffEntry, DiffLevel, DiffResult } from '@tempad-dev/shared'

import { resolveEmbeddingDocKey } from '@/embedding/indexer/client'
import { getEmbeddingMemory } from '@/embedding/indexer/memory'

import { buildNodeEmbedding, cosineSimilarity, getNonPositionStyles, toEmbeddableNode } from './design-common'

// --- Similarity → DiffLevel thresholds (tune later) ---
const SIM_THRESHOLD_IDENTICAL = 0.98
const SIM_THRESHOLD_STYLE = 0.85
const SIM_THRESHOLD_STRUCTURAL = 0.60

const DEFAULT_MAX_DEPTH = 2
const MAX_CHILDREN_PER_SIDE = 50

// --- helpers ---

function similarityToLevel(sim: number): DiffLevel {
  if (sim >= SIM_THRESHOLD_IDENTICAL) return 'identical'
  if (sim >= SIM_THRESHOLD_STYLE) return 'style'
  if (sim >= SIM_THRESHOLD_STRUCTURAL) return 'structural'
  return 'type_mismatch'
}

function getVisibleChildren(node: SceneNode): SceneNode[] {
  if (!('children' in node)) return []
  return (node.children as ReadonlyArray<BaseNode>).filter(
    (child): child is SceneNode => !!child && 'visible' in child && child.visible
  )
}

function getNodeVector(nodeId: string, memory: ReadonlyMap<string, { vec: number[] }> | null): number[] | null {
  return memory?.get(nodeId)?.vec ?? null
}

/**
 * Greedy bipartite matching: repeatedly pick the highest-similarity
 * pair that doesn't reuse a node from either side.
 */
function greedyMatch(
  childrenA: SceneNode[],
  childrenB: SceneNode[],
  vecA: Map<string, number[]>,
  vecB: Map<string, number[]>,
  minSimilarity: number
): Array<{ nodeA: SceneNode; nodeB: SceneNode; similarity: number }> {
  const pairs: Array<{ i: number; j: number; similarity: number }> = []

  for (let i = 0; i < childrenA.length; i++) {
    const vecAi = vecA.get(childrenA[i]!.id) ?? buildNodeEmbedding(childrenA[i]!)
    if (!vecAi.length) continue
    for (let j = 0; j < childrenB.length; j++) {
      const vecBj = vecB.get(childrenB[j]!.id) ?? buildNodeEmbedding(childrenB[j]!)
      if (!vecBj.length) continue
      const sim = cosineSimilarity(vecAi, vecBj)
      if (sim >= minSimilarity) {
        pairs.push({ i, j, similarity: sim })
      }
    }
  }

  pairs.sort((a, b) => b.similarity - a.similarity)

  const usedA = new Set<number>()
  const usedB = new Set<number>()
  const result: Array<{ nodeA: SceneNode; nodeB: SceneNode; similarity: number }> = []

  for (const { i, j, similarity } of pairs) {
    if (usedA.has(i) || usedB.has(j)) continue
    usedA.add(i)
    usedB.add(j)
    result.push({ nodeA: childrenA[i]!, nodeB: childrenB[j]!, similarity })
  }

  return result
}

/**
 * Detect content (text) difference between two nodes.
 */
function textChanged(nodeA: SceneNode, nodeB: SceneNode): boolean {
  const aText = nodeA.type === 'TEXT' && 'characters' in nodeA ? (nodeA as unknown as { characters: string }).characters : undefined
  const bText = nodeB.type === 'TEXT' && 'characters' in nodeB ? (nodeB as unknown as { characters: string }).characters : undefined
  if (aText !== undefined && bText !== undefined) return aText !== bText
  return false
}

// --- recursive diff ---

async function diffRecursive(
  nodeA: SceneNode,
  nodeB: SceneNode,
  vecA: number[] | null,
  vecB: number[] | null,
  memory: ReadonlyMap<string, { vec: number[] }> | null,
  depth: number,
  stats: { totalCompared: number; identicalCount: number; diffByLevel: Record<DiffLevel, number>; similaritySum: number; maxDiffDepth: number }
): Promise<DiffEntry> {
  // compute similarity
  const sim = vecA && vecB && vecA.length && vecB.length ? cosineSimilarity(vecA, vecB) : 0
  const level = sim > 0 ? similarityToLevel(sim) : 'type_mismatch'

  stats.totalCompared += 1
  if (level === 'identical') stats.identicalCount += 1
  stats.diffByLevel[level] = (stats.diffByLevel[level] ?? 0) + 1
  if (level !== 'identical') {
    stats.maxDiffDepth = Math.max(stats.maxDiffDepth, depth)
  }
  stats.similaritySum += sim

  const entry: DiffEntry = {
    idA: nodeA.id,
    idB: nodeB.id,
    nameA: nodeA.name ?? '',
    nameB: nodeB.name ?? '',
    typeA: nodeA.type,
    typeB: nodeB.type,
    similarity: sim,
    level
  }

  // early exit for identical
  if (level === 'identical') return entry

  // compute details for non-identical entries
  const [styleA, styleB] = await Promise.all([getNonPositionStyles(nodeA), getNonPositionStyles(nodeB)])

  const keysA = new Set(Object.keys(styleA))
  const keysB = new Set(Object.keys(styleB))
  const changedKeys = Array.from(keysA).filter((k) => keysB.has(k) && styleA[k] !== styleB[k])

  const isTextChanged = textChanged(nodeA, nodeB)
  const childCountA = getVisibleChildren(nodeA).length
  const childCountB = getVisibleChildren(nodeB).length

  entry.details = {
    styleDeltaCount: changedKeys.length,
    sizeDelta: {
      width: nodeB.width - nodeA.width,
      height: nodeB.height - nodeA.height
    },
    textChanged: isTextChanged,
    childCountDelta: childCountB - childCountA
  }

  // refine level based on details
  if (level === 'style') {
    if (isTextChanged) {
      entry.level = 'content'
    } else if (Math.abs(nodeB.width - nodeA.width) > 1 || Math.abs(nodeB.height - nodeA.height) > 1) {
      entry.level = 'size'
    }
  }

  // recurse into children if depth remains
  if (depth <= 0) {
    const childrenA = getVisibleChildren(nodeA).slice(0, MAX_CHILDREN_PER_SIDE)
    const childrenB = getVisibleChildren(nodeB).slice(0, MAX_CHILDREN_PER_SIDE)

    if (childrenA.length > 0 || childrenB.length > 0) {
      entry.truncated = {
        omittedA: Math.max(0, getVisibleChildren(nodeA).length - MAX_CHILDREN_PER_SIDE),
        omittedB: Math.max(0, getVisibleChildren(nodeB).length - MAX_CHILDREN_PER_SIDE),
        omittedIdsA: getVisibleChildren(nodeA).slice(MAX_CHILDREN_PER_SIDE).map((n) => n.id),
        omittedIdsB: getVisibleChildren(nodeB).slice(MAX_CHILDREN_PER_SIDE).map((n) => n.id)
      }
    }
    return entry
  }

  const childrenA = getVisibleChildren(nodeA).slice(0, MAX_CHILDREN_PER_SIDE)
  const childrenB = getVisibleChildren(nodeB).slice(0, MAX_CHILDREN_PER_SIDE)

  if (childrenA.length === 0 && childrenB.length === 0) return entry

  // build per-child vector maps
  const childVecA = new Map<string, number[]>()
  for (const child of childrenA) {
    const v = getNodeVector(child.id, memory) ?? buildNodeEmbedding(child)
    if (v.length) childVecA.set(child.id, v)
  }

  const childVecB = new Map<string, number[]>()
  for (const child of childrenB) {
    const v = getNodeVector(child.id, memory) ?? buildNodeEmbedding(child)
    if (v.length) childVecB.set(child.id, v)
  }

  // greedy match
  const matched = greedyMatch(childrenA, childrenB, childVecA, childVecB, SIM_THRESHOLD_STRUCTURAL)

  const matchedIdsA = new Set(matched.map((m) => m.nodeA.id))
  const matchedIdsB = new Set(matched.map((m) => m.nodeB.id))

  const children: DiffEntry[] = []

  // matched pairs — recurse
  for (const { nodeA: cA, nodeB: cB, similarity: _sim } of matched) {
    const cVecA = childVecA.get(cA.id) ?? null
    const cVecB = childVecB.get(cB.id) ?? null
    const childEntry = await diffRecursive(cA, cB, cVecA, cVecB, memory, depth - 1, stats)
    children.push(childEntry)
  }

  // unmatched A-side children (present in A, missing in B)
  for (const child of childrenA) {
    if (matchedIdsA.has(child.id)) continue
    const v = childVecA.get(child.id) ?? null
    const childSim = v?.length ? 0 : 0
    children.push({
      idA: child.id,
      idB: null,
      nameA: child.name ?? '',
      typeA: child.type,
      similarity: childSim,
      level: 'structural'
    })
    stats.totalCompared += 1
    stats.diffByLevel['structural'] = (stats.diffByLevel['structural'] ?? 0) + 1
    stats.maxDiffDepth = Math.max(stats.maxDiffDepth, depth)
  }

  // unmatched B-side children (present in B, missing in A)
  for (const child of childrenB) {
    if (matchedIdsB.has(child.id)) continue
    const v = childVecB.get(child.id) ?? null
    const childSim = v?.length ? 0 : 0
    children.push({
      idA: null,
      idB: child.id,
      nameB: child.name ?? '',
      typeB: child.type,
      similarity: childSim,
      level: 'structural'
    })
    stats.totalCompared += 1
    stats.diffByLevel['structural'] = (stats.diffByLevel['structural'] ?? 0) + 1
    stats.maxDiffDepth = Math.max(stats.maxDiffDepth, depth)
  }

  if (children.length > 0) {
    entry.children = children
  }

  // truncated info for overflow
  const overflowA = getVisibleChildren(nodeA).length - MAX_CHILDREN_PER_SIDE
  const overflowB = getVisibleChildren(nodeB).length - MAX_CHILDREN_PER_SIDE
  if (overflowA > 0 || overflowB > 0) {
    entry.truncated = {
      omittedA: Math.max(0, overflowA),
      omittedB: Math.max(0, overflowB),
      omittedIdsA: getVisibleChildren(nodeA).slice(MAX_CHILDREN_PER_SIDE).map((n) => n.id),
      omittedIdsB: getVisibleChildren(nodeB).slice(MAX_CHILDREN_PER_SIDE).map((n) => n.id)
    }
  }

  return entry
}

// --- public API ---

export async function handleDiff(nodeA: SceneNode, nodeB: SceneNode, maxDepth?: number): Promise<DiffResult> {
  const depth = typeof maxDepth === 'number' && maxDepth > 0 ? maxDepth : DEFAULT_MAX_DEPTH

  // resolve vector memory
  const docScope = resolveEmbeddingDocKey()
  const memory = docScope ? getEmbeddingMemory(docScope.docKey) : null

  // root vectors
  const vecA = getNodeVector(nodeA.id, memory) ?? buildNodeEmbedding(nodeA)
  const vecB = getNodeVector(nodeB.id, memory) ?? buildNodeEmbedding(nodeB)

  // root similarity
  const rootSim = vecA.length && vecB.length ? cosineSimilarity(vecA, vecB) : 0

  const stats = {
    totalCompared: 0,
    identicalCount: 0,
    diffByLevel: {} as Record<DiffLevel, number>,
    similaritySum: 0,
    maxDiffDepth: 0
  }

  const diffTree = await diffRecursive(nodeA, nodeB, vecA, vecB, memory, depth, stats)

  return {
    idA: nodeA.id,
    idB: nodeB.id,
    similarity: rootSim,
    rootLevel: diffTree.level,
    diffTree,
    summary: {
      totalCompared: stats.totalCompared,
      identicalCount: stats.identicalCount,
      diffByLevel: stats.diffByLevel,
      maxDiffDepth: stats.maxDiffDepth,
      avgSimilarity: stats.totalCompared > 0 ? stats.similaritySum / stats.totalCompared : 0
    }
  }
}
