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

function clusterVectorNodeIdsGreedy(
  nodeIds: string[],
  vectorByNodeId: Map<string, number[]>
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

    if (bestIndex >= 0 && bestScore >= VECTOR_CLUSTER_THRESHOLD) {
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
  vectorByNodeId: Map<string, number[]>
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
        if (similarity >= VECTOR_CLUSTER_THRESHOLD) {
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

function clusterVectorNodeIds(
  nodeIds: string[],
  vectorByNodeId: Map<string, number[]>
): string[][] {
  if (nodeIds.length <= MAX_PAIRWISE_VECTOR_CLUSTER_NODES) {
    return clusterVectorNodeIdsByConnectedComponents(nodeIds, vectorByNodeId)
  }
  return clusterVectorNodeIdsGreedy(nodeIds, vectorByNodeId)
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
  vectorByNodeId: Map<string, number[]>
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
        if (similarity >= VECTOR_REFINEMENT_THRESHOLD) {
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
    docKey: docScope?.docKey ?? null,
    vectorThreshold: VECTOR_CLUSTER_THRESHOLD,
    refinementThreshold: VECTOR_REFINEMENT_THRESHOLD
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

  const vectorMemberGroups = clusterVectorNodeIds(vectorNodeIds, vectorByNodeId)
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
    const shouldTryRefine =
      !!cluster.representativeVec &&
      cluster.memberNodeIds.length >= VECTOR_REFINEMENT_MIN_CLUSTER_SIZE &&
      (shouldRefineBySize ||
        (cluster.similarityMin != null &&
          cluster.similarityMin < VECTOR_REFINEMENT_TRIGGER_MIN_SIMILARITY))

    if (!shouldTryRefine) {
      clustersAfterRefinement.push(cluster)
      continue
    }

    stats.refinementAttempts += 1

    const splitMembers = splitMembersByStrictVectorThreshold(
      cluster.memberNodeIds,
      vectorByNodeId
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
      refinementThreshold: VECTOR_REFINEMENT_THRESHOLD
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
    topClusters
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
