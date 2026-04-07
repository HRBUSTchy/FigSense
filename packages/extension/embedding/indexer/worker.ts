/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RequestMessage, ResponseMessage } from '@/codegen/requester'

import {
  createNodeEmbedding,
  mergeVectorsAttention,
  mergeVectorsMax,
  mergeVectorsWeighted
} from '@/embedding/node-embedder'
import { lockdownWorker } from '@/worker/lockdown'

import type {
  CachedVectorEntry,
  EmbeddingIndexOptions,
  EmbeddingIndexRequestPayload,
  EmbeddingIndexResponsePayload,
  NodeSnapshot
} from './types'

type Request = RequestMessage<EmbeddingIndexRequestPayload>
type Response = ResponseMessage<EmbeddingIndexResponsePayload>

type Entry = { sig: string; vec: number[] }

const postMessage = globalThis.postMessage

let activeDocKey: string | null = null
let activeOptions: EmbeddingIndexOptions | null = null
let entries = new Map<string, Entry>()

function fnv1aUpdate(hash: number, value: number): number {
  let h = hash ^ value
  // FNV prime
  h = Math.imul(h, 0x01000193)
  return h >>> 0
}

function hashString(seed: number, input: string): number {
  let h = seed
  for (let i = 0; i < input.length; i += 1) {
    h = fnv1aUpdate(h, input.charCodeAt(i))
  }
  return h
}

function hashNumber(seed: number, value: number): number {
  if (!Number.isFinite(value)) return fnv1aUpdate(seed, 0)
  const quantized = Math.round(value * 1_000_000)
  return fnv1aUpdate(seed, quantized & 0xffffffff)
}

function hashVector(seed: number, vec: number[]): number {
  let h = seed
  for (let i = 0; i < vec.length; i += 1) {
    h = hashNumber(h, vec[i] ?? 0)
  }
  return h
}

function computeSig(localVec: number[], childSigs: string[], options: EmbeddingIndexOptions): string {
  let h = 0x811c9dc5
  h = hashString(h, options.mergeStrategy)
  h = hashNumber(h, options.decayRate)
  h = hashVector(h, localVec)
  for (const sig of childSigs) {
    h = hashString(h, sig)
  }
  return h.toString(16).padStart(8, '0')
}

function getVisibleChildIds(node: NodeSnapshot): string[] {
  if (!node.children?.length) return []
  return node.children.filter((c) => c.visible).map((c) => c.id)
}

function resolveChildVectors(childIds: string[]): number[][] {
  const vectors: number[][] = []
  for (const id of childIds) {
    const entry = entries.get(id)
    if (entry) vectors.push(entry.vec)
  }
  return vectors
}

function mergeVectors(
  base: number[],
  children: number[][],
  options: EmbeddingIndexOptions
): number[] {
  if (children.length === 0) return base
  switch (options.mergeStrategy) {
    case 'weighted':
      return mergeVectorsWeighted(base, children, options.decayRate)
    case 'attention':
      return mergeVectorsAttention(base, children)
    case 'max':
      return mergeVectorsMax(base, children)
  }
}

function ensureSession(docKey: string, options: EmbeddingIndexOptions): void {
  const same = activeDocKey === docKey
  const sameOptions =
    !!activeOptions &&
    activeOptions.mergeStrategy === options.mergeStrategy &&
    activeOptions.decayRate === options.decayRate

  if (same && sameOptions) return

  activeDocKey = docKey
  activeOptions = options
  entries = new Map()
}

function loadCache(cached: CachedVectorEntry[]): void {
  for (const item of cached) {
    entries.set(item.nodeId, { sig: item.sig, vec: item.vec })
  }
}

function processBatch(nodes: NodeSnapshot[], options: EmbeddingIndexOptions) {
  let processed = 0
  let cacheHits = 0
  let updated = 0
  const changed: CachedVectorEntry[] = []

  for (const node of nodes) {
    if (!node.visible) {
      continue
    }

    processed += 1

    const visibleChildIds = getVisibleChildIds(node)
    const childSigs = visibleChildIds.map((id) => entries.get(id)?.sig ?? '')

    const localVec = createNodeEmbedding(node as any)
    const sig = computeSig(localVec, childSigs, options)

    const existing = entries.get(node.id)
    if (existing && existing.sig === sig) {
      cacheHits += 1
      continue
    }

    const childVectors = resolveChildVectors(visibleChildIds)
    const vec = mergeVectors(localVec, childVectors, options)

    entries.set(node.id, { sig, vec })
    updated += 1
    changed.push({ nodeId: node.id, sig, vec })
  }

  return { processed, cacheHits, updated, changed }
}

globalThis.onmessage = ({ data }: MessageEvent<Request>) => {
  const { id, payload } = data

  try {
    if (payload.type === 'init') {
      ensureSession(payload.docKey, payload.options)
      loadCache(payload.cached)

      const message: Response = {
        id,
        payload: {
          type: 'init',
          docKey: payload.docKey,
          cachedCount: payload.cached.length
        }
      }
      postMessage(message)
      return
    }

    if (payload.type === 'process') {
      ensureSession(payload.docKey, payload.options)
      const stats = processBatch(payload.nodes, payload.options)

      const message: Response = {
        id,
        payload: {
          type: 'process',
          docKey: payload.docKey,
          processed: stats.processed,
          cacheHits: stats.cacheHits,
          updated: stats.updated,
          changed: stats.changed
        }
      }

      postMessage(message)
      return
    }

    const message: Response = { id, error: new Error('Unknown embedding index request type.') }
    postMessage(message)
  } catch (error) {
    const message: Response = { id, error }
    postMessage(message)
  }
}

lockdownWorker('embedding-index')
