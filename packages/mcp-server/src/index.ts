#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { cac } from 'cac';
import { registerTools } from './tools/index';

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
  const transport = new StdioServerTransport();
  registerTools(mcpServer.server);
  await mcpServer.server.connect(transport);
});

cli.help();

cli.parse();
