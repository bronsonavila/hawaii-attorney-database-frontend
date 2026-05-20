import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: 'dist-standalone',
    rollupOptions: {
      input: fileURLToPath(new URL('./standalone.html', import.meta.url))
    }
  },
  define: {
    'import.meta.env.VITE_STANDALONE': JSON.stringify('true')
  },
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  publicDir: false,
  root: '.'
})
