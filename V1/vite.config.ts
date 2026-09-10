import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  cacheDir: 'node_modules/.vite-interaction-v2',
  plugins: [vue()],
  optimizeDeps: {
    exclude: ['@cornerstonejs/dicom-image-loader'],
    include: [
      'dicom-parser',
      '@cornerstonejs/dicom-image-loader > @cornerstonejs/codec-libjpeg-turbo-8bit/decodewasmjs',
      '@cornerstonejs/dicom-image-loader > @cornerstonejs/codec-charls/decodewasmjs',
      '@cornerstonejs/dicom-image-loader > @cornerstonejs/codec-openjpeg/decodewasmjs',
      '@cornerstonejs/dicom-image-loader > @cornerstonejs/codec-openjph/wasmjs',
    ],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      events: 'events/',
    },
  },
  server: {
    host: '0.0.0.0',
    port: 4173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  worker: {
    format: 'es',
  },
  build: {
    emptyOutDir: false,
  },
})
