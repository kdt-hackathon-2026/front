<template>
  <div class="page" :style="isKbStyle ? themeStyle : {}">
    <AppHeader title="연습 완료" :bank="isKbStyle ? completedBank : null" show-home @home="router.push('/')" />

    <div class="screen center">
      <div class="check-circle" aria-hidden="true">✓</div>
      <h2 class="screen-title center">계좌이체 연습을<br />끝냈어요!</h2>

      <div class="badge-row">
        <span class="pill">가상 연습 완료</span>
        <span class="pill">실제 송금 없음</span>
      </div>

      <BankTransferReceipt
        v-if="isKbStyle && result"
        :receiver-name="result.receiverName"
        :bank-name="result.bankName"
        :masked-account-number="maskedAccountNumber"
        :withdraw-label="withdrawAccount?.name"
        :formatted-amount="result.amount?.toLocaleString('ko-KR')"
        :formatted-remaining="formattedRemaining"
        @home="router.push('/')"
        @history="router.push('/')"
      />
      <div class="summary-card" v-else-if="result">
        <p>은행 · {{ result.bankName }} · {{ result.amount?.toLocaleString('ko-KR') }}원</p>
        <p class="summary-card__meta">받는 분과 금액을 다시 확인했어요.</p>
      </div>

      <div class="spacer" />

      <div class="footer-stack">
        <AppButton @click="retrySame">↻ 같은 연습 다시 하기</AppButton>
        <div class="footer-actions">
          <AppButton variant="outline" @click="newScenario">✎ 다른 상황 연습</AppButton>
          <AppButton variant="outline" @click="newBank">⛃ 다른 은행 연습</AppButton>
        </div>
      </div>
      <p class="saved-note">연습 결과를 저장했어요.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AppButton from '@/components/common/AppButton.vue'
import BankTransferReceipt from '@/components/common/BankTransferReceipt.vue'
import { useSessionStore } from '@/stores/session'
import { useBankTheme } from '@/composables/useBankTheme'
import { getAccountById } from '@/assets/data/accounts'
import { getBankByCode } from '@/assets/data/banks'

const router = useRouter()
const store = useSessionStore()
const result = computed(() => store.lastResult)
const completedBank = computed(() => getBankByCode(store.flow.receiverBankCode))
const { themeStyle, isKbStyle } = useBankTheme(completedBank)

const withdrawAccount = computed(() => getAccountById(store.flow.withdrawAccountId))
const maskedAccountNumber = computed(() => {
  const n = store.flow.accountNumber
  if (!n || n.length < 4) return n
  return n.slice(0, -4) + '****'
})
const formattedRemaining = computed(() => {
  if (!withdrawAccount.value) return ''
  return Math.max(0, withdrawAccount.value.balance - (result.value?.amount || 0)).toLocaleString('ko-KR')
})

function retrySame() {
  store.startFlow('practice', store.flow.scenarioId)
  router.push('/practice/step/1')
}
function newScenario() {
  store.resetFlow()
  router.push('/practice')
}
function newBank() {
  store.resetFlow()
  router.push('/onboarding/bank')
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.center {
  text-align: center;
  align-items: center;
}
.check-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-success);
  color: #fff;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 12px auto 0;
}
.badge-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.pill {
  background: var(--color-success-bg);
  color: var(--color-success);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: var(--fs-caption);
  font-weight: 700;
}
.summary-card {
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
}
.summary-card p {
  margin: 0 0 4px;
  font-weight: 700;
}
.summary-card__meta {
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
  font-weight: 400 !important;
}
.footer-stack {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.footer-actions {
  display: flex;
  gap: 10px;
}
.footer-actions > * {
  flex: 1;
}
.saved-note {
  font-size: var(--fs-caption);
  color: var(--color-text-muted);
}
</style>
