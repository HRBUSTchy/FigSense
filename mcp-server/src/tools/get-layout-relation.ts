import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';

export const getLayoutRelation = async (request: CallToolRequest) => {
  const id = String(request.params.arguments?.id);
  if (!id) {
    throw new Error('ID is required');
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
