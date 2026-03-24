import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import { traverseDom } from '../utils/traverse';

const json = JSON.parse(
  fs.readFileSync('/Users/chiyao/Desktop/FigSense/demo/test.json', 'utf8')
);

export const getDomHierarchy = async (request: CallToolRequest) => {
  const title = String(request.params.arguments?.title);
  const content = String(request.params.arguments?.content);
  if (!title || !content) {
    throw new Error('Title and content are required');
  }

  const domTree = traverseDom(json, (node) =>
    node.type === 'TEXT'
      ? {
          id: node.id,
          type: node.type,
          children: [],
          content: node.characters,
        }
      : { id: node.id, type: node.type, children: [] }
  );

  // 先返回mock数据
  return {
    content: [{ type: 'text', text: JSON.stringify(domTree) }],
  };
};
