import { RawData, WebSocketServer } from 'ws'
import { getMcpServerConfig } from '../config';
import { log } from '../shared';
import { nanoid } from 'nanoid';
import { RegisteredMessage, MessageFromExtensionSchema, ToolResultMessage } from '@tempad-dev/shared';
import { resolve, reject, cleanupAll } from '../utils';
import { safeStringify } from '../utils';
import { createAssetHttpServer } from './asset-server';
import { extensionStore } from '../stores/extension-store';

let wss: WebSocketServer | null = null
let port: number | null = null

const SHUTDOWN_TIMEOUT = 2000
const { wsPortCandidates, maxPayloadBytes } =
  getMcpServerConfig()

function unrefTimer(timer: ReturnType<typeof setTimeout>): void {
  if (typeof timer === 'object' && timer !== null) {
    const handle = timer as NodeJS.Timeout
    if (typeof handle.unref === 'function') {
      handle.unref()
    }
  }
}
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

function bindHandler(wss: WebSocketServer) {
  wss.on('error', (err) => {
    log.error({ err }, 'WebSocket server critical error. Exiting.')
    process.exit(1)
  })

  wss.on('connection', (ws) => {
    const ext = { id: String(nanoid()), ws, active: false }
    extensionStore.add(ext)

    const message: RegisteredMessage = { type: 'registered', id: ext.id }
    ws.send(JSON.stringify(message))
    extensionStore.broadcastState()
    extensionStore.scheduleAutoActivate()

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
          extensionStore.setActive(ext.id)
          log.info({ id: ext.id }, 'Extension activated.')
          extensionStore.broadcastState()
          extensionStore.scheduleAutoActivate()
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
      extensionStore.remove(ext.id)
    })
  })
}

export async function initExtensionWebSocketServer(): Promise<{ wss: WebSocketServer; port: number }> {
  const assetHttpServer = createAssetHttpServer()
	await assetHttpServer.start()
	extensionStore.setAssetHttpServer(assetHttpServer)
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
      extensionStore.setSelectedPort(candidate)
      bindHandler(server)
      log.info({ port: candidate }, 'WebSocket server ready.')
			wss = server
			port = candidate
			return { wss, port }
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

function shutdown(): void {
  wss?.close(() => log.info('WebSocket server closed.'))
  cleanupAll()
  const timer = setTimeout(() => {
    log.warn('Shutdown timed out. Forcing exit.')
    process.exit(1)
  }, SHUTDOWN_TIMEOUT)
  unrefTimer(timer)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
