import type { ListResult } from '@tempad-dev/shared'

import { resolveEmbeddingDocKey } from '@/embedding/indexer/client'
import { getEmbeddingMemory } from '@/embedding/indexer/memory'
import { logger } from '@/utils/log'

import { cosineSimilarity } from './design-common'

const VECTOR_CLUSTER_THRESHOLD = 0.9
const VECTOR_REFINEMENT_THRESHOLD = 0.997
const VECTOR_REFINEMENT_MIN_CLUSTER_SIZE = 4
const VECTOR_REFINEMENT_TRIGGER_MIN_SIMILARITY = 0.985
const MAX_PAIRWISE_VECTOR_CLUSTER_NODES = 320
const MAX_ALWAYS_REFINEMENT_CLUSTER_SIZE = 320
const MAX_LIST_NODES = 1200
const MAX_CLUSTER_COUNT = 120
const MAX_MEMBER_IDS = 120
const MAX_REP_CHILDREN = 24
const MAX_VERBOSE_ASSIGNMENT_LOGS = 80
const LIST_VERBOSE_DEBUG_FLAG = '__TEMPAD_LIST_VERBOSE__'
const MAX_VECTOR_DUMP_NODES = 800

const ADAPTIVE_MIN_CLUSTER_THRESHOLD = 0.75
const ADAPTIVE_MAX_CLUSTER_THRESHOLD = 0.98
const ADAPTIVE_REFINEMENT_GAP = 0.06
const ADAPTIVE_COMPLETE_LINKAGE_MAX_NODES = 200

type Cluster = {
  clusterId: string
  representative: SceneNode
  representativeVec?: number[]
  memberNodeIds: string[]
  similaritySum: number
  similarityCount: number
  similarityMin: number | null
  similarityMax: number | null
}

type ListDebugStats = {
  vectorCandidates: number
  fallbackCandidates: number
  vectorMerged: number
  vectorCreated: number
  fallbackMerged: number
  fallbackCreated: number
  clusterCapSkips: number
  memberCapDrops: number
  refinementAttempts: number
  refinementSplits: number
  refinementCreatedClusters: number
  refinementMergedSmallMembers: number
  verboseLogs: number
  vectorDumpDrops: number
}

function getVisibleDirectChildren(node: SceneNode): SceneNode[] {
  if (!('children' in node)) return []
  return node.children.filter(
    (child): child is SceneNode => !!child && 'visible' in child && child.visible
  )
}

function getVisibleDirectChildrenFromContainer(
  container: { children: ReadonlyArray<BaseNode> } | null | undefined
): SceneNode[] {
  if (!container?.children?.length) return []
  return container.children.filter(
    (child): child is SceneNode => !!child && 'visible' in child && child.visible
  )
}

function fallbackClusterKey(node: SceneNode): string {
  return `missing-vector:${node.id}`
}

/**
 * Compute adaptive clustering and refinement thresholds from the pairwise
 * similarity distribution.  When the sorted similarities show a clear gap
 * between a "similar" band and a "dissimilar" band, the midpoint of that gap
 * becomes the cluster threshold.  Falls back to the legacy defaults when the
 * signal is too weak (too few pairs, no obvious gap).
 */
function computeAdaptiveThresholds(
  nodeIds: string[],
  vectorByNodeId: Map<string, number[]>
): { clusterThreshold: number; refinementThreshold: number; isAdaptive: boolean } {
  const vectors = nodeIds
    .map((id) => vectorByNodeId.get(id))
    .filter((v): v is number[] => !!v?.length)

  if (vectors.length < 4) {
    return {
      clusterThreshold: VECTOR_CLUSTER_THRESHOLD,
      refinementThreshold: VECTOR_REFINEMENT_THRESHOLD,
      isAdaptive: false
    }
  }

  // Full pairwise similarity (n < 100 → at most ~5 000 pairs)
  const pairs: number[] = []
  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      pairs.push(cosineSimilarity(vectors[i]!, vectors[j]!))
    }
  }

  if (pairs.length === 0) {
    return {
      clusterThreshold: VECTOR_CLUSTER_THRESHOLD,
      refinementThreshold: VECTOR_REFINEMENT_THRESHOLD,
      isAdaptive: false
    }
  }

  // Sort descending
  pairs.sort((a, b) => b - a)

  // Strategy: Find threshold based on cluster count stability
  // Scan from high to low, find where cluster count stabilizes
  const testThresholds = [0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.90]
  let bestThreshold = VECTOR_CLUSTER_THRESHOLD
  let prevClusterCount = -1

  for (const threshold of testThresholds) {
    const clusterCount = countClustersAtThreshold(vectors, threshold)
    if (clusterCount > 1 && clusterCount === prevClusterCount) {
      bestThreshold = threshold
      break
    }
    if (clusterCount > 1 && prevClusterCount === -1) {
      bestThreshold = threshold
    }
    prevClusterCount = clusterCount
  }

  const clusterThreshold = Math.max(
    ADAPTIVE_MIN_CLUSTER_THRESHOLD,
    Math.min(ADAPTIVE_MAX_CLUSTER_THRESHOLD, bestThreshold)
  )
  const refinementThreshold = Math.min(0.999, clusterThreshold + ADAPTIVE_REFINEMENT_GAP)
  const isAdaptive = true

  return {
    clusterThreshold: roundMetric(clusterThreshold),
    refinementThreshold: roundMetric(refinementThreshold),
    isAdaptive
  }
}

function countClustersAtThreshold(vectors: number[][], threshold: number): number {
  const visited = new Set<number>()
  let clusterCount = 0

  for (let i = 0; i < vectors.length; i++) {
    if (visited.has(i)) continue

    clusterCount++
    const queue = [i]
    visited.add(i)

    while (queue.length > 0) {
      const current = queue.shift()!
      for (let j = 0; j < vectors.length; j++) {
        if (visited.has(j)) continue
        const sim = cosineSimilarity(vectors[current]!, vectors[j]!)
        if (sim >= threshold) {
          visited.add(j)
          queue.push(j)
        }
      }
    }
  }

  return clusterCount
}

function clusterVectorNodeIdsGreedy(
  nodeIds: string[],
  vectorByNodeId: Map<string, number[]>,
  threshold: number
): string[][] {
  const representativeVectors: number[][] = []
  const clusters: string[][] = []

  for (const nodeId of nodeIds) {
    const vector = vectorByNodeId.get(nodeId)
    if (!vector?.length) continue

    let bestIndex = -1
    let bestScore = -1
    for (let index = 0; index < representativeVectors.length; index += 1) {
      const score = cosineSimilarity(vector, representativeVectors[index]!)
      if (score > bestScore) {
        bestScore = score
        bestIndex = index
      }
    }

    if (bestIndex >= 0 && bestScore >= threshold) {
      clusters[bestIndex]!.push(nodeId)
      continue
    }

    representativeVectors.push(vector)
    clusters.push([nodeId])
  }

  return clusters
}

function clusterVectorNodeIdsByConnectedComponents(
  nodeIds: string[],
  vectorByNodeId: Map<string, number[]>,
  threshold: number
): string[][] {
  const visited = new Set<string>()
  const clusters: string[][] = []

  for (const seedNodeId of nodeIds) {
    if (visited.has(seedNodeId)) continue
    const seedVector = vectorByNodeId.get(seedNodeId)
    if (!seedVector?.length) continue

    visited.add(seedNodeId)
    const queue = [seedNodeId]
    const cluster: string[] = []

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!
      const currentVector = vectorByNodeId.get(currentNodeId)
      if (!currentVector?.length) continue
      cluster.push(currentNodeId)

      for (const candidateNodeId of nodeIds) {
        if (visited.has(candidateNodeId)) continue
        const candidateVector = vectorByNodeId.get(candidateNodeId)
        if (!candidateVector?.length) continue
        const similarity = cosineSimilarity(currentVector, candidateVector)
        if (similarity >= threshold) {
          visited.add(candidateNodeId)
          queue.push(candidateNodeId)
        }
      }
    }

    if (cluster.length > 0) {
      clusters.push(cluster)
    }
  }

  return clusters
}

/**
 * Complete-linkage hierarchical agglomerative clustering.
 *
 * Unlike BFS connected components (single-linkage), this only merges two
 * clusters when *every* cross-pair exceeds the threshold.  This prevents
 * the "chaining" problem where transitive connections inflate clusters.
 *
 * Time complexity O(n² · m) where m is the number of merges, which is
 * acceptable for n < ~200.
 */
function clusterByCompleteLinkage(
  nodeIds: string[],
  vectorByNodeId: Map<string, number[]>,
  threshold: number
): string[][] {
  const activeIds = nodeIds.filter((id) => !!vectorByNodeId.get(id)?.length)
  const n = activeIds.length
  if (n <= 1) return n ? [activeIds] : []

  const vectors = activeIds.map((id) => vectorByNodeId.get(id)!)

  // Full similarity matrix
  const sim: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    sim[i]![i] = 1
    for (let j = i + 1; j < n; j++) {
      const s = cosineSimilarity(vectors[i]!, vectors[j]!)
      sim[i]![j] = s
      sim[j]![i] = s
    }
  }

  // All pairs sorted descending by similarity
  const allPairs: [number, number, number][] = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      allPairs.push([i, j, sim[i]![j]!])
    }
  }
  allPairs.sort((a, b) => b[2] - a[2])

  // Union-Find with path compression & union by rank
  const parent = Array.from({ length: n }, (_, i) => i)
  const rnk = new Array(n).fill(0)
  function find(x: number): number {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]!]!
      x = parent[x]!
    }
    return x
  }
  function union(x: number, y: number): void {
    const rx = find(x),
      ry = find(y)
    if (rx === ry) return
    if (rnk[rx]! < rnk[ry]!) parent[rx] = ry
    else if (rnk[rx]! > rnk[ry]!) parent[ry] = rx
    else {
      parent[ry] = rx
      rnk[rx] = (rnk[rx] ?? 0) + 1
    }
  }

  // Process pairs in descending order; merge when complete linkage ≥ threshold
  for (const [i, j, pairSim] of allPairs) {
    if (pairSim < threshold) break // all remaining pairs below threshold
    const ri = find(i),
      rj = find(j)
    if (ri === rj) continue

    // Complete linkage = min similarity over ALL cross-cluster pairs
    let cl = Infinity
    for (let a = 0; a < n; a++) {
      if (find(a) !== ri) continue
      for (let b = 0; b < n; b++) {
        if (find(b) !== rj) continue
        const s = sim[a]![b]!
        if (s < cl) {
          cl = s
          if (cl < threshold) break // early exit
        }
      }
      if (cl < threshold) break
    }

    if (cl >= threshold) union(i, j)
  }

  // Collect clusters
  const clusterMap = new Map<number, string[]>()
  for (let i = 0; i < n; i++) {
    const root = find(i)
    if (!clusterMap.has(root)) clusterMap.set(root, [])
    clusterMap.get(root)!.push(activeIds[i]!)
  }
  return Array.from(clusterMap.values())
}

type ClusterResult = {
  groups: string[][]
  clusterThreshold: number
  refinementThreshold: number
  isAdaptive: boolean
}

function clusterVectorNodeIds(
  nodeIds: string[],
  vectorByNodeId: Map<string, number[]>
): ClusterResult {
  const adaptive = computeAdaptiveThresholds(nodeIds, vectorByNodeId)
  const threshold = adaptive.clusterThreshold

  let groups: string[][]
  if (adaptive.isAdaptive && nodeIds.length <= ADAPTIVE_COMPLETE_LINKAGE_MAX_NODES) {
    groups = clusterByCompleteLinkage(nodeIds, vectorByNodeId, threshold)
  } else if (nodeIds.length <= MAX_PAIRWISE_VECTOR_CLUSTER_NODES) {
    groups = clusterVectorNodeIdsByConnectedComponents(nodeIds, vectorByNodeId, threshold)
  } else {
    groups = clusterVectorNodeIdsGreedy(nodeIds, vectorByNodeId, threshold)
  }

  return { groups, ...adaptive }
}

function isVerboseListDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean((window as unknown as Record<string, unknown>)[LIST_VERBOSE_DEBUG_FLAG])
}

function logAssignment(
  verbose: boolean,
  stats: ListDebugStats,
  message: string,
  payload?: Record<string, unknown>
): void {
  if (!verbose || stats.verboseLogs >= MAX_VERBOSE_ASSIGNMENT_LOGS) return
  stats.verboseLogs += 1
  logger.log(`[mcp:list][assign] ${message}`, payload ?? {})
}

function roundMetric(value: number): number {
  return Math.round(value * 10000) / 10000
}

function recordSimilarity(cluster: Cluster, score: number): void {
  cluster.similaritySum += score
  cluster.similarityCount += 1
  cluster.similarityMin =
    cluster.similarityMin == null ? score : Math.min(cluster.similarityMin, score)
  cluster.similarityMax =
    cluster.similarityMax == null ? score : Math.max(cluster.similarityMax, score)
}

function splitMembersByStrictVectorThreshold(
  memberNodeIds: string[],
  vectorByNodeId: Map<string, number[]>,
  threshold: number
): string[][] {
  const nodes = memberNodeIds.filter((nodeId) => !!vectorByNodeId.get(nodeId)?.length)
  if (nodes.length <= 1) return nodes.length ? [nodes] : []

  const visited = new Set<string>()
  const components: string[][] = []

  for (const seedNodeId of nodes) {
    if (visited.has(seedNodeId)) continue

    visited.add(seedNodeId)
    const queue = [seedNodeId]
    const component: string[] = []

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!
      component.push(currentNodeId)
      const currentVector = vectorByNodeId.get(currentNodeId)
      if (!currentVector?.length) continue

      for (const candidateNodeId of nodes) {
        if (visited.has(candidateNodeId)) continue
        const candidateVector = vectorByNodeId.get(candidateNodeId)
        if (!candidateVector?.length) continue

        const similarity = cosineSimilarity(currentVector, candidateVector)
        if (similarity >= threshold) {
          visited.add(candidateNodeId)
          queue.push(candidateNodeId)
        }
      }
    }

    components.push(component)
  }

  return components
}

function rebuildVectorCluster(
  clusterId: string,
  memberNodeIds: string[],
  nodeById: Map<string, SceneNode>,
  vectorByNodeId: Map<string, number[]>
): Cluster | null {
  const representativeNodeId = memberNodeIds[0]
  if (!representativeNodeId) return null
  const representative = nodeById.get(representativeNodeId)
  const representativeVec = vectorByNodeId.get(representativeNodeId)
  if (!representative || !representativeVec?.length) return null

  const cluster: Cluster = {
    clusterId,
    representative,
    representativeVec,
    memberNodeIds: [],
    similaritySum: 0,
    similarityCount: 0,
    similarityMin: null,
    similarityMax: null
  }

  for (const memberNodeId of memberNodeIds) {
    cluster.memberNodeIds.push(memberNodeId)
    const vector = vectorByNodeId.get(memberNodeId)
    if (!vector?.length) continue
    recordSimilarity(cluster, cosineSimilarity(vector, representativeVec))
  }

  return cluster
}

export async function handleList(scopeNode?: SceneNode): Promise<ListResult> {
  const page = window.figma?.currentPage
  if (!page) {
    throw new Error('Figma page is not ready yet.')
  }

  const nodes = (scopeNode
    ? getVisibleDirectChildren(scopeNode)
    : getVisibleDirectChildrenFromContainer(page))
    .slice(0, MAX_LIST_NODES)
  const nodeById = new Map(nodes.map((node) => [node.id, node]))

  const docScope = resolveEmbeddingDocKey()
  const memory = docScope ? getEmbeddingMemory(docScope.docKey) : null
  const vectorByNodeId = new Map<string, number[]>()
  const verbose = isVerboseListDebugEnabled()
  const stats: ListDebugStats = {
    vectorCandidates: 0,
    fallbackCandidates: 0,
    vectorMerged: 0,
    vectorCreated: 0,
    fallbackMerged: 0,
    fallbackCreated: 0,
    clusterCapSkips: 0,
    memberCapDrops: 0,
    refinementAttempts: 0,
    refinementSplits: 0,
    refinementCreatedClusters: 0,
    refinementMergedSmallMembers: 0,
    verboseLogs: 0,
    vectorDumpDrops: 0
  }
  const vectorDump: Record<string, number[]> = {}
  let vectorDumpCount = 0

  logger.log('[mcp:list] start', {
    scopeNodeId: scopeNode?.id ?? page.id,
    directChildrenCount: nodes.length,
    memoryReady: !!memory,
    docKey: docScope?.docKey ?? null
  })

  const clusters: Cluster[] = []
  const fallbackClusterMap = new Map<string, Cluster>()
  const vectorNodeIds: string[] = []

  for (const node of nodes) {
    const nodeVec = memory?.get(node.id)?.vec
    if (nodeVec?.length) {
      stats.vectorCandidates += 1
      vectorByNodeId.set(node.id, nodeVec)
      vectorNodeIds.push(node.id)
      if (!vectorDump[node.id]) {
        if (vectorDumpCount < MAX_VECTOR_DUMP_NODES) {
          vectorDump[node.id] = nodeVec
          vectorDumpCount += 1
        } else {
          stats.vectorDumpDrops += 1
        }
      }
      continue
    }

    stats.fallbackCandidates += 1
    const key = fallbackClusterKey(node)
    let fallbackCluster = fallbackClusterMap.get(key) ?? null
    if (!fallbackCluster) {
      if (clusters.length >= MAX_CLUSTER_COUNT) {
        stats.clusterCapSkips += 1
        logAssignment(verbose, stats, 'skip fallback cluster because cluster cap reached', {
          nodeId: node.id,
          maxClusterCount: MAX_CLUSTER_COUNT
        })
        continue
      }
      fallbackCluster = {
        clusterId: `cluster-${clusters.length + 1}`,
        representative: node,
        memberNodeIds: [],
        similaritySum: 0,
        similarityCount: 0,
        similarityMin: null,
        similarityMax: null
      }
      fallbackClusterMap.set(key, fallbackCluster)
      clusters.push(fallbackCluster)
      stats.fallbackCreated += 1
      logAssignment(verbose, stats, 'create cluster by fallback key', {
        nodeId: node.id,
        clusterId: fallbackCluster.clusterId,
        key,
        nodeName: node.name,
        nodeType: node.type
      })
    } else {
      stats.fallbackMerged += 1
      logAssignment(verbose, stats, 'merge by fallback key', {
        nodeId: node.id,
        clusterId: fallbackCluster.clusterId,
        key,
        nodeName: node.name,
        nodeType: node.type
      })
    }

    if (fallbackCluster.memberNodeIds.length < MAX_MEMBER_IDS) {
      fallbackCluster.memberNodeIds.push(node.id)
    } else {
      stats.memberCapDrops += 1
      logAssignment(verbose, stats, 'skip fallback member append because member cap reached', {
        nodeId: node.id,
        clusterId: fallbackCluster.clusterId,
        maxMemberIds: MAX_MEMBER_IDS
      })
    }
  }

  const { groups: vectorMemberGroups, clusterThreshold, refinementThreshold, isAdaptive } =
    clusterVectorNodeIds(vectorNodeIds, vectorByNodeId)
  for (const memberNodeIds of vectorMemberGroups) {
    if (clusters.length >= MAX_CLUSTER_COUNT) {
      stats.clusterCapSkips += memberNodeIds.length
      logAssignment(verbose, stats, 'skip vector cluster because cluster cap reached', {
        representativeNodeId: memberNodeIds[0] ?? null,
        skippedMembers: memberNodeIds.length,
        maxClusterCount: MAX_CLUSTER_COUNT
      })
      continue
    }

    const cappedMemberNodeIds =
      memberNodeIds.length > MAX_MEMBER_IDS
        ? memberNodeIds.slice(0, MAX_MEMBER_IDS)
        : memberNodeIds
    if (cappedMemberNodeIds.length < memberNodeIds.length) {
      stats.memberCapDrops += memberNodeIds.length - cappedMemberNodeIds.length
    }

    const rebuilt = rebuildVectorCluster(
      `cluster-${clusters.length + 1}`,
      cappedMemberNodeIds,
      nodeById,
      vectorByNodeId
    )
    if (!rebuilt || rebuilt.memberNodeIds.length === 0) continue

    clusters.push(rebuilt)
    stats.vectorCreated += 1
    stats.vectorMerged += Math.max(0, rebuilt.memberNodeIds.length - 1)
    logAssignment(verbose, stats, 'create cluster by vector component', {
      clusterId: rebuilt.clusterId,
      representativeNodeId: rebuilt.representative.id,
      size: rebuilt.memberNodeIds.length
    })
  }

  const clustersAfterRefinement: Cluster[] = []
  for (const cluster of clusters) {
    const shouldRefineBySize =
      cluster.memberNodeIds.length <= MAX_ALWAYS_REFINEMENT_CLUSTER_SIZE
    const refinementTriggerMinSimilarity = Math.min(
      VECTOR_REFINEMENT_TRIGGER_MIN_SIMILARITY,
      clusterThreshold + 0.08
    )
    const shouldTryRefine =
      !!cluster.representativeVec &&
      cluster.memberNodeIds.length >= VECTOR_REFINEMENT_MIN_CLUSTER_SIZE &&
      (shouldRefineBySize ||
        (cluster.similarityMin != null &&
          cluster.similarityMin < refinementTriggerMinSimilarity))

    if (!shouldTryRefine) {
      clustersAfterRefinement.push(cluster)
      continue
    }

    stats.refinementAttempts += 1

    const useCompleteLinkage =
      isAdaptive && cluster.memberNodeIds.length <= ADAPTIVE_COMPLETE_LINKAGE_MAX_NODES
    const splitMembers = useCompleteLinkage
      ? clusterByCompleteLinkage(cluster.memberNodeIds, vectorByNodeId, refinementThreshold)
      : splitMembersByStrictVectorThreshold(
          cluster.memberNodeIds,
          vectorByNodeId,
          refinementThreshold
        )
    if (splitMembers.length <= 1) {
      clustersAfterRefinement.push(cluster)
      continue
    }

    stats.refinementSplits += 1
    stats.refinementCreatedClusters += splitMembers.length
    logAssignment(verbose, stats, 'split by refinement threshold', {
      clusterId: cluster.clusterId,
      originalSize: cluster.memberNodeIds.length,
      splitCount: splitMembers.length,
      splitSizes: splitMembers.map((memberIds) => memberIds.length),
      refinementThreshold
    })

    let rebuiltCount = 0
    for (let index = 0; index < splitMembers.length; index += 1) {
      const rebuilt = rebuildVectorCluster(
        `${cluster.clusterId}-r${index + 1}`,
        splitMembers[index]!,
        nodeById,
        vectorByNodeId
      )
      if (!rebuilt || rebuilt.memberNodeIds.length === 0) continue
      clustersAfterRefinement.push(rebuilt)
      rebuiltCount += 1
    }

    if (rebuiltCount === 0) {
      clustersAfterRefinement.push(cluster)
    }
  }

  const serializedClusters = clustersAfterRefinement
    .filter((cluster) => cluster.memberNodeIds.length > 0)
    .sort((a, b) => b.memberNodeIds.length - a.memberNodeIds.length)
    .map((cluster) => {
      const rep = cluster.representative
      const topLevelChildren = getVisibleDirectChildren(rep)
        .slice(0, MAX_REP_CHILDREN)
        .map((child) => ({
          id: child.id,
          name: child.name ?? '',
          type: child.type
        }))

      return {
        clusterId: cluster.clusterId,
        size: cluster.memberNodeIds.length,
        similarity: {
          vectorMemberCount: cluster.similarityCount,
          ...(cluster.similarityCount > 0
            ? {
                avg: roundMetric(cluster.similaritySum / cluster.similarityCount),
                min: roundMetric(cluster.similarityMin ?? 0),
                max: roundMetric(cluster.similarityMax ?? 0)
              }
            : {})
        },
        representativeNodeId: rep.id,
        representative: {
          id: rep.id,
          name: rep.name ?? '',
          type: rep.type,
          width: rep.width,
          height: rep.height,
          ...(topLevelChildren.length ? { topLevelChildren } : {})
        },
        memberNodeIds: cluster.memberNodeIds
      }
    })

  const topClusters = serializedClusters.slice(0, 8).map((cluster) => ({
    clusterId: cluster.clusterId,
    size: cluster.size,
    similarityVectorMemberCount: cluster.similarity?.vectorMemberCount ?? 0,
    similarityAvg: cluster.similarity?.avg ?? null,
    similarityMin: cluster.similarity?.min ?? null,
    similarityMax: cluster.similarity?.max ?? null,
    representativeNodeId: cluster.representativeNodeId,
    representativeType: cluster.representative.type,
    representativeName: cluster.representative.name
  }))

  logger.log('[mcp:list] done', {
    scopeNodeId: scopeNode?.id ?? page.id,
    directChildrenCount: nodes.length,
    clusterCount: serializedClusters.length,
    stats,
    topClusters,
    adaptiveThreshold: {
      cluster: clusterThreshold,
      refinement: refinementThreshold
    }
  })
  logger.log(
    '[mcp:list] vectorDump:json',
    JSON.stringify({
      scopeNodeId: scopeNode?.id ?? page.id,
      vectorNodeCount: stats.vectorCandidates,
      dumpedNodeCount: vectorDumpCount,
      droppedNodeCount: stats.vectorDumpDrops,
      vectors: vectorDump
    })
  )

  return {
    scopeNodeId: scopeNode?.id ?? page.id,
    totalNodes: nodes.length,
    clusters: serializedClusters
  }
}
