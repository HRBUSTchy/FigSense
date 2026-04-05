import { createSharedComposable, useIntervalFn } from '@vueuse/core'
import { nextTick, ref, watch } from 'vue'

import type { CachedVectorEntry, EmbeddingIndexOptions } from '@/embedding/indexer/types'

import {
  initEmbeddingIndexSession,
  processEmbeddingIndexBatch,
  resolveEmbeddingDocKey,
  streamCurrentPagePostorder
} from '@/embedding/indexer/client'
import {
  clearEmbeddingIndex,
  countEmbeddingIndex,
  listEmbeddingIndex,
  putEmbeddingIndex,
  type EmbeddingIndexRecord
} from '@/utils/idb'
import { logger } from '@/utils/log'
import { layoutReady, runtimeMode } from '@/ui/state'

export type EmbeddingIndexPhase = 'idle' | 'loading_cache' | 'snapshotting' | 'indexing' | 'ready' | 'error'

export type EmbeddingIndexState = {
  phase: EmbeddingIndexPhase
  docKey: string | null
  cachedCount: number
  total: number
  done: number
  cacheHits: number
  updated: number
  persisted: number
  lastDurationMs: number | null
  errorMessage: string | null
}

const DEFAULT_OPTIONS: EmbeddingIndexOptions = {
  mergeStrategy: 'weighted',
  decayRate: 0.5
}

export const useEmbeddingIndex = createSharedComposable(() => {
  const state = ref<EmbeddingIndexState>({
    phase: 'idle',
    docKey: null,
    cachedCount: 0,
    total: 0,
    done: 0,
    cacheHits: 0,
    updated: 0,
    persisted: 0,
    lastDurationMs: null,
    errorMessage: null
  })

  let running = false
  let autoTriggered = false
  let idleBuildHandle: number | null = null
  let observedDocKey: string | null = null

  function waitForIdleSlice(timeout = 180): Promise<void> {
    return new Promise((resolve) => {
      const idleCb = (window as any).requestIdleCallback as
        | ((cb: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void, options?: { timeout?: number }) => number)
        | undefined
      if (typeof idleCb === 'function') {
        idleCb(() => resolve(), { timeout })
        return
      }
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => resolve())
        return
      }
      setTimeout(resolve, 0)
    })
  }

  function resetProgress() {
    state.value.total = 0
    state.value.done = 0
    state.value.cacheHits = 0
    state.value.updated = 0
    state.value.persisted = 0
    state.value.errorMessage = null
    state.value.lastDurationMs = null
  }

  async function refreshCacheCount(docKey: string): Promise<number> {
    const count = await countEmbeddingIndex(docKey)
    state.value.cachedCount = count
    return count
  }

  async function build({ force }: { force: boolean }) {
    if (running) return

    if (runtimeMode.value !== 'standard' || !layoutReady.value) {
      return
    }

    const resolved = resolveEmbeddingDocKey()
    if (!resolved) {
      state.value.phase = 'error'
      state.value.errorMessage = 'Unable to resolve Figma file/page key.'
      return
    }

    running = true
    const startedAt = performance.now()

    try {
      state.value.phase = 'loading_cache'
      state.value.docKey = resolved.docKey
      resetProgress()
      await nextTick()

      const cachedCount = await refreshCacheCount(resolved.docKey)
      const cachedRecords = cachedCount > 0 ? await listEmbeddingIndex(resolved.docKey) : []
      const cached: CachedVectorEntry[] = cachedRecords.map((record) => ({
        nodeId: record.nodeId,
        sig: record.sig,
        vec: record.vec
      }))

      if (cachedCount > 0 && !force) {
        state.value.phase = 'ready'
        state.value.lastDurationMs = Math.round(performance.now() - startedAt)
        return
      }

      state.value.phase = 'snapshotting'
      await nextTick()

      await initEmbeddingIndexSession(resolved.docKey, DEFAULT_OPTIONS, cached)

      state.value.phase = 'indexing'
      state.value.total = 0
      await nextTick()

      const persistBuffer: EmbeddingIndexRecord[] = []
      const flushPersistBuffer = async (force = false) => {
        if (!force && persistBuffer.length < 360) return
        if (!persistBuffer.length) return
        await waitForIdleSlice()
        const payload = persistBuffer.splice(0, persistBuffer.length)
        await putEmbeddingIndex(payload)
        state.value.persisted += payload.length
      }

      await streamCurrentPagePostorder({
        yieldEvery: 50,
        batchSize: 80,
        onBatch: async (chunk) => {
          await waitForIdleSlice()
          state.value.total += chunk.length
          const res = await processEmbeddingIndexBatch(resolved.docKey, DEFAULT_OPTIONS, chunk)

          state.value.done += res.processed
          state.value.cacheHits += res.cacheHits
          state.value.updated += res.updated

          if (res.changed.length) {
            const now = Date.now()
            persistBuffer.push(
              ...res.changed.map((item) => ({
                key: `${resolved.docKey}:${item.nodeId}`,
                docKey: resolved.docKey,
                nodeId: item.nodeId,
                sig: item.sig,
                vec: item.vec,
                updatedAt: now
              }))
            )
            await flushPersistBuffer(false)
          }

          await nextTick()
        }
      })

      await flushPersistBuffer(true)

      await refreshCacheCount(resolved.docKey)
      state.value.phase = 'ready'
      state.value.lastDurationMs = Math.round(performance.now() - startedAt)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.warn('Embedding index build failed:', error)
      state.value.phase = 'error'
      state.value.errorMessage = message
      state.value.lastDurationMs = Math.round(performance.now() - startedAt)
    } finally {
      running = false
    }
  }

  async function clearCache() {
    const docKey = state.value.docKey ?? resolveEmbeddingDocKey()?.docKey ?? null
    if (!docKey) return
    await clearEmbeddingIndex(docKey)
    state.value.cachedCount = 0
    if (state.value.phase === 'ready') {
      state.value.phase = 'idle'
    }
  }

  function buildIfMissingCache() {
    const resolved = resolveEmbeddingDocKey()
    if (!resolved) return
    build({ force: false })
  }

  function resetStateForDocScope(docKey: string): void {
    state.value.docKey = docKey
    state.value.cachedCount = 0
    state.value.total = 0
    state.value.done = 0
    state.value.cacheHits = 0
    state.value.updated = 0
    state.value.persisted = 0
    state.value.lastDurationMs = null
    state.value.errorMessage = null
    state.value.phase = 'idle'
  }

  function cancelScheduledAutoBuild() {
    if (idleBuildHandle == null) return
    if (typeof (window as any).cancelIdleCallback === 'function') {
      ;(window as any).cancelIdleCallback(idleBuildHandle)
    } else {
      clearTimeout(idleBuildHandle)
    }
    idleBuildHandle = null
  }

  function scheduleAutoBuild() {
    cancelScheduledAutoBuild()
    if (running) return

    if (typeof (window as any).requestIdleCallback === 'function') {
      idleBuildHandle = (window as any).requestIdleCallback(
        () => {
          idleBuildHandle = null
          buildIfMissingCache()
        },
        { timeout: 2500 }
      )
      return
    }

    idleBuildHandle = window.setTimeout(() => {
      idleBuildHandle = null
      buildIfMissingCache()
    }, 300)
  }

  function syncDocScope(): void {
    if (runtimeMode.value !== 'standard' || !layoutReady.value) {
      return
    }

    const resolved = resolveEmbeddingDocKey()
    if (!resolved) return

    if (resolved.docKey === observedDocKey) {
      return
    }

    observedDocKey = resolved.docKey
    autoTriggered = false
    cancelScheduledAutoBuild()
    resetStateForDocScope(resolved.docKey)
  }

  watch(
    [layoutReady, runtimeMode],
    ([ready, mode]) => {
      if (!ready || mode !== 'standard') {
        cancelScheduledAutoBuild()
        autoTriggered = false
        observedDocKey = null
        if (state.value.phase !== 'idle') {
          state.value.phase = 'idle'
          state.value.docKey = null
        }
        return
      }

      syncDocScope()

      if (autoTriggered) return
      autoTriggered = true

      const resolved = resolveEmbeddingDocKey()
      if (!resolved) return

      countEmbeddingIndex(resolved.docKey)
        .then((count) => {
          if (count > 0) {
            state.value.docKey = resolved.docKey
            state.value.cachedCount = count
            state.value.phase = 'ready'
            return
          }
          scheduleAutoBuild()
        })
        .catch((error) => {
          logger.warn('Failed to read embedding index cache count:', error)
          scheduleAutoBuild()
        })
    },
    { immediate: true }
  )

  useIntervalFn(
    () => {
      const prev = observedDocKey
      syncDocScope()
      if (observedDocKey !== prev) {
        const resolved = resolveEmbeddingDocKey()
        if (!resolved) return
        countEmbeddingIndex(resolved.docKey)
          .then((count) => {
            if (count > 0) {
              state.value.docKey = resolved.docKey
              state.value.cachedCount = count
              state.value.phase = 'ready'
              return
            }
            scheduleAutoBuild()
          })
          .catch((error) => {
            logger.warn('Failed to read embedding index cache count after page switch:', error)
            scheduleAutoBuild()
          })
      }
    },
    800,
    { immediate: true }
  )

  return {
    state,
    build: () => build({ force: false }),
    reindex: () => build({ force: true }),
    clearCache
  }
})
