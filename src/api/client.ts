import axios, { type AxiosInstance } from 'axios'
import type { ApiErrorPayload } from '@/types'

// Spring Legacy 컨트롤러가 서비스되는 컨텍스트 경로에 맞춰 baseURL을 조정하세요.
// 개발 모드에서는 vite.config.ts의 server.proxy 설정으로 /api 가 백엔드로 프록시됩니다.
// 운영 빌드에서 별도 도메인/컨텍스트 경로를 쓴다면 VITE_API_BASE_URL 로 지정하세요.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true, // Spring Legacy 세션(JSESSIONID) 인증을 사용하는 경우
  headers: {
    'Content-Type': 'application/json'
  }
})

// 주의: 아래 인터셉터가 res.data를 그대로 반환값으로 바꿔치기하므로,
// 이 apiClient의 get/post 호출부는 AxiosResponse<T>가 아니라 T를 직접 resolve합니다.
// (api/*.ts에서 반환 타입을 명시적으로 캐스팅해 사용하는 이유)
// API 명세서 기준 모든 응답은 { success, message, data } 포장을 쓰므로,
// 여기서 한 번 더 벗겨서 실제 함수들은 data만 다루도록 합니다.
apiClient.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body && typeof body === 'object' && 'data' in body) {
      return body.data
    }
    return body
  },
  (err) => {
    // 서버 공통 에러 포맷: { success:false, message, errorCode, data:null }
    const payload: ApiErrorPayload = err?.response?.data || {
      success: false,
      message: '네트워크 오류가 발생했어요.',
      errorCode: 'NETWORK_ERROR',
      data: null
    }
    return Promise.reject(payload)
  }
)

// 백엔드가 아직 준비되지 않은 개발 단계에서는 목데이터로 동작하도록 스위치 제공
export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || 'true') === 'true'

export function mockDelay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function errorMessage(e: unknown, fallback: string): string {
  const payload = e as Partial<ApiErrorPayload> | undefined
  return payload?.message || fallback
}
