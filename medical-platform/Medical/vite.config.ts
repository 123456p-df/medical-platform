import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    exclude: ['@cornerstonejs/dicom-image-loader'],
    include: ['dicom-parser',
      '@cornerstonejs/dicom-image-loader > @cornerstonejs/codec-libjpeg-turbo-8bit/decodewasmjs',
      '@cornerstonejs/dicom-image-loader > @cornerstonejs/codec-charls/decodewasmjs',
      '@cornerstonejs/dicom-image-loader > @cornerstonejs/codec-openjpeg/decodewasmjs',
      '@cornerstonejs/dicom-image-loader > @cornerstonejs/codec-openjph/wasmjs'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      events: 'events/',
    },
  },
  server: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
    proxy: {
      '/api': { target: process.env.VMRB_BACKEND_URL || 'http://127.0.0.1:8000', changeOrigin: true },
      '/health': { target: process.env.VMRB_BACKEND_URL || 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
  worker: {
    format: 'es',
  },
})
