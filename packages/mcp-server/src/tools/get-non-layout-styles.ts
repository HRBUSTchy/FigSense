import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import { traverseDom } from '../utils/traverse';

const json = JSON.parse(
  fs.readFileSync('/Users/chiyao/Desktop/FigSense/demo/test.json', 'utf8')
);

export const getNonLayoutStyles = async (request: CallToolRequest) => {
  const id = String(request.params.arguments?.id);
  const isRecursive = Boolean(request.params.arguments?.isRecursive);

  if (!id) {
    throw new Error('ID is required');
  }

  let isFind = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};

  traverseDom(json, (node) => {
    if (node.id === id || (isFind && isRecursive)) {
      isFind = true;
      result[node.id] = node.style;
    }
  });
  // 先返回mock数据
  return {
    content: [{ type: 'text', text: JSON.stringify(result) }],
  };
};
