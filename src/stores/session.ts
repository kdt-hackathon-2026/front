import { defineStore } from 'pinia'
import { BANKS } from '@/assets/data/banks'
import type { Bank, BankCode, HelpLevel, PracticeMission, StepCode, UserSettings } from '@/types'

const STORAGE_KEY = 'hangeoleum.settings.v2'
const INTRO_FLOW_VERSION = 'start-consent-v1'

export type PracticeMode = 'together' | 'practice' | null

export interface FlowConfirmed {
  recipient: boolean
  account: boolean
  amount: boolean
}

export interface FlowState {
  mode: PracticeMode
  practiceId: number | null
  scenarioId: number | null
  bankCode: BankCode | null // 이번 실습에서 고른 '받는 분 은행' (선택 즉시가 아니라 다음 화면부터 테마에 반영)
  step: StepCode | null
  mission: PracticeMission | null

  sourceAccountId: string | null
  recipientAccountNumber: string
  recipientName: string | null
  recipientConfirmed: boolean | null
  amount: number
  confirmed: FlowConfirmed
  authToken: string | null
  transactionId: string | null

  helpUsedCount: number
  errorCount: number
  startedAt: number | null
  completedAt: number | null
}

function emptyFlow(): FlowState {
  return {
    mode: null,
    practiceId: null,
    scenarioId: null,
    bankCode: null,
    step: null,
    mission: null,
    sourceAccountId: null,
    recipientAccountNumber: '',
    recipientName: null,
    recipientConfirmed: null,
    amount: 0,
    confirmed: { recipient: false, account: false, amount: false },
    authToken: null,
    transactionId: null,
    helpUsedCount: 0,
    errorCount: 0,
    startedAt: null,
    completedAt: null
  }
}

export interface LastResult {
  practiceId?: number
  mode: PracticeMode
  bankName?: string
  recipientName?: string | null
  amount?: number
  durationSec?: number | null
  helpUsedCount?: number
  errorCount?: number
}

interface SessionState {
  settings: UserSettings
  onboardingDone: boolean
  introVideoSeen: boolean
  introMotionVisible: boolean
  introMotionResolved: boolean
  pendingBankCode: BankCode | null // '계좌이체 연습' 진입 시 먼저 고른 은행 (연습 시작 전, flow가 만들어지기 전 단계)
  flow: FlowState
  lastResult: LastResult | null
}

interface FinishFlowInput {
  mode: PracticeMode
  bankName?: string
  recipientName?: string | null
  amount?: number
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    // GET/PATCH /api/users/settings 와 1:1로 대응하는 설정값
    settings: {
      defaultBankCode: 'KB',
      helpLevel: 'BEGINNER',
      voiceGuideEnabled: true,
      textSize: 'LARGE',
      buttonSize: 'LARGE',
      highContrastEnabled: false,
      speechRate: 0.8,
      voiceVolume: 0.4
    },
    onboardingDone: false,
    introVideoSeen: false,
    introMotionVisible: false,
    introMotionResolved: false,
    pendingBankCode: null,

    // ---- 진행 중 실습 세션 (together=함께해보기 / practice=스스로해보기) ----
    flow: emptyFlow(),

    lastResult: null // 완료 화면에서 보여줄 요약
  }),

  getters: {
    selectedBank(state): Bank {
      return BANKS.find((b) => b.bankCode === state.settings.defaultBankCode) || BANKS[0]
    },
    flowBank(state): Bank | null {
      return BANKS.find((b) => b.bankCode === state.flow.bankCode) || null
    },
    pendingBank(state): Bank | null {
      return BANKS.find((b) => b.bankCode === state.pendingBankCode) || null
    },
    formattedAmount(state): string {
      return state.flow.amount.toLocaleString('ko-KR')
    },
    isFlowReady(state): boolean {
      return !!state.flow.mode
    }
  },

  actions: {
    // ---------- 설정 ----------
    updateSettings(patch: Partial<UserSettings>) {
      this.settings = { ...this.settings, ...patch }
      this.persistToLocalStorage()
    },
    setDefaultBank(code: BankCode) {
      this.settings.defaultBankCode = code
      this.persistToLocalStorage()
    },
    setPendingBank(code: BankCode) {
      this.pendingBankCode = code
    },
    completeOnboarding() {
      this.onboardingDone = true
      this.persistToLocalStorage()
    },
    markIntroVideoSeen() {
      this.introVideoSeen = true
      this.persistToLocalStorage()
    },
    setIntroMotionState(visible: boolean) {
      this.introMotionVisible = visible
      this.introMotionResolved = true
    },
    persistToLocalStorage() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            settings: this.settings,
            onboardingDone: this.onboardingDone,
            introVideoSeen: this.introVideoSeen,
            introFlowVersion: INTRO_FLOW_VERSION
          })
        )
      } catch {
        /* 저장 실패 시 무시 - 세션 내 상태로만 동작 */
      }
    },
    restoreFromLocalStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const saved = JSON.parse(raw) as {
          settings?: Partial<UserSettings>
          onboardingDone?: boolean
          introVideoSeen?: boolean
          introFlowVersion?: string
        }
        if (saved.settings) this.settings = { ...this.settings, ...saved.settings }
        if (saved.onboardingDone) this.onboardingDone = saved.onboardingDone
        if (saved.introFlowVersion === INTRO_FLOW_VERSION && saved.introVideoSeen) this.introVideoSeen = true
      } catch {
        /* 손상된 값 무시 */
      }
    },

    // ---------- 실습 플로우 ----------
    beginFlow(mode: PracticeMode, scenarioId: number) {
      this.flow = {
        ...emptyFlow(),
        mode,
        scenarioId,
        startedAt: Date.now()
      }
    },
    applyStartResult(practiceId: number, step: StepCode, mission: PracticeMission, bankCode: BankCode) {
      this.flow.practiceId = practiceId
      this.flow.step = step
      this.flow.mission = mission
      this.flow.bankCode = bankCode
    },
    goToStep(step: StepCode) {
      this.flow.step = step
    },
    setSourceAccount(accountId: string) {
      this.flow.sourceAccountId = accountId
    },
    setRecipientAccountNumber(v: string) {
      this.flow.recipientAccountNumber = v
    },
    setRecipientLookup({ name, confirmed }: { name: string | null; confirmed: boolean | null }) {
      this.flow.recipientName = name
      this.flow.recipientConfirmed = confirmed
    },
    setFlowBankCode(code: BankCode) {
      this.flow.bankCode = code
    },
    // 홈 화면 '이어하기' 등 서버가 내려준 이전 세션 정보로 flow를 다시 채웁니다.
    // (서버에 저장된 세부 입력값(계좌/금액 등)은 별도 조회 API가 없어 복원하지 않으므로,
    // 재개 후에도 각 단계 화면에서 canProceed 검증을 다시 통과해야 진행됩니다.)
    resumeFlow(mode: PracticeMode, practiceId: number, bankCode: BankCode, step: StepCode) {
      this.flow = {
        ...emptyFlow(),
        mode,
        practiceId,
        bankCode,
        step,
        startedAt: Date.now()
      }
    },
    setAmount(v: number) {
      this.flow.amount = v
    },
    toggleConfirm(key: keyof FlowConfirmed) {
      this.flow.confirmed[key] = !this.flow.confirmed[key]
    },
    setAuthToken(token: string) {
      this.flow.authToken = token
    },
    setTransactionId(id: string) {
      this.flow.transactionId = id
    },
    recordHelpUsed() {
      this.flow.helpUsedCount += 1
    },
    recordError() {
      this.flow.errorCount += 1
    },
    finishFlow(result: FinishFlowInput) {
      this.flow.completedAt = Date.now()
      this.lastResult = {
        practiceId: this.flow.practiceId || undefined,
        ...result,
        durationSec: this.flow.startedAt
          ? Math.round((this.flow.completedAt - this.flow.startedAt) / 1000)
          : null,
        helpUsedCount: this.flow.helpUsedCount,
        errorCount: this.flow.errorCount
      }
    },
    resetFlow() {
      this.flow = emptyFlow()
    }
  }
})

export type { HelpLevel }
