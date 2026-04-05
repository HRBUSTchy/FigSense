import type {
  DiffParametersInput,
  DiffResult,
  DistanceParametersInput,
  DistanceResult,
  GetCodeParametersInput,
  GetCodeResult,
  ListParametersInput,
  ListResult,
  ReadParametersInput,
  ReadResult,
  GetScreenshotParametersInput,
  GetScreenshotResult,
  SearchParametersInput,
  SearchResult,
  GetStructureParametersInput,
  GetStructureResult,
  GetTokenDefsParametersInput,
  GetTokenDefsResult
} from '@tempad-dev/shared'

import { TEMPAD_MCP_ERROR_CODES } from '@tempad-dev/shared'

import { selection } from '@/ui/state'

import { createCodedError } from './errors'
import { handleGetCode as runGetCode } from './tools/code'
import { handleDiff as runDiff } from './tools/diff'
import { handleDistance as runDistance } from './tools/distance'
import { handleList as runList } from './tools/list'
import { handleRead as runRead } from './tools/read'
import { handleGetScreenshot as runGetScreenshot } from './tools/screenshot'
import { handleSearch as runSearch } from './tools/search'
import { handleGetStructure as runGetStructure } from './tools/structure'
import { handleGetTokenDefs as runGetTokenDefs } from './tools/token'

function isSceneNode(node: BaseNode | null): node is SceneNode {
  return !!node && 'visible' in node && 'type' in node
}

function resolveSingleNode(nodeId?: string): SceneNode {
  if (nodeId) {
    const node = figma.getNodeById(nodeId)
    if (!isSceneNode(node) || !node.visible) {
      throw createCodedError(
        TEMPAD_MCP_ERROR_CODES.NODE_NOT_VISIBLE,
        'No visible node found for the provided nodeId.'
      )
    }
    return node
  }

  if (selection.value.length !== 1 || !selection.value[0].visible) {
    throw createCodedError(
      TEMPAD_MCP_ERROR_CODES.INVALID_SELECTION,
      'Select exactly one visible node (or provide nodeId) to proceed.'
    )
  }

  return selection.value[0]
}

function resolveVisibleNodeById(nodeId: string): SceneNode {
  const node = figma.getNodeById(nodeId)
  if (!isSceneNode(node) || !node.visible) {
    throw createCodedError(
      TEMPAD_MCP_ERROR_CODES.NODE_NOT_VISIBLE,
      'No visible node found for the provided nodeId.'
    )
  }
  return node
}

async function handleGetCode(args?: GetCodeParametersInput): Promise<GetCodeResult> {
  const node = resolveSingleNode(args?.nodeId)
  const { preferredLang, resolveTokens } = args ?? {}
  return runGetCode([node], preferredLang, resolveTokens)
}

async function handleGetTokenDefs(args?: GetTokenDefsParametersInput): Promise<GetTokenDefsResult> {
  const { names, includeAllModes } = args ?? {}
  if (!names?.length) {
    throw new Error('names is required and must include at least one canonical token name.')
  }
  return runGetTokenDefs(names, includeAllModes)
}

async function handleGetScreenshot(
  args?: GetScreenshotParametersInput
): Promise<GetScreenshotResult> {
  const node = resolveSingleNode(args?.nodeId)
  return runGetScreenshot(node)
}

async function handleGetStructure(args?: GetStructureParametersInput): Promise<GetStructureResult> {
  const { nodeId, options } = args ?? {}
  const root = resolveSingleNode(nodeId)
  const depth = options?.depth
  return runGetStructure([root], depth)
}

async function handleList(args?: ListParametersInput): Promise<ListResult> {
  if (args?.nodeId) {
    const root = resolveVisibleNodeById(args.nodeId)
    return runList(root)
  }
  return runList()
}

async function handleRead(args?: ReadParametersInput): Promise<ReadResult> {
  const nodeId = args?.nodeId
  if (!nodeId) {
    throw new Error('nodeId is required.')
  }
  const root = resolveVisibleNodeById(nodeId)
  return runRead(root, args.options)
}

async function handleDistance(args?: DistanceParametersInput): Promise<DistanceResult> {
  const idA = args?.idA
  const idB = args?.idB
  if (!idA || !idB) {
    throw new Error('idA and idB are required.')
  }
  const nodeA = resolveVisibleNodeById(idA)
  const nodeB = resolveVisibleNodeById(idB)
  return runDistance(nodeA, nodeB)
}

async function handleSearch(args?: SearchParametersInput): Promise<SearchResult> {
  if (!args || (!args.nodeId && !args.description)) {
    throw new Error('nodeId or description is required.')
  }
  return runSearch(args)
}

async function handleDiff(args?: DiffParametersInput): Promise<DiffResult> {
  const idA = args?.idA
  const idB = args?.idB
  if (!idA || !idB) {
    throw new Error('idA and idB are required.')
  }
  const nodeA = resolveVisibleNodeById(idA)
  const nodeB = resolveVisibleNodeById(idB)
  return runDiff(nodeA, nodeB)
}

export type MCPHandlers = {
  list: (args?: ListParametersInput) => Promise<ListResult>
  read: (args?: ReadParametersInput) => Promise<ReadResult>
  distance: (args?: DistanceParametersInput) => Promise<DistanceResult>
  search: (args?: SearchParametersInput) => Promise<SearchResult>
  diff: (args?: DiffParametersInput) => Promise<DiffResult>
  get_code: (args?: GetCodeParametersInput) => Promise<GetCodeResult>
  get_token_defs: (args?: GetTokenDefsParametersInput) => Promise<GetTokenDefsResult>
  get_screenshot: (args?: GetScreenshotParametersInput) => Promise<GetScreenshotResult>
  get_structure: (args?: GetStructureParametersInput) => Promise<GetStructureResult>
}

declare global {
  interface Window {
    tempadTools?: Partial<MCPHandlers>
  }
}

export const MCP_TOOL_HANDLERS: MCPHandlers = {
  list: handleList,
  read: handleRead,
  distance: handleDistance,
  search: handleSearch,
  diff: handleDiff,
  get_code: handleGetCode,
  get_token_defs: handleGetTokenDefs,
  get_screenshot: handleGetScreenshot,
  get_structure: handleGetStructure
}

export type McpToolName = keyof MCPHandlers
export type McpToolArgs<T extends McpToolName> = Parameters<MCPHandlers[T]>[0]

function exposeToolsOnWindow(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.tempadTools = {
    ...(window.tempadTools ?? {}),
    ...MCP_TOOL_HANDLERS
  }
}

exposeToolsOnWindow()
