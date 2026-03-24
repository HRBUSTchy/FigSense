import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import { traverseDom } from '../utils/traverse';

const json = JSON.parse(
  fs.readFileSync('/Users/chiyao/Desktop/FigSense/demo/test.json', 'utf8')
);

export const getLayoutRelation = async (request: CallToolRequest) => {
  const id = String(request.params.arguments?.id);
  if (!id) {
    throw new Error('ID is required');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let targetNode: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};
  traverseDom(json, (node) => {
    if (node.id === id) {
      targetNode = node;
    }
    if (targetNode) {
      result[node.id] = {
        x: node.absoluteRenderBounds.x - targetNode.absoluteRenderBounds.x,
        y: node.absoluteRenderBounds.y - targetNode.absoluteRenderBounds.y,
        width: node.absoluteRenderBounds.width,
        height: node.absoluteRenderBounds.height,
      };
    }
  });

  // 先返回mock数据
  return {
    content: [{ type: 'text', text: JSON.stringify(result) }],
  };
};
