type MemoryEntry = {
  sig?: string
  vec: number[]
}

const embeddingMemoryByDocKey = new Map<string, Map<string, MemoryEntry>>()

function ensureDocStore(docKey: string): Map<string, MemoryEntry> {
  const existing = embeddingMemoryByDocKey.get(docKey)
  if (existing) return existing
  const created = new Map<string, MemoryEntry>()
  embeddingMemoryByDocKey.set(docKey, created)
  return created
}

export function hasEmbeddingMemory(docKey: string): boolean {
  return embeddingMemoryByDocKey.has(docKey)
}

export function hydrateEmbeddingMemory(
  docKey: string,
  entries: Array<{ nodeId: string; sig?: string; vec: number[] }>
): void {
  const store = new Map<string, MemoryEntry>()
  for (const entry of entries) {
    if (!entry.nodeId || !Array.isArray(entry.vec)) continue
    store.set(entry.nodeId, {
      ...(entry.sig ? { sig: entry.sig } : {}),
      vec: entry.vec
    })
  }
  embeddingMemoryByDocKey.set(docKey, store)
}

export function upsertEmbeddingMemory(
  docKey: string,
  entries: Array<{ nodeId: string; sig?: string; vec: number[] }>
): void {
  if (!entries.length) return
  const store = ensureDocStore(docKey)
  for (const entry of entries) {
    if (!entry.nodeId || !Array.isArray(entry.vec)) continue
    store.set(entry.nodeId, {
      ...(entry.sig ? { sig: entry.sig } : {}),
      vec: entry.vec
    })
  }
}

export function clearEmbeddingMemory(docKey: string): void {
  embeddingMemoryByDocKey.delete(docKey)
}

export function getEmbeddingMemory(docKey: string): ReadonlyMap<string, MemoryEntry> | null {
  return embeddingMemoryByDocKey.get(docKey) ?? null
}

export function listEmbeddingMemoryDocKeys(): string[] {
  return Array.from(embeddingMemoryByDocKey.keys())
}
