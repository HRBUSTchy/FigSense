import type { ListResult } from '@tempad-dev/shared'

import { resolveEmbeddingDocKey } from '@/embedding/indexer/client'
import { listEmbeddingIndex } from '@/utils/idb'

import { collectVisibleSceneNodes, cosineSimilarity } from './design-common'

const VECTOR_CLUSTER_THRESHOLD = 0.9
const MAX_LIST_NODES = 1200
const MAX_CLUSTER_COUNT = 120
const MAX_MEMBER_IDS = 120
const MAX_REP_CHILDREN = 24

type Cluster = {
  clusterId: string
  representative: SceneNode
  representativeVec?: number[]
  memberNodeIds: string[]
}

function getVisibleDirectChildren(node: SceneNode): SceneNode[] {
  if (!('children' in node)) return []
  return node.children.filter(
    (child): child is SceneNode => !!child && 'visible' in child && child.visible
  )
}

function fallbackClusterKey(node: SceneNode): string {
  const widthBin = Math.round(node.width / 8)
  const heightBin = Math.round(node.height / 8)
  const childCount = 'children' in node ? getVisibleDirectChildren(node).length : 0
  return `${node.type}:${widthBin}:${heightBin}:${childCount}`
}

function pickClusterByVector(candidateVec: number[], clusters: Cluster[]): Cluster | null {
  let bestCluster: Cluster | null = null
  let bestScore = -1

  for (const cluster of clusters) {
    if (!cluster.representativeVec) continue
    const score = cosineSimilarity(candidateVec, cluster.representativeVec)
    if (score > bestScore) {
      bestScore = score
      bestCluster = cluster
    }
  }

  if (bestScore >= VECTOR_CLUSTER_THRESHOLD) {
    return bestCluster
  }
  return null
}

export async function handleList(scopeNode?: SceneNode): Promise<ListResult> {
  const page = window.figma?.currentPage
  if (!page) {
    throw new Error('Figma page is not ready yet.')
  }

  const allNodes = collectVisibleSceneNodes(scopeNode)
  const nodes = allNodes.slice(0, MAX_LIST_NODES)

  const docScope = resolveEmbeddingDocKey()
  const cachedRecords = docScope ? await listEmbeddingIndex(docScope.docKey) : []
  const vectorsById = new Map(cachedRecords.map((record) => [record.nodeId, record.vec]))

  const clusters: Cluster[] = []
  const fallbackClusterMap = new Map<string, Cluster>()

  for (const node of nodes) {
    const nodeVec = vectorsById.get(node.id)

    let targetCluster: Cluster | null = null
    if (nodeVec?.length) {
      targetCluster = pickClusterByVector(nodeVec, clusters)
      if (!targetCluster && clusters.length < MAX_CLUSTER_COUNT) {
        targetCluster = {
          clusterId: `cluster-${clusters.length + 1}`,
          representative: node,
          representativeVec: nodeVec,
          memberNodeIds: []
        }
        clusters.push(targetCluster)
      }
    } else {
      const key = fallbackClusterKey(node)
      targetCluster = fallbackClusterMap.get(key) ?? null
      if (!targetCluster && clusters.length < MAX_CLUSTER_COUNT) {
        targetCluster = {
          clusterId: `cluster-${clusters.length + 1}`,
          representative: node,
          memberNodeIds: []
        }
        fallbackClusterMap.set(key, targetCluster)
        clusters.push(targetCluster)
      }
    }

    if (!targetCluster) {
      continue
    }

    if (targetCluster.memberNodeIds.length < MAX_MEMBER_IDS) {
      targetCluster.memberNodeIds.push(node.id)
    }
  }

  const serializedClusters = clusters
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

  return {
    scopeNodeId: scopeNode?.id ?? page.id,
    totalNodes: nodes.length,
    clusters: serializedClusters
  }
}
