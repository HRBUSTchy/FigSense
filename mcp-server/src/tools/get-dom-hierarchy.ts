import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';

export const getDomHierarchy = async (request: CallToolRequest) => {
  const title = String(request.params.arguments?.title);
  const content = String(request.params.arguments?.content);
  if (!title || !content) {
    throw new Error('Title and content are required');
  }
  // 先返回mock数据
  return {
    content: [
      {
        type: 'text',
        text: `{
					"type":"container",
					"id":"123",
					"children":[
						{
							"type":"text",
							"id":"456",
							"text":"Hello"
						},
						{
							"type":"container",
							"id":"789",
							"children":[
								{
									"type":"text",
									"id":"101112",
									"text":"World"
								}
							]
						}
					]
				}`,
      },
    ],
  };
};
