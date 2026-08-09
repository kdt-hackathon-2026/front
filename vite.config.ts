import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages 프로젝트 사이트 주소:
// https://kdt-hackathon-2026.github.io/front/
// 다른 경로가 필요한 환경에서는 VITE_BASE_PATH로 덮어쓸 수 있습니다.
const BASE_PATH = process.env.VITE_BASE_PATH || '/front/'

export default defineConfig({
  base: BASE_PATH,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      // 개발 중에는 Spring Legacy 서버(예: 8080)로 API 프록시
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
})
