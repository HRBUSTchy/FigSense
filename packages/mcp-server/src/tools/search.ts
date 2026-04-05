import type { CallToolRequest } from '@modelcontextprotocol/sdk/types.js'

import { SearchParametersSchema, SearchResultSchema } from '@tempad-dev/shared'

import { extensionStore } from '../stores'

export const search = async (request: CallToolRequest) => {
  const args = SearchParametersSchema.parse(request.params.arguments ?? {})
  const payload = await extensionStore.sendToolCall('search', args, SearchParametersSchema)
  const result = SearchResultSchema.parse(payload)

  return {
    content: [{ type: 'text', text: JSON.stringify(result) }]
  }
}
