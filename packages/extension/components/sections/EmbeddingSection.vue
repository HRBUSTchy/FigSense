<script setup lang="ts">
import IconButton from '@/components/IconButton.vue'
import Collapsed from '@/components/icons/Collapsed.vue'
import Expanded from '@/components/icons/Expanded.vue'
import Refresh from '@/components/icons/Refresh.vue'
import Section from '@/components/Section.vue'
import { useEmbeddingIndex } from '@/composables/embedding-index'

const { state, reindex } = useEmbeddingIndex()
const contentCollapsed = ref(false)

const phaseLabel = computed(() => {
  switch (state.value.phase) {
    case 'idle':
      return 'Idle'
    case 'loading_cache':
      return 'Loading cache'
    case 'snapshotting':
      return 'Snapshotting'
    case 'indexing':
      return 'Indexing'
    case 'ready':
      return 'Ready'
    case 'error':
      return 'Error'
  }
})

const progressLabel = computed(() => {
  if (state.value.phase !== 'indexing') return null
  const total = state.value.total || 0
  const done = state.value.done || 0
  return total ? `${done}/${total}` : `${done}`
})

const percent = computed(() => {
  const total = state.value.total || 0
  if (!total) return 0
  return Math.min(100, Math.round((state.value.done / total) * 100))
})

const busy = computed(() => state.value.phase === 'loading_cache' || state.value.phase === 'snapshotting' || state.value.phase === 'indexing')
</script>

<template>
  <Section class="tp-embedding" flat>
    <template #header>
      <div class="tp-row tp-gap-l">
        <span>Embedding</span>
        <span class="tp-embedding-status">{{ phaseLabel }}</span>
        <span class="tp-embedding-progress" v-if="progressLabel">{{ progressLabel }}</span>
      </div>
      <div class="tp-row tp-gap">
        <IconButton
          variant="secondary"
          title="Reindex"
          :disabled="busy"
          @click="reindex"
        >
          <Refresh />
        </IconButton>
        <IconButton
          variant="secondary"
          :title="contentCollapsed ? 'Expand embedding details' : 'Collapse embedding details'"
          @click="contentCollapsed = !contentCollapsed"
        >
          <Collapsed v-if="contentCollapsed" />
          <Expanded v-else />
        </IconButton>
      </div>
    </template>

    <div class="tp-embedding-row" v-if="!contentCollapsed">
      <div class="tp-embedding-metrics">
        <div>Cached: {{ state.cachedCount }}</div>
        <div>Hits: {{ state.cacheHits }}</div>
        <div>Updated: {{ state.updated }}</div>
        <div>Persisted: {{ state.persisted }}</div>
      </div>
      <div class="tp-embedding-bar" v-if="state.phase === 'indexing'">
        <div class="tp-embedding-bar-fill" :style="{ width: `${percent}%` }" />
      </div>
      <div class="tp-embedding-error" v-if="state.phase === 'error' && state.errorMessage">
        {{ state.errorMessage }}
      </div>
      <div class="tp-embedding-duration" v-if="state.lastDurationMs != null && state.phase !== 'indexing'">
        Last run: {{ state.lastDurationMs }}ms
      </div>
    </div>
  </Section>
</template>

<style scoped>
.tp-embedding-status {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.tp-embedding-progress {
  color: var(--color-text-secondary);
}

.tp-embedding-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 12px;
}

.tp-embedding-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 12px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.tp-embedding-bar {
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--color-bgsecondary, rgba(0, 0, 0, 0.08));
}

.tp-embedding-bar-fill {
  height: 100%;
  background: var(--color-icon-success, #1bc47d);
}

.tp-embedding-error {
  color: var(--color-text-danger, #f24822);
  font-size: 12px;
  white-space: pre-wrap;
}

.tp-embedding-duration {
  color: var(--color-text-secondary);
  font-size: 12px;
}
</style>
