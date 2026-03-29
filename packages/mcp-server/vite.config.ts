import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'node18',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
      formats: ['es']
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [
        /^node:/,
        /^(events|stream|util|buffer|crypto|net|tls|http|https|zlib|fs|path|os|url|querystring|string_decoder|readline|cluster|child_process|worker_threads|dgram|dns|assert|process|perf_hooks|timers|worker_threads|v8|vm|module|inspector|async_hooks|trace_events|repl|tty|constants|punycode|domain|sys|console|readline)$/,
        /^@modelcontextprotocol\/sdk/,
        /^@tempad-dev\/shared/,
        'pino',
        'ws',
        'proper-lockfile',
        'nanoid',
        'zod',
        'cac'
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
});