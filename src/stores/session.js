import { defineStore } from 'pinia'
import { BANKS } from '@/assets/data/banks'

const STORAGE_KEY = 'hangeoleum.settings.v1'

export const useSessionStore = defineStore('session', {
  state: () => ({
    // ---- 온보딩/접근성 설정 (12.30, 12.40, 2.20, 2.30) ----
    settings: {
      fontSize: 'large', // basic | large | xlarge
      highContrast: false,
      bigButtons: true,
      voiceEnabled: true,
      voiceSpeed: 0.8, // 0.8 | 1.0
      autoPlay: true,
      helpLevel: 'guided', // first | guided | solo  (처음연습/도움받으며/혼자연습)
      onboardingDone: false
    },
    selectedBankCode: 'a-bank', // 주거래 은행 (2.40)

    // ---- 진행 중 실습 세션 (together=함께해보기 / practice=스스로해보기) ----
    flow: {
      mode: null, // 'together' | 'practice'
      scenarioId: null,
      step: 0, // 0=인트로, 1~5=단계, 6=완료
      sessionId: null,
      requestId: null,
      withdrawAccountId: null,
      receiverBankCode: null,
      accountNumber: '',
      receiverName: null, // 가상 수취인 조회 결과
      receiverMatched: null,
      amount: 0,
      memo: '',
      confirmed: {
        receiver: false,
        account: false,
        amount: false
      },
      helpUsedCount: 0,
      errorCount: 0,
      startedAt: null,
      completedAt: null
    },

    lastResult: null // 완료 화면에서 보여줄 요약
  }),

  getters: {
    selectedBank: (state) => BANKS.find((b) => b.code === state.selectedBankCode) || BANKS[0],
    receiverBank: (state) => BANKS.find((b) => b.code === state.flow.receiverBankCode) || null,
    formattedAmount: (state) => state.flow.amount.toLocaleString('ko-KR'),
    isFlowReady: (state) => !!state.flow.mode
  },

  actions: {
    // ---------- 설정 ----------
    updateSettings(patch) {
      this.settings = { ...this.settings, ...patch }
      this.persistToLocalStorage()
    },
    setBank(code) {
      this.selectedBankCode = code
      this.persistToLocalStorage()
    },
    completeOnboarding() {
      this.settings.onboardingDone = true
      this.persistToLocalStorage()
    },
    persistToLocalStorage() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ settings: this.settings, selectedBankCode: this.selectedBankCode })
        )
      } catch (e) {
        /* 저장 실패 시 무시 - 세션 내 상태로만 동작 */
      }
    },
    restoreFromLocalStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const saved = JSON.parse(raw)
        if (saved.settings) this.settings = { ...this.settings, ...saved.settings }
        if (saved.selectedBankCode) this.selectedBankCode = saved.selectedBankCode
      } catch (e) {
        /* 손상된 값 무시 */
      }
    },

    // ---------- 실습 플로우 ----------
    startFlow(mode, scenarioId) {
      this.flow = {
        mode,
        scenarioId,
        step: 1,
        sessionId: `sess_${Date.now()}`,
        requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        withdrawAccountId: null,
        receiverBankCode: null,
        accountNumber: '',
        receiverName: null,
        receiverMatched: null,
        amount: 0,
        memo: '',
        confirmed: { receiver: false, account: false, amount: false },
        helpUsedCount: 0,
        errorCount: 0,
        startedAt: Date.now(),
        completedAt: null
      }
    },
    goToStep(n) {
      this.flow.step = n
    },
    nextStep() {
      this.flow.step += 1
    },
    prevStep() {
      if (this.flow.step > 1) this.flow.step -= 1
    },
    setWithdrawAccount(accountId) {
      this.flow.withdrawAccountId = accountId
    },
    setReceiverBank(code) {
      this.flow.receiverBankCode = code
    },
    setAccountNumber(v) {
      this.flow.accountNumber = v
    },
    setReceiverLookup({ name, matched }) {
      this.flow.receiverName = name
      this.flow.receiverMatched = matched
    },
    setAmount(v) {
      this.flow.amount = v
    },
    toggleConfirm(key) {
      this.flow.confirmed[key] = !this.flow.confirmed[key]
    },
    recordHelpUsed() {
      this.flow.helpUsedCount += 1
    },
    recordError() {
      this.flow.errorCount += 1
    },
    finishFlow(result) {
      this.flow.completedAt = Date.now()
      this.lastResult = {
        ...result,
        durationSec: this.flow.startedAt
          ? Math.round((this.flow.completedAt - this.flow.startedAt) / 1000)
          : null,
        helpUsedCount: this.flow.helpUsedCount,
        errorCount: this.flow.errorCount
      }
    },
    resetFlow() {
      this.flow = {
        mode: null,
        scenarioId: null,
        step: 0,
        sessionId: null,
        requestId: null,
        withdrawAccountId: null,
        receiverBankCode: null,
        accountNumber: '',
        receiverName: null,
        receiverMatched: null,
        amount: 0,
        memo: '',
        confirmed: { receiver: false, account: false, amount: false },
        helpUsedCount: 0,
        errorCount: 0,
        startedAt: null,
        completedAt: null
      }
    }
  }
})
