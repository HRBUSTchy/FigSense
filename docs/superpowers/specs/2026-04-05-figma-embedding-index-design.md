# Figma Embedding Index (Worker + Cache) Design

## Goal

When a Figma file is opened in the browser (via the existing TemPad Dev extension on `figma.com`), build a bottom-up (child → parent) embedding index for nodes on the current page. The index is computed in a sandboxed Worker and persisted locally to avoid repeated full recomputation across sessions.

## Non-goals (for this iteration)

- Server-side / REST API based “last modified time” caching.
- ANN index (HNSW/IVF/etc.) or UI-level similarity search UX.

## Architecture

- **Main/UI thread (extension UI script):**
  - Detect readiness (`layoutReady` and `runtimeMode === 'standard'`).
  - Resolve document scope by `docKey = fileKey + pageId + version`.
  - Detect page switch by comparing current `docKey` with observed `docKey`; reset state when scope changes.
  - Stream a serializable snapshot of current page nodes in **postorder** (child → parent).
  - Yield frequently during traversal and process in small batches to reduce UI jank.
  - Load cached vectors/signatures from IndexedDB.
  - Send work to a dedicated Worker in batches.
  - Persist changed entries back to IndexedDB with buffered writes (not every single batch write).
  - Expose progress + controls in the extension UI.

- **Worker:**
  - Maintains an in-memory map `{ nodeId -> { sig, vec } }` scoped by `docKey`.
  - For each node (postorder), decides whether it can reuse cached `vec` by comparing a deterministic `sig`.
  - When `sig` changes, recompute `vec` using the existing embedding logic and merge strategy.

## Triggering & Scope

- Auto-index runs when page is ready and cache is missing for current `docKey`.
- A Figma file can contain multiple pages; each page uses an independent cache scope.
- Switching page triggers scope re-evaluation; if the new page has cache, mark ready immediately; otherwise schedule auto-build.

## Data model

- `docKey`: derived from `location.pathname` (Figma file key) + `figma.currentPage.id` + `EMBEDDING_INDEX_VERSION`.
- Cache record:
  - `sig`: string hash representing local node features + visible child signatures + merge parameters.
  - `vec`: embedding vector (number array) for the node’s merged embedding.

## Cache invalidation

- Bump `EMBEDDING_INDEX_VERSION` when embedding logic changes.
- Node-level invalidation is implicit via `sig` mismatch (node properties or child signatures changed).
- Page-level isolation is guaranteed by `docKey` including `pageId`.

## Performance strategy

- `SceneNode` access stays on main thread (Worker cannot call `window.figma` APIs).
- Main thread does not build one huge snapshot array before computation; it streams postorder batches.
- Each traversal slice and each processing slice waits for an idle/frame slot before continuing.
- IndexedDB writes are buffered and flushed in larger chunks to reduce transaction overhead.

## UI

Add an “Embedding” section in preferences showing:

- Status: idle / loading cache / snapshotting / indexing / ready / error
- Progress: processed / total, cache hits, updated nodes
- Metrics: cached / hits / updated / persisted / last run duration
- Controls: reindex (force recompute) + fold/unfold details

## Known boundary

- Snapshot extraction cannot be moved fully to Worker because Figma runtime objects (`window.figma`, `SceneNode`) are only available on main thread.
