import { apiClient, USE_MOCK, mockDelay } from './client'
import { ACCOUNTS } from '@/assets/data/accounts'
import { BANKS } from '@/assets/data/banks'
import { SCENARIOS } from '@/assets/data/scenarios'
import { lookupReceiverByAccount } from '@/assets/data/receivers'

/**
 * 실제 Spring Legacy 컨트롤러 매핑 예시 (기능명세서 6.x 기준)
 *  GET    /api/banks
 *  GET    /api/practice/accounts
 *  GET    /api/practice/scenarios
 *  POST   /api/practice/sessions                 { mode, scenarioId }              -> 6.30 세션 생성
 *  POST   /api/practice/sessions/{id}/receiver    { accountNumber, bankCode }       -> 6.70 가상 수취인 조회
 *  POST   /api/practice/sessions/{id}/complete    { requestId, amount, ... }        -> 6.18/6.19 모의 이체 처리(멱등)
 *  GET    /api/practice/sessions/{id}
 */

export async function fetchBanks() {
  if (USE_MOCK) {
    await mockDelay(150)
    return BANKS
  }
  return apiClient.get('/banks')
}

export async function fetchAccounts() {
  if (USE_MOCK) {
    await mockDelay(150)
    return ACCOUNTS
  }
  return apiClient.get('/practice/accounts')
}

export async function fetchScenarios() {
  if (USE_MOCK) {
    await mockDelay(150)
    return SCENARIOS
  }
  return apiClient.get('/practice/scenarios')
}

export async function createPracticeSession({ mode, scenarioId }) {
  if (USE_MOCK) {
    await mockDelay(200)
    return { sessionId: `sess_${Date.now()}`, mode, scenarioId, status: 'IN_PROGRESS' }
  }
  return apiClient.post('/practice/sessions', { mode, scenarioId })
}

// 6.70 연습용 수취인 조회 - 가상 DB만 사용, 실제 금융기관 API 미호출
export async function lookupReceiver({ sessionId, accountNumber, bankCode }) {
  if (USE_MOCK) {
    await mockDelay(400)
    const name = lookupReceiverByAccount(accountNumber)
    if (!name) {
      return { matched: false, name: null, reason: 'NOT_FOUND' }
    }
    return { matched: true, name, bankCode }
  }
  return apiClient.post(`/practice/sessions/${sessionId}/receiver`, { accountNumber, bankCode })
}

// 6.18/6.19 모의 이체 처리 - requestId(멱등키)로 중복 처리 방지
export async function completePracticeTransfer({
  sessionId,
  requestId,
  withdrawAccountId,
  receiverBankCode,
  accountNumber,
  receiverName,
  amount
}) {
  if (USE_MOCK) {
    await mockDelay(700)
    return {
      status: 'COMPLETED',
      requestId,
      sessionId,
      result: {
        withdrawAccountId,
        receiverBankCode,
        accountNumber,
        receiverName,
        amount
      },
      completedAt: new Date().toISOString(),
      isRealTransfer: false // 실제 송금이 아닌 교육용 처리임을 응답에도 명시
    }
  }
  return apiClient.post(`/practice/sessions/${sessionId}/complete`, {
    requestId,
    withdrawAccountId,
    receiverBankCode,
    accountNumber,
    receiverName,
    amount
  })
}

// 9.10 실습 기록 저장 (완료/중단/오류 요약)
export async function saveAttemptLog(logPayload) {
  if (USE_MOCK) {
    await mockDelay(150)
    // 개발 단계에서는 콘솔로만 확인
    console.info('[mock] saveAttemptLog', logPayload)
    return { saved: true }
  }
  return apiClient.post('/practice/logs', logPayload)
}
