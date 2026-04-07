import { describe, expect, it, vi } from 'vitest'

import { InjectToWindow } from '@/embedding'

function createMockNode(type: SceneNode['type'], overrides: Record<string, unknown> = {}): SceneNode {
  return {
    id: 'node-id',
    name: 'Node',
    type,
    visible: true,
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    ...overrides
  } as unknown as SceneNode
}

function setupWindowFigma(selection: SceneNode[]): void {
  const figmaMock = {
    currentPage: {
      id: 'page-1',
      name: 'Page One',
      selection
    }
  } as unknown as PluginAPI

  ;(globalThis as Record<string, unknown>).figma = figmaMock
  ;(globalThis as Record<string, unknown>).window = {
    figma: figmaMock
  } as Window
  ;(globalThis as Record<string, unknown>).location = {
    pathname: '/file/FILE_KEY_123/My-Design'
  }
}

describe('window.embedding.serializeSelectedNode', () => {
  it('serializes selected node and prints json payload', () => {
    const visibleChild = createMockNode('RECTANGLE', { id: 'child-visible', x: 16, y: 20 })
    const hiddenChild = createMockNode('RECTANGLE', { id: 'child-hidden', visible: false, x: 24, y: 40 })
    const selected = createMockNode('FRAME', {
      id: 'parent',
      name: 'Parent Frame',
      layoutMode: 'NONE',
      children: [visibleChild, hiddenChild]
    })

    setupWindowFigma([selected])
    InjectToWindow()

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const json = window.embedding?.serializeSelectedNode?.({ maxDepth: 4, print: true })

    expect(typeof json).toBe('string')
    const parsed = JSON.parse(json as string)
    expect(parsed.schema).toBe('embedding-node-snapshot/v1')
    expect(parsed.fileKey).toBe('FILE_KEY_123')
    expect(parsed.selectedNodeId).toBe('parent')
    expect(parsed.node.children).toHaveLength(1)
    expect(parsed.node.children[0].id).toBe('child-visible')
    expect(logSpy).toHaveBeenCalled()
  })

  it('returns null and warns when no node selected', () => {
    setupWindowFigma([])
    InjectToWindow()

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = window.embedding?.serializeSelectedNode?.()

    expect(result).toBeNull()
    expect(warnSpy).toHaveBeenCalledWith('[embedding] serializeSelectedNode: no selected node')
  })
})
