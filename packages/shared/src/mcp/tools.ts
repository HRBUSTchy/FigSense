import type { ZodType } from 'zod'

import { z } from 'zod'

import { MCP_HASH_PATTERN } from './constants'

export const AssetDescriptorSchema = z.object({
  hash: z.string().min(1),
  url: z.string().url(),
  mimeType: z.string().min(1),
  size: z.number().int().nonnegative(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional()
})

// get_code
export const GetCodeParametersSchema = z.object({
  nodeId: z
    .string()
    .describe(
      'Optional target node id; omit to use the current single selection when pulling the baseline snapshot.'
    )
    .optional(),
  preferredLang: z
    .enum(['jsx', 'vue'])
    .describe(
      'Preferred output language to bias the snapshot; otherwise uses the design’s hint/detected language, then falls back to JSX.'
    )
    .optional(),
  resolveTokens: z
    .boolean()
    .describe(
      'Inline token values instead of references for quick renders; default false returns token metadata so you can map into your theming system. When true, values are resolved per-node (mode-aware).'
    )
    .optional()
})

export type GetCodeParametersInput = z.input<typeof GetCodeParametersSchema>
export type GetCodeWarning = {
  type: 'truncated' | 'auto-layout' | 'shell' | string
  message: string
  data?: Record<string, unknown>
}
export type GetCodeResult = {
  code: string
  lang: 'vue' | 'jsx'
  assets?: AssetDescriptor[]
  tokens?: GetTokenDefsResult
  codegen: {
    plugin: string
    config: {
      cssUnit: 'px' | 'rem'
      rootFontSize: number
      scale: number
    }
  }
  warnings?: GetCodeWarning[]
}

// get_token_defs
export const GetTokenDefsParametersSchema = z.object({
  names: z
    .array(z.string().regex(/^--[a-zA-Z0-9-_]+$/))
    .min(1)
    .describe(
      'Canonical token names (CSS variable form) from Object.keys(get_code.tokens) or your own list to resolve, e.g., --color-primary.'
    ),
  includeAllModes: z
    .boolean()
    .describe(
      'Include all token modes (light/dark/etc.) instead of just the active one to mirror responsive tokens; default false.'
    )
    .optional()
})

export type GetTokenDefsParametersInput = z.input<typeof GetTokenDefsParametersSchema>
export type TokenEntry = {
  kind: 'color' | 'number' | 'string' | 'boolean'
  value: string | Record<string, string> // single mode -> string; multi-mode -> map (mode name -> literal or alias)
}

export type GetTokenDefsResult = {
  [canonicalName: string]: TokenEntry
}

// get_screenshot
export const GetScreenshotParametersSchema = z.object({
  nodeId: z
    .string()
    .describe(
      'Optional node id to screenshot; defaults to the current single selection. Useful when layout/overlap is uncertain (auto-layout none/inferred).'
    )
    .optional()
})

export type GetScreenshotParametersInput = z.input<typeof GetScreenshotParametersSchema>
export type GetScreenshotResult = {
  format: 'png'
  width: number
  height: number
  scale: number
  bytes: number
  asset: AssetDescriptor
}

// get_structure
export const GetStructureParametersSchema = z.object({
  nodeId: z
    .string()
    .describe(
      'Optional node id to outline; defaults to the current single selection. Useful when auto-layout hints are none/inferred or you need explicit geometry for refactors.'
    )
    .optional(),
  options: z
    .object({
      depth: z
        .number()
        .int()
        .positive()
        .describe('Limit traversal depth; defaults to full tree (subject to safety caps).')
        .optional()
    })
    .optional()
})

export type GetStructureParametersInput = z.input<typeof GetStructureParametersSchema>
export type OutlineNode = {
  id: string
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
  children?: OutlineNode[]
}
export type GetStructureResult = {
  roots: OutlineNode[]
}

// list
export const ListParametersSchema = z.object({
  nodeId: z
    .string()
    .describe(
      'Optional scope node id. List clusters only for the direct children of this node; omit to use current page root children.'
    )
    .optional()
})

export const ListClusterRepresentativeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  width: z.number(),
  height: z.number(),
  topLevelChildren: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.string()
      })
    )
    .optional()
})

export const ListClusterSchema = z.object({
  clusterId: z.string(),
  size: z.number().int().nonnegative(),
  similarity: z
    .object({
      vectorMemberCount: z.number().int().nonnegative(),
      avg: z.number().optional(),
      min: z.number().optional(),
      max: z.number().optional()
    })
    .optional(),
  representativeNodeId: z.string(),
  representative: ListClusterRepresentativeSchema,
  memberNodeIds: z.array(z.string())
})

export const ListResultSchema = z.object({
  scopeNodeId: z.string(),
  totalNodes: z.number().int().nonnegative(),
  clusters: z.array(ListClusterSchema)
})

export type ListParametersInput = z.input<typeof ListParametersSchema>
export type ListResult = z.infer<typeof ListResultSchema>

// read
export const ReadParametersSchema = z.object({
  nodeId: z.string().describe('Target node id to inspect.'),
  options: z
    .object({
      maxDepth: z
        .number()
        .int()
        .positive()
        .describe('Maximum nested depth in this response. Omitted children can be fetched via read.')
        .optional(),
      maxChildren: z
        .number()
        .int()
        .positive()
        .describe('Maximum returned children per node.')
        .optional()
    })
    .optional()
})

export const ReadNodeStyleSchema = z.record(z.string(), z.string())

export const ReadNodeSchema: z.ZodType<ReadNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    visible: z.boolean(),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    styles: ReadNodeStyleSchema,
    text: z.string().optional(),
    children: z.array(ReadNodeSchema).optional(),
    truncated: z
      .object({
        reason: z.enum(['depth', 'children']),
        omittedChildCount: z.number().int().nonnegative(),
        omittedChildNodeIds: z.array(z.string()).optional()
      })
      .optional()
  })
)

export const ReadResultSchema = z.object({
  root: ReadNodeSchema,
  maxDepth: z.number().int().positive(),
  maxChildren: z.number().int().positive(),
  truncatedNodeIds: z.array(z.string())
})

export type ReadParametersInput = z.input<typeof ReadParametersSchema>
export type ReadNode = {
  id: string
  name: string
  type: string
  visible: boolean
  x: number
  y: number
  width: number
  height: number
  styles: Record<string, string>
  text?: string
  children?: ReadNode[]
  truncated?: {
    reason: 'depth' | 'children'
    omittedChildCount: number
    omittedChildNodeIds?: string[]
  }
}
export type ReadResult = z.infer<typeof ReadResultSchema>

// distance
export const DistanceParametersSchema = z.object({
  idA: z.string().describe('First node id to measure.'),
  idB: z.string().describe('Second node id to measure.')
})

export const DistanceResultSchema = z.object({
  idA: z.string(),
  idB: z.string(),
  relationship: z.enum(['a_contains_b', 'b_contains_a', 'separate_or_overlap']),
  horizontal: z.number(),
  vertical: z.number(),
  inside: z
    .object({
      outerId: z.string(),
      innerId: z.string(),
      left: z.number(),
      right: z.number(),
      top: z.number(),
      bottom: z.number()
    })
    .optional()
})

export type DistanceParametersInput = z.input<typeof DistanceParametersSchema>
export type DistanceResult = z.infer<typeof DistanceResultSchema>

// search
export const SearchParametersSchema = z
  .object({
    nodeId: z.string().describe('Node id as query target.').optional(),
    description: z
      .record(z.string(), z.unknown())
      .describe('JSON description of structure/style to search by.')
      .optional(),
    structureOnly: z.boolean().describe('Ignore style, only compare structural fields.').optional(),
    topK: z.number().int().positive().max(50).optional()
  })
  .refine((value) => !!value.nodeId || !!value.description, {
    message: 'nodeId or description is required.'
  })

export const SearchMatchSchema = z.object({
  nodeId: z.string(),
  name: z.string(),
  type: z.string(),
  similarity: z.number(),
  docKey: z.string()
})

export const SearchResultSchema = z.object({
  queryType: z.enum(['node', 'description']),
  matches: z.array(SearchMatchSchema),
  totalCandidates: z.number().int().nonnegative()
})

export type SearchParametersInput = z.input<typeof SearchParametersSchema>
export type SearchResult = z.infer<typeof SearchResultSchema>

// diff
export const DiffParametersSchema = z.object({
  idA: z.string().describe('First node id for comparison.'),
  idB: z.string().describe('Second node id for comparison.')
})

export const DiffStyleChangeSchema = z.object({
  key: z.string(),
  a: z.string().optional(),
  b: z.string().optional()
})

export const DiffResultSchema = z.object({
  idA: z.string(),
  idB: z.string(),
  size: z.object({
    a: z.object({ width: z.number(), height: z.number() }),
    b: z.object({ width: z.number(), height: z.number() }),
    widthDelta: z.number(),
    heightDelta: z.number()
  }),
  nodeCount: z.object({
    a: z.number().int().nonnegative(),
    b: z.number().int().nonnegative(),
    delta: z.number().int()
  }),
  style: z.object({
    added: z.array(z.string()),
    removed: z.array(z.string()),
    changed: z.array(DiffStyleChangeSchema)
  })
})

export type DiffParametersInput = z.input<typeof DiffParametersSchema>
export type DiffResult = z.infer<typeof DiffResultSchema>

// get_assets (hub only)
export const GetAssetsParametersSchema = z.object({
  hashes: z
    .array(z.string().regex(MCP_HASH_PATTERN))
    .min(1)
    .describe(
      'Asset hashes returned from get_code (or other tools) to download/resolve exact bytes for rasterized images or SVGs before routing through your asset pipeline.'
    )
})

export const GetAssetsResultSchema = z.object({
  assets: z.array(AssetDescriptorSchema),
  missing: z.array(z.string().min(1))
})

export type GetAssetsParametersInput = z.input<typeof GetAssetsParametersSchema>
export type GetAssetsResult = z.infer<typeof GetAssetsResultSchema>

export type AssetDescriptor = z.infer<typeof AssetDescriptorSchema>

export type ToolResultMap = {
  list: ListResult
  read: ReadResult
  distance: DistanceResult
  search: SearchResult
  diff: DiffResult
  get_code: GetCodeResult
  get_token_defs: GetTokenDefsResult
  get_screenshot: GetScreenshotResult
  get_structure: GetStructureResult
  get_assets: GetAssetsResult
}

export type ToolName = keyof ToolResultMap

export type ToolSchema<Name extends ToolName> = {
  name: Name
  description: string
  parameters: ZodType
  target: 'extension' | 'hub'
  outputSchema?: ZodType
  exposed?: boolean
}
