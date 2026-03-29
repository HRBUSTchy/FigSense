import { log } from '../shared'
import { cleanupForExtension, register } from '../utils/request'
import { getMcpServerConfig } from '../config'
import { TEMPAD_MCP_ERROR_CODES } from '@tempad-dev/shared'
import { ToolCallMessage } from '@tempad-dev/shared'
import type { ZodType } from 'zod'

const { autoActivateGraceMs, toolTimeoutMs } = getMcpServerConfig()

export interface ExtensionConnection {
  id: string
  ws: any
  active: boolean
}

export interface ExtensionStore {
  list(): ExtensionConnection[]
  get(id: string): ExtensionConnection | undefined
  getActive(): ExtensionConnection | undefined
  getActiveId(): string | null
  add(connection: ExtensionConnection): void
  remove(id: string): void
  setActive(targetId: string | null): void
  broadcast(message: unknown): void
  broadcastState(assetServerUrl?: string): void
  clearAutoActivateTimer(): void
  scheduleAutoActivate(): void
  setAssetHttpServer(server: { getBaseUrl: () => string } | null): void
  getSelectedPort(): number
  setSelectedPort(port: number): void
  sendToolCall<Result>(toolName: string, args: unknown, schema: ZodType): Promise<Result>
}

type TimeoutHandle = ReturnType<typeof setTimeout>

function createExtensionStoreInstance(): ExtensionStore {
  const extensions: ExtensionConnection[] = []
  let autoActivateTimer: TimeoutHandle | null = null
  let assetHttpServer: { getBaseUrl: () => string } | null = null
  let selectedWsPort = 0

  function list(): ExtensionConnection[] {
    return [...extensions]
  }

  function get(id: string): ExtensionConnection | undefined {
    return extensions.find((e) => e.id === id)
  }

  function getActive(): ExtensionConnection | undefined {
    return extensions.find((e) => e.active)
  }

  function getActiveId(): string | null {
    return extensions.find((e) => e.active)?.id ?? null
  }

  function add(connection: ExtensionConnection): void {
    extensions.push(connection)
    log.info({ id: connection.id }, `Extension connected. Total: ${extensions.length}`)
  }

  function remove(id: string): void {
    const index = extensions.findIndex((e) => e.id === id)
    if (index > -1) {
      const ext = extensions[index]
      extensions.splice(index, 1)
      log.info({ id }, `Extension disconnected. Remaining: ${extensions.length}`)

      cleanupForExtension(id)

      if (ext.active) {
        log.warn({ id }, 'Active extension disconnected.')
        setActive(null)
      }

      broadcastState()
      scheduleAutoActivate()
    }
  }

  function setActive(targetId: string | null): void {
    extensions.forEach((e) => {
      e.active = targetId !== null && e.id === targetId
    })
  }

  function broadcast(message: unknown): void {
    const messageStr = JSON.stringify(message)
    extensions.forEach((ext) => ext.ws.send(messageStr))
  }

  function broadcastState(assetServerUrl?: string): void {
    const activeId = getActiveId()
    const message = {
      type: 'state',
      activeId,
      count: extensions.length,
      port: selectedWsPort,
      assetServerUrl: assetServerUrl ?? assetHttpServer?.getBaseUrl() ?? ''
    }
    broadcast(message)
    log.debug({ activeId, count: extensions.length }, 'Broadcasted state.')
  }

  function clearAutoActivateTimer(): void {
    if (autoActivateTimer) {
      clearTimeout(autoActivateTimer)
      autoActivateTimer = null
    }
  }

  function scheduleAutoActivate(): void {
    clearAutoActivateTimer()

    if (extensions.length !== 1 || getActiveId()) {
      return
    }

    const target = extensions[0]
    autoActivateTimer = setTimeout(() => {
      autoActivateTimer = null
      if (extensions.length === 1 && !getActiveId()) {
        setActive(target.id)
        log.info({ id: target.id }, 'Auto-activated sole extension after grace period.')
        broadcastState()
      }
    }, autoActivateGraceMs)
    if (typeof autoActivateTimer.unref === 'function') {
      autoActivateTimer.unref()
    }
  }

  function setAssetHttpServer(server: { getBaseUrl: () => string } | null): void {
    assetHttpServer = server
  }

  function getSelectedPort(): number {
    return selectedWsPort
  }

  function setSelectedPort(port: number): void {
    selectedWsPort = port
  }

  async function sendToolCall<Result>(toolName: string, args: unknown, schema: ZodType): Promise<Result> {
    let requestId: string | undefined
    try {
      const parsedArgs = schema.parse(args)
      const activeExt = getActive()
      if (!activeExt) {
        const err = new Error('No active TemPad Dev extension available.') as Error & { code: typeof TEMPAD_MCP_ERROR_CODES.NO_ACTIVE_EXTENSION }
        err.code = TEMPAD_MCP_ERROR_CODES.NO_ACTIVE_EXTENSION
        throw err
      }

      const registration = register<Result>(activeExt.id, toolTimeoutMs)
      requestId = registration.requestId

      const message: ToolCallMessage = {
        type: 'toolCall',
        id: registration.requestId,
        payload: {
          name: toolName,
          args: parsedArgs
        }
      }
      activeExt.ws.send(JSON.stringify(message))
      log.info(
        { tool: toolName, req: registration.requestId, extId: activeExt.id },
        'Forwarded tool call.'
      )

      const payload = await registration.promise
      return payload as Result
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error))
      log.error(
        {
          tool: toolName,
          req: requestId,
          code: 'code' in normalized ? (normalized as any).code : undefined,
          message: normalized.message
        },
        'Tool invocation failed.'
      )
      throw normalized
    }
  }

  return {
    list,
    get,
    getActive,
    getActiveId,
    add,
    remove,
    setActive,
    broadcast,
    broadcastState,
    clearAutoActivateTimer,
    scheduleAutoActivate,
    setAssetHttpServer,
    getSelectedPort,
    setSelectedPort,
    sendToolCall
  }
}



const extensionStore = createExtensionStoreInstance()

export { extensionStore, createExtensionStoreInstance as createExtensionStore }