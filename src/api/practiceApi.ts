import { apiClient, USE_MOCK, mockDelay } from './client'
import { ACCOUNTS, getAccountById } from '@/assets/data/accounts'
import { BANKS, getBankByCode } from '@/assets/data/banks'
import { SCENARIOS, getScenarioById } from '@/assets/data/scenarios'
import { lookupReceiver, maskAccountNumber } from '@/assets/data/receivers'
import type {
  AuthenticationRequest,
  AuthenticationResult,
  Bank,
  ConfirmRecipientRequest,
  ConfirmRecipientResult,
  HelpLevel,
  PracticeAccount,
  PracticeResult,
  PracticeReview,
  RestartRequest,
  RestartResult,
  ResumablePracticeItem,
  Scenario,
  ScenarioCategory,
  ScenarioDifficulty,
  SaveProgressRequest,
  SaveProgressResult,
  SelectSourceAccountResult,
  StartPracticeRequest,
  StartPracticeResult,
  TransferRequest,
  TransferResult,
  ValidateAmountResult,
  ValidateRecipientRequest,
  ValidateRecipientResult
} from '@/types'

/**
 * 이체연습 API - 기능명세서(API_명세서_-_시트1.pdf)의 transfer practice 섹션 매핑
 * 목데이터 모드에서는 practiceId별 진행 상태를 메모리에 들고 있다가 각 단계 호출에 맞춰 갱신합니다.
 */

interface MockPracticeState {
  practiceId: number
  scenario: Scenario
  bankCode: string
  helpLevel: HelpLevel
  currentStep: StartPracticeResult['currentStep']
  sourceAccountId: string | null
  recipientAccountNumber: string
  recipientConfirmed: boolean
  amount: number
  startedAt: number
  helpUsageCount: number
}

const mockPractices = new Map<number, MockPracticeState>()
let mockPracticeSeq = 100

// GET /api/practices/scenarios
export async function fetchScenarios(params?: {
  difficulty?: ScenarioDifficulty
  category?: ScenarioCategory
}): Promise<Scenario[]> {
  if (USE_MOCK) {
    await mockDelay(150)
    if (params?.difficulty) {
      return SCENARIOS.filter((s) => s.difficulty === params.difficulty)
    }
    return SCENARIOS
  }
  return apiClient.get('/practices/scenarios', { params }) as unknown as Promise<Scenario[]>
}

// GET /api/practices/banks
export async function fetchBanks(): Promise<Bank[]> {
  if (USE_MOCK) {
    await mockDelay(150)
    return BANKS
  }
  return apiClient.get('/practices/banks') as unknown as Promise<Bank[]>
}

// POST /api/practices
export async function startPractice(body: StartPracticeRequest): Promise<StartPracticeResult> {
  if (USE_MOCK) {
    await mockDelay(250)
    const scenario = getScenarioById(body.scenarioId)
    const practiceId = ++mockPracticeSeq
    mockPractices.set(practiceId, {
      practiceId,
      scenario,
      bankCode: body.bankCode,
      helpLevel: body.helpLevel,
      currentStep: 'SELECT_SOURCE_ACCOUNT',
      sourceAccountId: null,
      recipientAccountNumber: '',
      recipientConfirmed: false,
      amount: 0,
      startedAt: Date.now(),
      helpUsageCount: 0
    })
    return {
      practiceId,
      status: 'IN_PROGRESS',
      currentStep: 'SELECT_SOURCE_ACCOUNT',
      mission: {
        recipientName: scenario.recipientName,
        bankCode: scenario.bankCode,
        maskedAccountNumber: scenario.maskedAccountNumber,
        amount: scenario.amount
      },
      isRealTransfer: false
    }
  }
  return apiClient.post('/practices', body) as unknown as Promise<StartPracticeResult>
}

function requireMock(practiceId: number): MockPracticeState {
  const state = mockPractices.get(practiceId)
  if (!state) throw { success: false, message: '연습 세션을 찾을 수 없어요.', errorCode: 'PRACTICE_NOT_FOUND', data: null }
  return state
}

// GET /api/practices/{practiceId}/accounts
export async function fetchPracticeAccounts(practiceId: number): Promise<PracticeAccount[]> {
  if (USE_MOCK) {
    await mockDelay(150)
    requireMock(practiceId)
    return ACCOUNTS
  }
  return apiClient.get(`/practices/${practiceId}/accounts`) as unknown as Promise<PracticeAccount[]>
}

// PATCH /api/practices/{practiceId}/source-account
export async function selectSourceAccount(practiceId: number, accountId: string): Promise<SelectSourceAccountResult> {
  if (USE_MOCK) {
    await mockDelay(200)
    const state = requireMock(practiceId)
    if (!accountId) {
      throw { success: false, message: '연습용 계좌를 선택해 주세요.', errorCode: 'ACCOUNT_NOT_SELECTED', data: null }
    }
    state.sourceAccountId = accountId
    state.currentStep = 'ENTER_RECIPIENT_ACCOUNT'
    return { practiceId, selectedAccountId: accountId, nextStep: 'ENTER_RECIPIENT_ACCOUNT' }
  }
  return apiClient.patch(`/practices/${practiceId}/source-account`, { accountId }) as unknown as Promise<SelectSourceAccountResult>
}

// POST /api/practices/{practiceId}/recipient/validate
export async function validateRecipient(
  practiceId: number,
  body: ValidateRecipientRequest
): Promise<ValidateRecipientResult> {
  if (USE_MOCK) {
    await mockDelay(300)
    requireMock(practiceId)
    const digits = (body.accountNumber || '').replace(/\D/g, '')
    if (digits.length < 10) {
      throw {
        success: false,
        message: '계좌번호 형식이 올바르지 않습니다.',
        errorCode: 'INVALID_ACCOUNT_FORMAT',
        data: null
      }
    }
    return { valid: true, maskedAccountNumber: maskAccountNumber(digits), errorCode: null, guideMessage: '입력한 계좌번호를 확인해 주세요.' }
  }
  return apiClient.post(`/practices/${practiceId}/recipient/validate`, body) as unknown as Promise<ValidateRecipientResult>
}

// POST /api/practices/{practiceId}/recipient/confirm
export async function confirmRecipient(
  practiceId: number,
  body: ConfirmRecipientRequest
): Promise<ConfirmRecipientResult> {
  if (USE_MOCK) {
    await mockDelay(350)
    const state = requireMock(practiceId)
    const name = lookupReceiver(body.bankCode, body.accountNumber)
    if (!name) {
      throw {
        success: false,
        message: '연습 문제의 받는 분과 일치하지 않습니다.',
        errorCode: 'RECIPIENT_MISMATCH',
        data: null
      }
    }
    const bank = getBankByCode(body.bankCode)
    state.recipientAccountNumber = body.accountNumber
    state.recipientConfirmed = true
    state.currentStep = 'ENTER_AMOUNT'
    return {
      recipientName: name,
      bankName: bank?.bankName || body.bankCode,
      maskedAccountNumber: maskAccountNumber(body.accountNumber),
      matchesScenario: name === state.scenario.recipientName,
      confirmationToken: `token-${practiceId}-${Date.now()}`
    }
  }
  return apiClient.post(`/practices/${practiceId}/recipient/confirm`, body) as unknown as Promise<ConfirmRecipientResult>
}

// POST /api/practices/{practiceId}/amount/validate
export async function validateAmount(practiceId: number, amount: number): Promise<ValidateAmountResult> {
  if (USE_MOCK) {
    await mockDelay(200)
    const state = requireMock(practiceId)
    const account = getAccountById(state.sourceAccountId)
    const balance = account?.balance ?? 0
    if (amount <= 0 || amount > balance) {
      throw {
        success: false,
        message: '가상 잔액이 부족합니다.',
        errorCode: 'INSUFFICIENT_VIRTUAL_BALANCE',
        data: null
      }
    }
    state.amount = amount
    state.currentStep = 'FINAL_REVIEW'
    return {
      valid: true,
      amount,
      koreanAmount: amountToKorean(amount),
      virtualBalance: balance,
      remainingBalance: balance - amount,
      errorCode: null
    }
  }
  return apiClient.post(`/practices/${practiceId}/amount/validate`, { amount }) as unknown as Promise<ValidateAmountResult>
}

// GET /api/practices/{practiceId}/review
export async function fetchReview(practiceId: number): Promise<PracticeReview> {
  if (USE_MOCK) {
    await mockDelay(200)
    const state = requireMock(practiceId)
    const account = getAccountById(state.sourceAccountId)
    const bank = getBankByCode(state.bankCode)
    return {
      sourceAccount: {
        accountName: account?.accountName || '',
        maskedAccountNumber: account?.maskedAccountNumber || ''
      },
      recipient: {
        name: state.scenario.recipientName,
        bankName: bank?.bankName || state.bankCode,
        maskedAccountNumber: maskAccountNumber(state.recipientAccountNumber)
      },
      amount: state.amount,
      koreanAmount: amountToKorean(state.amount),
      checks: ['RECIPIENT', 'ACCOUNT', 'AMOUNT'],
      canProceed: false
    }
  }
  return apiClient.get(`/practices/${practiceId}/review`) as unknown as Promise<PracticeReview>
}

// POST /api/practices/{practiceId}/authentication (모의 인증 - 교육용 인증번호, 실제 비밀번호/OTP 아님)
export async function authenticatePractice(
  practiceId: number,
  body: AuthenticationRequest
): Promise<AuthenticationResult> {
  if (USE_MOCK) {
    await mockDelay(300)
    requireMock(practiceId)
    if (body.educationCode !== '123456' || !body.acknowledgedNoRealInfo) {
      throw {
        success: false,
        message: '교육용 인증번호가 일치하지 않습니다.',
        errorCode: 'INVALID_EDUCATION_CODE',
        data: null
      }
    }
    state_setAuthenticated(practiceId)
    return {
      verified: true,
      authToken: `auth-${practiceId}-${Date.now()}`,
      expiresInSeconds: 300,
      warning: '실제 비밀번호나 OTP를 입력하지 마세요.'
    }
  }
  return apiClient.post(`/practices/${practiceId}/authentication`, body) as unknown as Promise<AuthenticationResult>
}

function state_setAuthenticated(practiceId: number) {
  const state = mockPractices.get(practiceId)
  if (state) state.currentStep = 'AUTHENTICATION'
}

// POST /api/practices/{practiceId}/transfer (Idempotency-Key 헤더로 중복 처리 방지)
export async function executeTransfer(
  practiceId: number,
  body: TransferRequest,
  idempotencyKey: string
): Promise<TransferResult> {
  if (USE_MOCK) {
    await mockDelay(600)
    const state = requireMock(practiceId)
    state.currentStep = 'TRANSFER'
    return { transactionId: `PRACTICE-TX-${practiceId}`, status: 'PROCESSING', isRealTransfer: false }
  }
  return apiClient.post(`/practices/${practiceId}/transfer`, body, {
    headers: { 'Idempotency-Key': idempotencyKey }
  }) as unknown as Promise<TransferResult>
}

// GET /api/practices/{practiceId}/result
export async function fetchPracticeResult(practiceId: number): Promise<PracticeResult> {
  if (USE_MOCK) {
    await mockDelay(300)
    const state = requireMock(practiceId)
    const bank = getBankByCode(state.bankCode)
    return {
      practiceId,
      status: 'COMPLETED',
      isRealTransfer: false,
      summary: {
        bankName: bank?.bankName || state.bankCode,
        recipientName: state.scenario.recipientName,
        maskedAccountNumber: maskAccountNumber(state.recipientAccountNumber),
        amount: state.amount,
        timeSpentSeconds: Math.round((Date.now() - state.startedAt) / 1000)
      },
      stepResults: [
        { stepCode: 'ENTER_RECIPIENT_ACCOUNT', result: 'PASS', mistakeCount: 0 },
        { stepCode: 'FINAL_REVIEW', result: 'PASS', mistakeCount: 0 }
      ]
    }
  }
  return apiClient.get(`/practices/${practiceId}/result`) as unknown as Promise<PracticeResult>
}

// PATCH /api/practices/{practiceId}/progress
export async function saveProgress(practiceId: number, body: SaveProgressRequest): Promise<SaveProgressResult> {
  if (USE_MOCK) {
    await mockDelay(150)
    const state = requireMock(practiceId)
    state.currentStep = body.currentStep
    state.helpUsageCount = body.helpUsageCount
    return {
      practiceId,
      currentStep: body.currentStep,
      saved: true,
      resumable: body.saveForResume,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
    }
  }
  return apiClient.patch(`/practices/${practiceId}/progress`, body) as unknown as Promise<SaveProgressResult>
}

// GET /api/practices/resumable
export async function fetchResumablePractices(): Promise<ResumablePracticeItem[]> {
  if (USE_MOCK) {
    await mockDelay(150)
    return []
  }
  return apiClient.get('/practices/resumable') as unknown as Promise<ResumablePracticeItem[]>
}

// POST /api/practices/{practiceId}/restart
export async function restartPractice(practiceId: number, body: RestartRequest): Promise<RestartResult> {
  if (USE_MOCK) {
    await mockDelay(250)
    const state = requireMock(practiceId)
    const newId = ++mockPracticeSeq
    mockPractices.set(newId, {
      ...state,
      practiceId: newId,
      currentStep: 'SELECT_SOURCE_ACCOUNT',
      sourceAccountId: null,
      recipientAccountNumber: '',
      recipientConfirmed: false,
      amount: 0,
      startedAt: Date.now(),
      helpUsageCount: 0
    })
    return {
      previousPracticeId: practiceId,
      newPracticeId: newId,
      scenarioId: state.scenario.scenarioId,
      bankCode: body.bankCode,
      currentStep: 'SELECT_SOURCE_ACCOUNT'
    }
  }
  return apiClient.post(`/practices/${practiceId}/restart`, body) as unknown as Promise<RestartResult>
}

function amountToKorean(n: number): string {
  if (!n) return '0원'
  const man = Math.floor(n / 10000)
  const rest = n % 10000
  let text = ''
  if (man > 0) text += `${man.toLocaleString('ko-KR')}만`
  if (rest > 0) text += `${rest.toLocaleString('ko-KR')}`
  return text.trim() + '원'
}
