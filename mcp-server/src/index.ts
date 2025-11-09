#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { cac } from 'cac';
import { registerTools } from './tools/index.js';

const server = new Server(
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
  registerTools(server);
  await server.connect(transport);
});

cli.help();

cli.parse();
