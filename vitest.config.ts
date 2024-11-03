import { defineConfig, ViteUserConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()] as ViteUserConfig['plugins'],
  test: {
    coverage: {
      exclude: ['node_modules/', 'src/setupTests.ts', '**/__tests__/**'],
      reporter: ['text', 'json', 'html']
    },
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts']
  }
})
