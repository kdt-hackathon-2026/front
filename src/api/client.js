import axios from 'axios'

// Spring Legacy 컨트롤러가 서비스되는 컨텍스트 경로에 맞춰 baseURL을 조정하세요.
// 개발 모드에서는 vite.config.js의 server.proxy 설정으로 /api 가 백엔드로 프록시됩니다.
// 운영 빌드에서 별도 도메인/컨텍스트 경로를 쓴다면 VITE_API_BASE_URL 로 지정하세요.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true, // Spring Legacy 세션(JSESSIONID) 인증을 사용하는 경우
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    // 서버 공통 에러 포맷: { code, message } 을 그대로 던져서 화면단에서 처리
    const payload = err?.response?.data || { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했어요.' }
    return Promise.reject(payload)
  }
)

// 백엔드가 아직 준비되지 않은 개발 단계에서는 목데이터로 동작하도록 스위치 제공
export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || 'true') === 'true'

export function mockDelay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
