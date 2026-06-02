import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
  },
  resolve: {
    alias: {
      '@brain-master/shared': path.resolve(__dirname, '../../packages/shared'),
      '@brain-master/validators': path.resolve(__dirname, '../../packages/validators/index.ts'),
    },
  },
})
