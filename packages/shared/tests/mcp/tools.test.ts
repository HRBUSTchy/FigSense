import { describe, expect, it } from 'vitest'

import {
  AssetDescriptorSchema,
  DiffParametersSchema,
  DiffResultSchema,
  DistanceParametersSchema,
  DistanceResultSchema,
  GetAssetsParametersSchema,
  GetAssetsResultSchema,
  GetCodeParametersSchema,
  GetScreenshotParametersSchema,
  GetStructureParametersSchema,
  GetTokenDefsParametersSchema,
  ListParametersSchema,
  ListResultSchema,
  ReadParametersSchema,
  ReadResultSchema,
  SearchParametersSchema,
  SearchResultSchema
} from '../../src/mcp/tools'

describe('mcp/tools AssetDescriptorSchema', () => {
  it('accepts a valid asset descriptor', () => {
    const parsed = AssetDescriptorSchema.safeParse({
      hash: 'deadbeef',
      url: 'https://example.com/a.png',
      mimeType: 'image/png',
      size: 1024,
      width: 300,
      height: 200
    })

    expect(parsed.success).toBe(true)
  })

  it('rejects negative size', () => {
    const invalidSize = AssetDescriptorSchema.safeParse({
      hash: 'deadbeef',
      url: 'https://example.com/a.png',
      mimeType: 'image/png',
      size: -1
    })
    expect(invalidSize.success).toBe(false)
  })
})

describe('mcp/tools parameter schemas', () => {
  it('accepts optional get_code params and validates preferred language enum', () => {
    expect(GetCodeParametersSchema.safeParse({}).success).toBe(true)
    expect(
      GetCodeParametersSchema.safeParse({
        nodeId: '123:456',
        preferredLang: 'vue',
        resolveTokens: true
      }).success
    ).toBe(true)
    expect(
      GetCodeParametersSchema.safeParse({
        preferredLang: 'svelte'
      }).success
    ).toBe(false)
  })

  it('enforces token name canonical format and non-empty names list', () => {
    expect(
      GetTokenDefsParametersSchema.safeParse({
        names: ['--color-primary', '--spacing-2'],
        includeAllModes: false
      }).success
    ).toBe(true)

    expect(
      GetTokenDefsParametersSchema.safeParse({
        names: [],
        includeAllModes: true
      }).success
    ).toBe(false)

    expect(
      GetTokenDefsParametersSchema.safeParse({
        names: ['color-primary']
      }).success
    ).toBe(false)
  })

  it('accepts empty screenshot params and optional structure depth', () => {
    expect(GetScreenshotParametersSchema.safeParse({}).success).toBe(true)
    expect(GetScreenshotParametersSchema.safeParse({ nodeId: '9:99' }).success).toBe(true)

    expect(
      GetStructureParametersSchema.safeParse({
        nodeId: '1:2',
        options: { depth: 2 }
      }).success
    ).toBe(true)

    expect(
      GetStructureParametersSchema.safeParse({
        options: { depth: 0 }
      }).success
    ).toBe(false)
  })

  it('validates get_assets hash inputs and get_assets result shape', () => {
    expect(
      GetAssetsParametersSchema.safeParse({
        hashes: ['deadbeef', '0123abcd']
      }).success
    ).toBe(true)

    expect(
      GetAssetsParametersSchema.safeParse({
        hashes: ['bad-hash']
      }).success
    ).toBe(false)

    expect(
      GetAssetsResultSchema.safeParse({
        assets: [
          {
            hash: 'deadbeef',
            url: 'https://example.com/a.png',
            mimeType: 'image/png',
            size: 10
          }
        ],
        missing: ['beefcafe']
      }).success
    ).toBe(true)
  })

  it('validates list/read parameter and result schemas', () => {
    expect(ListParametersSchema.safeParse({}).success).toBe(true)
    expect(ListParametersSchema.safeParse({ nodeId: '1:2' }).success).toBe(true)
    expect(
      ListResultSchema.safeParse({
        scopeNodeId: '1:2',
        totalNodes: 2,
        clusters: [
          {
            clusterId: 'cluster-1',
            size: 2,
            representativeNodeId: '1:2',
            representative: {
              id: '1:2',
              name: 'Card',
              type: 'FRAME',
              width: 120,
              height: 80,
              topLevelChildren: [{ id: '1:3', name: 'Title', type: 'TEXT' }]
            },
            memberNodeIds: ['1:2', '1:5']
          }
        ]
      }).success
    ).toBe(true)

    expect(ReadParametersSchema.safeParse({ nodeId: '1:2' }).success).toBe(true)
    expect(
      ReadResultSchema.safeParse({
        root: {
          id: '1:2',
          name: 'Card',
          type: 'FRAME',
          visible: true,
          x: 0,
          y: 0,
          width: 120,
          height: 80,
          styles: { 'background-color': '#fff' },
          children: [],
          truncated: { reason: 'children', omittedChildCount: 2, omittedChildNodeIds: ['1:6'] }
        },
        maxDepth: 4,
        maxChildren: 80,
        truncatedNodeIds: ['1:2']
      }).success
    ).toBe(true)
  })

  it('validates distance/search/diff schemas', () => {
    expect(
      DistanceParametersSchema.safeParse({
        idA: '1:2',
        idB: '1:3'
      }).success
    ).toBe(true)

    expect(
      DistanceResultSchema.safeParse({
        idA: '1:2',
        idB: '1:3',
        relationship: 'a_contains_b',
        horizontal: 0,
        vertical: 0,
        inside: {
          outerId: '1:2',
          innerId: '1:3',
          left: 8,
          right: 8,
          top: 4,
          bottom: 4
        }
      }).success
    ).toBe(true)

    expect(SearchParametersSchema.safeParse({ nodeId: '1:2' }).success).toBe(true)
    expect(SearchParametersSchema.safeParse({ description: { type: 'FRAME' } }).success).toBe(true)
    expect(SearchParametersSchema.safeParse({}).success).toBe(false)
    expect(
      SearchResultSchema.safeParse({
        queryType: 'node',
        totalCandidates: 12,
        matches: [
          {
            nodeId: '1:8',
            name: 'Button',
            type: 'INSTANCE',
            similarity: 0.9,
            docKey: 'figma:abc:1:v1'
          }
        ]
      }).success
    ).toBe(true)

    expect(
      DiffParametersSchema.safeParse({
        idA: '1:2',
        idB: '1:3'
      }).success
    ).toBe(true)
    expect(
      DiffResultSchema.safeParse({
        idA: '1:2',
        idB: '1:3',
        size: {
          a: { width: 100, height: 80 },
          b: { width: 120, height: 80 },
          widthDelta: 20,
          heightDelta: 0
        },
        nodeCount: { a: 4, b: 5, delta: 1 },
        style: {
          added: ['border-radius'],
          removed: ['box-shadow'],
          changed: [{ key: 'background-color', a: '#fff', b: '#000' }]
        }
      }).success
    ).toBe(true)
  })
})
