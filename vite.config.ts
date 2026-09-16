import { randomUUID } from 'node:crypto'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const authBootId = randomUUID()

export default defineConfig({
  plugins: [vue()],
  define: {
    __VMRB_AUTH_BOOT_ID__: JSON.stringify(authBootId),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
    proxy: {
      '/api': { target: process.env.VMRB_BACKEND_URL || 'http://127.0.0.1:8080', changeOrigin: true },
      '/health': { target: process.env.VMRB_BACKEND_URL || 'http://127.0.0.1:8080', changeOrigin: true },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    proxy: {
      '/api': { target: process.env.VMRB_BACKEND_URL || 'http://127.0.0.1:8080', changeOrigin: true },
      '/health': { target: process.env.VMRB_BACKEND_URL || 'http://127.0.0.1:8080', changeOrigin: true },
    },
  },
  worker: {
    format: 'es',
  },
})
