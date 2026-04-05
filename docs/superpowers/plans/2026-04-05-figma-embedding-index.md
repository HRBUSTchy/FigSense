# Figma Embedding Index (Worker + Cache) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compute and cache node embeddings bottom-up in a Worker when Figma loads, and show progress + controls in the extension UI.

**Architecture:** UI thread snapshots nodes + loads/saves IndexedDB; Worker computes embeddings and decides reuse via per-node signatures. Batch processing keeps UI responsive.

**Tech Stack:** TypeScript, Vue 3 (WXT), Web Worker, IndexedDB.

---

## File structure

- Create: `packages/extension/utils/idb.ts` (small IndexedDB helper)
- Create: `packages/extension/embedding/indexer/types.ts` (snapshot + protocol types)
- Create: `packages/extension/embedding/indexer/worker.ts` (index worker, sandboxed)
- Create: `packages/extension/embedding/indexer/client.ts` (main-thread client + batching)
- Create: `packages/extension/composables/embedding-index.ts` (lifecycle + state)
- Create: `packages/extension/components/sections/EmbeddingSection.vue` (UI)
- Modify: `packages/extension/components/sections/PrefSection.vue` (mount EmbeddingSection)
- Modify: `packages/extension/composables/index.ts` (export composable)
- Modify: `packages/extension/entrypoints/ui/App.vue` (start composable)
- Modify: `packages/extension/embedding/types.ts` (loosen types so snapshots can be embedded)

## Task 1: Add IndexedDB cache utilities

**Files:**
- Create: `packages/extension/utils/idb.ts`

- [ ] Implement `openDb()` and an object store `embeddingIndex` with:
  - key: `key = ${docKey}:${nodeId}`
  - index: `docKey`
- [ ] Add helpers:
  - `countEmbeddingIndex(docKey, version)`
  - `listEmbeddingIndex(docKey, version)`
  - `putEmbeddingIndex(entries)`
  - `clearEmbeddingIndex(docKey, version)`

## Task 2: Define snapshot + worker protocol

**Files:**
- Create: `packages/extension/embedding/indexer/types.ts`

- [ ] Define `NodeSnapshot` (serializable subset used by embedding).
- [ ] Define worker request/response types for `init` + `process`.

## Task 3: Implement the embedding index worker

**Files:**
- Create: `packages/extension/embedding/indexer/worker.ts`
- Modify: `packages/extension/embedding/types.ts` (ensure embedding functions accept `NodeSnapshot` shape)

- [ ] Implement per-node `sig` hashing from:
  - local embedding vector values
  - visible child `sig`s
  - merge parameters
  - `EMBEDDING_INDEX_VERSION`
- [ ] On `process`, iterate snapshots (postorder) and either:
  - reuse cached vector when `sig` matches, or
  - compute merged vector and return updates.
- [ ] Call `lockdownWorker('embedding-index')` after setting `onmessage`.

## Task 4: Build main-thread client + batching

**Files:**
- Create: `packages/extension/embedding/indexer/client.ts`

- [ ] Implement page traversal to build `NodeSnapshot[]` in postorder.
- [ ] Implement `runIndexBuild()`:
  - load cache from IDB
  - init worker with cache
  - process snapshots in batches
  - persist updates per batch
  - report progress callbacks

## Task 5: Add composable + UI

**Files:**
- Create: `packages/extension/composables/embedding-index.ts`
- Create: `packages/extension/components/sections/EmbeddingSection.vue`
- Modify: `packages/extension/components/sections/PrefSection.vue`
- Modify: `packages/extension/composables/index.ts`
- Modify: `packages/extension/entrypoints/ui/App.vue`

- [ ] Composable holds reactive status/progress and:
  - auto-build when cache missing
  - allow force rebuild + clear cache
- [ ] UI section shows status + progress + buttons.

## Task 6: Verification

**Commands:**
- [ ] Run unit tests: `pnpm -C packages/extension test:run`
- [ ] Run typecheck: `pnpm -C packages/extension typecheck`

