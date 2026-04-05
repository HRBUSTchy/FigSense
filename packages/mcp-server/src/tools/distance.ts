import type { CallToolRequest } from '@modelcontextprotocol/sdk/types.js'

import { DistanceParametersSchema, DistanceResultSchema } from '@tempad-dev/shared'

import { extensionStore } from '../stores'

export const distance = async (request: CallToolRequest) => {
  const args = DistanceParametersSchema.parse(request.params.arguments ?? {})
  const payload = await extensionStore.sendToolCall('distance', args, DistanceParametersSchema)
  const result = DistanceResultSchema.parse(payload)

  return {
    content: [{ type: 'text', text: JSON.stringify(result) }]
  }
}
