import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Spring Legacy(WAR) 프로젝트에 정적 빌드 산출물을 그대로 복사해 넣는 방식을 가정합니다.
// 예) 빌드 후 dist/ 전체를 /src/main/webapp/hangeoleum/ 로 복사하고
//     서버 컨텍스트가 /hangeoleum/ 아래에서 서비스한다면 BASE_PATH=/hangeoleum/ 로 빌드하세요.
//     예: VITE_BASE_PATH=/hangeoleum/ npm run build
const BASE_PATH = process.env.VITE_BASE_PATH || '/hangeoleum/'

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
