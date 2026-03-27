#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { cac } from 'cac';
import { registerTools } from './tools/index';
import { log } from './shared';
import { initExtensionWebSocketServer } from './servers';

const mcpServer = new McpServer(
  {
    name: '@figsence/mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

const cli = cac();

cli.command('', 'Run figsence mcp server').action(async () => {
  // 初始化 stdio 传输层
	const transport = new StdioServerTransport();
	// 初始化 extensionSocketServer
	await initExtensionWebSocketServer()
  // 绑定工具
  registerTools(mcpServer.server);
  await mcpServer.server.connect(transport);
});

cli.help();

cli.parse();

function shutdown(): void {
  log.info('MCP is shutting down...')
  // consumerSessions.forEach((session) => {
  //   session.close().catch((err) => {
  //     log.warn({ err }, 'Failed to close MCP session during shutdown.')
  //   })
  // })
  // consumerSessions.clear()
  // assetStore.flush()
  // assetHttpServer.stop()
  // netServer.close(() => log.info('Net server closed.'))
  // wss?.close(() => log.info('WebSocket server closed.'))
  // cleanupAll()
  // const timer = setTimeout(() => {
  //   log.warn('Shutdown timed out. Forcing exit.')
  //   process.exit(1)
  // }, SHUTDOWN_TIMEOUT)
  // unrefTimer(timer)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
