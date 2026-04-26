import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://www.animeparadise.vip',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://www.animeparadise.vip/ws/',
        ws: true,
        changeOrigin: true,
      },
      '/wss': {
        target: 'wss://www.animeparadise.vip/ws/',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})