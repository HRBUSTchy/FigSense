/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { createNodeEmbedding, cosineSimilarity, mergeVectorsWeighted } from '@/embedding/node-embedder'

type SchemaNode = {
  id: string
  name?: string
  visible?: boolean
  children?: SchemaNode[]
}

type Orientation = 'horizontal' | 'vertical' | 'other'

const VECTOR_CLUSTER_THRESHOLD = 0.9
const DECAY_RATE = 0.5

function parseOrientation(name: string | undefined): Orientation {
  const value = name ?? ''
  if (value.includes('布局=水平')) return 'horizontal'
  if (value.includes('布局=垂直')) return 'vertical'
  return 'other'
}

function parseCount(name: string | undefined): number {
  if (!name) return 0
  const match = name.match(/数量=(\d+)/)
  return match ? Number(match[1]) : 0
}

function buildMergedEmbedding(node: SchemaNode): number[] {
  const localVec = createNodeEmbedding(node as any)
  const children = Array.isArray(node.children) ? node.children.filter((item) => item.visible !== false) : []
  if (!children.length) return localVec
  const childVectors = children.map((child) => buildMergedEmbedding(child))
  return mergeVectorsWeighted(localVec, childVectors, DECAY_RATE)
}

function clusterBySimilarity(items: Array<{ id: string; vec: number[] }>) {
  const clusters: Array<{ representative: number[]; members: string[] }> = []
  for (const item of items) {
    let bestIndex = -1
    let bestScore = -1
    for (let index = 0; index < clusters.length; index += 1) {
      const score = cosineSimilarity(item.vec, clusters[index]!.representative)
      if (score > bestScore) {
        bestScore = score
        bestIndex = index
      }
    }
    if (bestIndex >= 0 && bestScore >= VECTOR_CLUSTER_THRESHOLD) {
      clusters[bestIndex]!.members.push(item.id)
      continue
    }
    clusters.push({ representative: item.vec, members: [item.id] })
  }
  return clusters
}

describe('embedding orientation clustering with schema snapshot', () => {
  const currentFileDir = path.dirname(fileURLToPath(import.meta.url))
  const schemaPath = path.resolve(currentFileDir, '../../../../test/schema.json')
  const hasSchema = fs.existsSync(schemaPath)

  it.skipIf(!hasSchema)('keeps horizontal and vertical top-level nodes in separate clusters', () => {
    const raw = fs.readFileSync(schemaPath, 'utf8')
    const payload = JSON.parse(raw) as { node?: SchemaNode }
    const children = Array.isArray(payload.node?.children) ? payload.node!.children : []
    expect(children.length).toBeGreaterThan(0)

    const embeddings = children.map((node) => ({
      id: node.id,
      vec: buildMergedEmbedding(node)
    }))
    const meta = new Map(
      children.map((node) => [
        node.id,
        {
          orientation: parseOrientation(node.name),
          count: parseCount(node.name),
          name: node.name ?? ''
        }
      ])
    )
    const clusters = clusterBySimilarity(embeddings)

    const pureByOrientation = clusters.every((cluster) => {
      const considered = cluster.members
        .map((id) => meta.get(id))
        .filter((item): item is { orientation: Orientation; count: number; name: string } => !!item)
        .filter((item) => item.count > 1 && item.orientation !== 'other')
      if (considered.length <= 1) return true
      const orientations = new Set(considered.map((item) => item.orientation))
      return orientations.size === 1
    })

    const horizontalClusterCount = clusters.filter((cluster) =>
      cluster.members.some((id) => meta.get(id)?.orientation === 'horizontal')
    ).length
    const verticalClusterCount = clusters.filter((cluster) =>
      cluster.members.some((id) => meta.get(id)?.orientation === 'vertical')
    ).length

    const clusterSummary = clusters.map((cluster, index) => {
      const detail = cluster.members
        .map((id) => {
          const item = meta.get(id)
          return {
            id,
            name: item?.name ?? '',
            orientation: item?.orientation ?? 'other',
            count: item?.count ?? 0
          }
        })
      return {
        index,
        size: cluster.members.length,
        detail
      }
    })

    if (!pureByOrientation) {
      throw new Error(`Mixed orientation clusters:\n${JSON.stringify(clusterSummary, null, 2)}`)
    }

    expect(pureByOrientation).toBe(true)
    expect(horizontalClusterCount).toBeGreaterThan(0)
    expect(verticalClusterCount).toBeGreaterThan(0)
  })
})
