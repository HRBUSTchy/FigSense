import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { list } from './list';
import { getSpacing } from './get_spacing';
import { getNonLayoutStyles } from './get-non-layout-styles';
import { getLayoutRelation } from './get-layout-relation';

import z from 'zod';

type ToolList = ReadonlyArray<{
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}>;

type CalcToolNames<T extends Readonly<ToolList>> = T[number]['name'];

export const toolList = [
  {
    name: 'list',
    description:
      'List figma elements structured by node ID.',
    inputSchema: {
      type: 'object',
      properties: {
				// 节点id
				id: {
					type: 'string',
					description: 'The ID of the element to list, empty string means list top level elements',
					default: '',
				},
				// 是否递归列表子元素
				isRecursive: {
					type: 'boolean',
					description: 'Whether to recursively list child elements',
					default: true,
				},
			},
      required: [],
    },
  },
  {
    name: 'get_non_layout_styles',
    description:
      'Get the non-layout styles of the element and its optional child elements by node ID, which is used to restore the element styles in the design draft.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the element to get styles',
        },
        isRecursive: {
          type: 'boolean',
          description: 'Whether to recursively get styles of child elements',
          default: true,
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_layout_relation',
    description:
      'Get the Bounding Box of a child element of the specified ID node, positioned relative to the top-left corner of that node. This data can be used for organizing well-structured flow layouts.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the element to get layout relation',
        },
        isRecursive: {
          type: 'boolean',
          description:
            'Whether to recursively get layout relation of child elements (relative to the top-left corner of the specified ID node), pass true when only a few child elements are needed',
          default: false,
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_spacing',
    description:
      'Get the layout spacing of elements evenly arranged in the horizontal or vertical direction.',
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          description:
            'The IDs of the elements to get equal spacing, organized in arrangement order',
          items: {
            type: 'string',
          },
        },
        direction: {
          type: 'string',
          description: 'The direction of equal spacing, horizontal or vertical',
        },
      },
      required: ['ids', 'direction'],
    },
  },
];

export type ToolNames = CalcToolNames<typeof toolList>;

export const registerTools = (server: Server) => {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: toolList,
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = <ToolNames>request.params.name;
    switch (toolName) {
      case 'list': {
        return await list(request);
      }
      case 'get_spacing': {
        return await getSpacing(request);
      }
      case 'get_non_layout_styles': {
        return await getNonLayoutStyles(request);
      }
      case 'get_layout_relation': {
        return await getLayoutRelation(request);
      }

      default:
        throw new Error('Unknown tool');
    }
  });
};
