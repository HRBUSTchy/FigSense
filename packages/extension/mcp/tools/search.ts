import type { SearchParametersInput, SearchResult } from '@tempad-dev/shared'

import { resolveEmbeddingDocKey } from '@/embedding/indexer/client'
import { getEmbeddingMemory, listEmbeddingMemoryDocKeys } from '@/embedding/indexer/memory'

import {
  buildDescriptionEmbedding,
  buildNodeEmbedding,
  buildStructureVector,
  collectVisibleSceneNodes,
  cosineSimilarity,
  resolveNodeBrief,
  toEmbeddableNode
} from './design-common'

const DEFAULT_TOP_K = 8
const MAX_CANDIDATES = 5000

type SearchCandidate = {
  nodeId: string
  docKey: string
  vec: number[]
}

function resolveSceneNode(nodeId: string): SceneNode | null {
  const node = figma.getNodeById(nodeId)
  if (!node || !('visible' in node)) return null
  return node as SceneNode
}

function chooseTopK(topK?: number): number {
  if (typeof topK !== 'number' || !Number.isFinite(topK)) {
    return DEFAULT_TOP_K
  }
  return Math.max(1, Math.min(50, Math.floor(topK)))
}

function loadEmbeddingCandidates(docScope: {
  docKey: string
  fileKey: string
} | null): SearchCandidate[] {
  if (!docScope) return []
  const prefix = `figma:${docScope.fileKey}:`
  const candidates: SearchCandidate[] = []
  const docKeys = listEmbeddingMemoryDocKeys().filter((key) => key.startsWith(prefix))

  for (const docKey of docKeys) {
    const store = getEmbeddingMemory(docKey)
    if (!store) continue
    for (const [nodeId, entry] of store.entries()) {
      if (!entry.vec?.length) continue
      candidates.push({
        nodeId,
        docKey,
        vec: entry.vec
      })
      if (candidates.length >= MAX_CANDIDATES) {
        return candidates
      }
    }
  }

  return candidates
}

function loadStructureCandidates(docKey: string): SearchCandidate[] {
  return collectVisibleSceneNodes(undefined, MAX_CANDIDATES)
    .map((node) => ({
      nodeId: node.id,
      docKey,
      vec: buildStructureVector(toEmbeddableNode(node))
    }))
}

export async function handleSearch(args: SearchParametersInput): Promise<SearchResult> {
  const docScope = resolveEmbeddingDocKey()
  const structureOnly = !!args.structureOnly
  const topK = chooseTopK(args.topK)

  const queryType: SearchResult['queryType'] = args.nodeId ? 'node' : 'description'
  const queryNode = args.nodeId ? resolveSceneNode(args.nodeId) : null

  const candidates = structureOnly
    ? loadStructureCandidates(docScope?.docKey ?? 'figma:unknown')
    : loadEmbeddingCandidates(docScope)

  let queryVec: number[] | null = null
  if (queryNode) {
    queryVec = structureOnly
      ? buildStructureVector(toEmbeddableNode(queryNode))
      : candidates.find((candidate) => candidate.nodeId === queryNode.id)?.vec ?? buildNodeEmbedding(queryNode)
  } else if (args.description) {
    queryVec = buildDescriptionEmbedding(args.description, structureOnly)
  }

  if (!queryVec?.length || !candidates.length) {
    return {
      queryType,
      matches: [],
      totalCandidates: candidates.length
    }
  }

  const ranked = candidates
    .filter((candidate) => candidate.vec.length === queryVec!.length)
    .filter((candidate) => !(queryNode && candidate.nodeId === queryNode.id))
    .map((candidate) => ({
      ...candidate,
      similarity: cosineSimilarity(queryVec!, candidate.vec)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)

  const matches = ranked.map((item) => {
    const { name, type } = resolveNodeBrief(item.nodeId)
    return {
      nodeId: item.nodeId,
      name,
      type,
      similarity: item.similarity,
      docKey: item.docKey
    }
  })

  return {
    queryType,
    matches,
    totalCandidates: candidates.length
  }
}
