import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';

export const getSpacing = async (request: CallToolRequest) => {
  const ids = String(request.params.arguments?.ids);
  if (!ids) {
    throw new Error('IDs are required');
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
