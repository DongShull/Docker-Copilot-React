import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/manager/',
  plugins: [react({
    jsxRuntime: 'automatic'
  })],
  server: {
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 12713,
    host: true
  },
  build: {
    // 确保静态资源被正确复制
    assetsDir: 'assets'
  }
})
