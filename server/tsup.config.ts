import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/infra/http/server.ts'],
  format: 'esm',
  outDir: 'dist',
  clean: true,
  skipNodeModulesBundle: true,
})
