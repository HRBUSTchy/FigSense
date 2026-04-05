import type { CallToolRequest } from '@modelcontextprotocol/sdk/types.js'

import { DiffParametersSchema, DiffResultSchema } from '@tempad-dev/shared'

import { extensionStore } from '../stores'

export const diff = async (request: CallToolRequest) => {
  const args = DiffParametersSchema.parse(request.params.arguments ?? {})
  const payload = await extensionStore.sendToolCall('diff', args, DiffParametersSchema)
  const result = DiffResultSchema.parse(payload)

  return {
    content: [{ type: 'text', text: JSON.stringify(result) }]
  }
}
