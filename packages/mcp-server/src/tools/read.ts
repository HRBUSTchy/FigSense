import type { CallToolRequest } from '@modelcontextprotocol/sdk/types.js'

import { ReadParametersSchema, ReadResultSchema } from '@tempad-dev/shared'

import { extensionStore } from '../stores'

export const read = async (request: CallToolRequest) => {
  const args = ReadParametersSchema.parse(request.params.arguments ?? {})
  const payload = await extensionStore.sendToolCall('read', args, ReadParametersSchema)
  const result = ReadResultSchema.parse(payload)

  return {
    content: [{ type: 'text', text: JSON.stringify(result) }]
  }
}
