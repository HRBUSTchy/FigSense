import type { CallToolRequest } from '@modelcontextprotocol/sdk/types.js'

import { ListParametersSchema, ListResultSchema } from '@tempad-dev/shared'

import { extensionStore } from '../stores'

export const list = async (request: CallToolRequest) => {
  const args = ListParametersSchema.parse(request.params.arguments ?? {})
  const payload = await extensionStore.sendToolCall('list', args, ListParametersSchema)
  const result = ListResultSchema.parse(payload)

  return {
    content: [{ type: 'text', text: JSON.stringify(result) }]
  }
}
