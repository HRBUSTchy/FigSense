

import { WebSocketServer } from 'ws'
import { getMcpServerConfig } from '../config';
import { log } from '../shard';

const { wsPortCandidates, maxPayloadBytes } =
  getMcpServerConfig()

export async function startWebSocketServer(): Promise<{ wss: WebSocketServer; port: number }> {
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