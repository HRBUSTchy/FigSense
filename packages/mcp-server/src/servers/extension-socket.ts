

import { RawData, WebSocketServer } from 'ws'
import { getMcpServerConfig } from '../config';
import { log } from '../shared';
import { nanoid, ZodType } from 'zod';
import { StateMessage, RegisteredMessage, MessageFromExtensionSchema, ToolResultMessage } from '@tempad-dev/shared';
import { resolve, reject } from '../utils';
import { cleanupForExtension, safeStringify } from '../utils';
import { AssetHttpServer } from './asset-server';

const { wsPortCandidates, toolTimeoutMs, maxPayloadBytes, autoActivateGraceMs, assetTtlMs } =
  getMcpServerConfig()
interface ExtensionConnection {
  id: string
  ws: WebSocket
  active: boolean
}

const extensions: ExtensionConnection[] = []
type TimeoutHandle = ReturnType<typeof setTimeout>
let autoActivateTimer: TimeoutHandle | null = null
let selectedWsPort = 0
let assetHttpServer: AssetHttpServer | null = null

function rawDataToBuffer(raw: RawData): Buffer {
  if (typeof raw === 'string') return Buffer.from(raw)
  if (Buffer.isBuffer(raw)) return raw
  if (raw instanceof ArrayBuffer) return Buffer.from(raw)
  return Buffer.concat(raw)
}

function getRecordProperty(record: unknown, key: string): unknown {
  if (!record || typeof record !== 'object') {
    return undefined
  }
  return Reflect.get(record, key)
}

function getActiveId(): string | null {
  return extensions.find((e) => e.active)?.id ?? null
}

function setActive(targetId: string | null): void {
  extensions.forEach((e) => {
    e.active = targetId !== null && e.id === targetId
  })
}

function clearAutoActivateTimer(): void {
  if (autoActivateTimer) {
    clearTimeout(autoActivateTimer)
    autoActivateTimer = null
  }
}

function coerceToolError(error: unknown): Error {
  if (error instanceof Error) return error
  if (typeof error === 'string') return new Error(error)
  const messageValue = getRecordProperty(error, 'message')
  const codeValue = getRecordProperty(error, 'code')
  if (error && typeof error === 'object') {
    const message = typeof messageValue === 'string' ? messageValue : safeStringify(error)
    const err = new Error(message) as Error & { code?: string }
    if (typeof codeValue === 'string') err.code = codeValue
    return err
  }
  return new Error(String(error))
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
}

function broadcastState(): void {
  const activeId = getActiveId()
  const message: StateMessage = {
    type: 'state',
    activeId,
    count: extensions.length,
    port: selectedWsPort,
    assetServerUrl: assetHttpServer?.getBaseUrl() || ''
  }
  extensions.forEach((ext) => ext.ws.send(JSON.stringify(message)))
  log.debug({ activeId, count: extensions.length }, 'Broadcasted state.')
}

function bindHandler (wss: WebSocketServer) {
// Add an error handler to prevent crashes from port conflicts, etc.
wss.on('error', (err) => {
  log.error({ err }, 'WebSocket server critical error. Exiting.')
  process.exit(1)
})

wss.on('connection', (ws) => {
	// @ts-expect-error
  const ext: ExtensionConnection = { id: nanoid(), ws, active: false }
  extensions.push(ext)
  log.info({ id: ext.id }, `Extension connected. Total: ${extensions.length}`)

  const message: RegisteredMessage = { type: 'registered', id: ext.id }
  ws.send(JSON.stringify(message))
  broadcastState()
  scheduleAutoActivate()

  ws.on('message', (raw: RawData, isBinary: boolean) => {
    if (isBinary) {
      log.warn({ extId: ext.id }, 'Unexpected binary message received.')
      return
    }

    const messageBuffer = rawDataToBuffer(raw)

    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(messageBuffer.toString('utf-8'))
    } catch (e: unknown) {
      log.warn({ err: e, extId: ext.id }, 'Failed to parse message.')
      return
    }

    const parseResult = MessageFromExtensionSchema.safeParse(parsedJson)
    if (!parseResult.success) {
      log.warn({ error: parseResult.error.flatten(), extId: ext.id }, 'Invalid message shape.')
      return
    }
    const msg = parseResult.data

    switch (msg.type) {
      case 'activate': {
        setActive(ext.id)
        log.info({ id: ext.id }, 'Extension activated.')
        broadcastState()
        scheduleAutoActivate()
        break
      }
      case 'toolResult': {
        const { id, payload, error } = msg as ToolResultMessage
        if (error) {
          const normalized = coerceToolError(error)
          log.warn(
            {
              toolReq: id,
              extId: ext.id,
              code: getRecordProperty(normalized, 'code'),
              message: normalized.message
            },
            'Received tool error from extension.'
          )
          reject(id, normalized)
        } else {
          resolve(id, payload)
        }
        break
      }
    }
  })

  ws.on('close', () => {
    const index = extensions.findIndex((e) => e.id === ext.id)
    if (index > -1) extensions.splice(index, 1)

    log.info({ id: ext.id }, `Extension disconnected. Remaining: ${extensions.length}`)
    cleanupForExtension(ext.id)

    if (ext.active) {
      log.warn({ id: ext.id }, 'Active extension disconnected.')
      setActive(null)
    }

    broadcastState()
    scheduleAutoActivate()
  })
})

}

export async function startExtensionWebSocketServer(assetHttpServer: AssetHttpServer): Promise<{ wss: WebSocketServer; port: number }> {
	assetHttpServer = assetHttpServer;
	for (const candidate of wsPortCandidates) {
    const server = new WebSocketServer({
      host: '127.0.0.1',
      port: candidate,
      maxPayload: maxPayloadBytes
    })

    try {
      await new Promise<void>((resolve, reject) => {
        const onError = (err: NodeJS.ErrnoException) => {
          server.off('listening', onListening)
          reject(err)
        }
        const onListening = () => {
          server.off('error', onError)
          resolve()
        }
        server.once('error', onError)
        server.once('listening', onListening)
      })
			selectedWsPort = candidate;
			bindHandler(server)
			log.info({ port: selectedWsPort }, 'WebSocket server ready.')
      return { wss: server, port: candidate }
    } catch (err) {
      server.close()
      const errno = err as NodeJS.ErrnoException
      if (errno.code === 'EADDRINUSE') {
        log.warn({ port: candidate }, 'WebSocket port in use, trying next candidate.')
        continue
      }
      log.error({ err: errno, port: candidate }, 'Failed to start WebSocket server.')
      process.exit(1)
    }
  }

  log.error(
    { candidates: wsPortCandidates },
    'Unable to start WebSocket server on any candidate port.'
  )
  process.exit(1)
}
