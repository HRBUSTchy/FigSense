import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

import { diff } from './diff'
import { distance } from './distance'
import { list } from './list'
import { read } from './read'
import { search } from './search'

type ToolList = ReadonlyArray<{
  name: string
  description: string
  inputSchema: {
    type: string
    properties?: Record<string, unknown>
    required?: readonly string[]
  }
}>

type CalcToolNames<T extends Readonly<ToolList>> = T[number]['name']

export const toolList = [
  {
    name: 'list',
    description:
      '按相似度聚类列出目标节点（或当前页）内的设计稿节点，并返回每类代表节点的顶层结构。',
    inputSchema: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '可选，聚类范围根节点 id；不传则扫描当前页面。'
        }
      },
      required: []
    }
  },
  {
    name: 'read',
    description:
      '读取指定节点详细结构与无定位样式。深层/宽层会自动截断并返回被截断子节点 id，支持分步读取。',
    inputSchema: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '必填，目标节点 id。'
        },
        options: {
          type: 'object',
          properties: {
            maxDepth: {
              type: 'number',
              description: '可选，单次返回的最大嵌套深度。'
            },
            maxChildren: {
              type: 'number',
              description: '可选，单个节点单次返回的最大子节点数。'
            }
          },
          required: []
        }
      },
      required: ['nodeId']
    }
  },
  {
    name: 'distance',
    description:
      '计算两个节点的准确距离。包含关系返回内外边距；非包含关系返回水平/竖直间距。',
    inputSchema: {
      type: 'object',
      properties: {
        idA: {
          type: 'string',
          description: '必填，测量节点 A id。'
        },
        idB: {
          type: 'string',
          description: '必填，测量节点 B id。'
        }
      },
      required: ['idA', 'idB']
    }
  },
  {
    name: 'search',
    description:
      '按节点 id 或样式结构描述搜索相近设计稿节点。支持结构优先（忽略样式）检索。',
    inputSchema: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '可选，使用该节点作为查询目标。'
        },
        description: {
          type: 'object',
          description: '可选，描述样式/结构的 JSON。'
        },
        structureOnly: {
          type: 'boolean',
          description: '可选，true 时仅按结构相似度检索。'
        },
        topK: {
          type: 'number',
          description: '可选，返回结果数量（1-50）。'
        }
      },
      required: []
    }
  },
  {
    name: 'diff',
    description:
      '对比两个节点在样式、宽高、可见节点数量上的差异，快速识别状态差别。',
    inputSchema: {
      type: 'object',
      properties: {
        idA: {
          type: 'string',
          description: '必填，对比节点 A id。'
        },
        idB: {
          type: 'string',
          description: '必填，对比节点 B id。'
        }
      },
      required: ['idA', 'idB']
    }
  }
] as const

export type ToolNames = CalcToolNames<typeof toolList>

export const registerTools = (server: Server) => {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: toolList
    }
  })

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name as ToolNames
    switch (toolName) {
      case 'list':
        return list(request)
      case 'read':
        return read(request)
      case 'distance':
        return distance(request)
      case 'search':
        return search(request)
      case 'diff':
        return diff(request)
      default:
        throw new Error(`Unknown tool: ${toolName}`)
    }
  })
}
