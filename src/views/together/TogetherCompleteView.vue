<template>
  <div class="page" :style="isKbStyle ? themeStyle : {}">
    <AppHeader title="연습 완료" :bank="isKbStyle ? completedBank : null" show-home @home="router.push('/')" />

    <div class="screen center">
      <div class="check-circle" aria-hidden="true">✓</div>
      <h2 class="screen-title center">함께 해보기 완료!</h2>
      <p class="screen-subtitle center">가상 연습 완료 · 실제 송금 없음</p>

      <MascotTip>
        연습 결과예요! 잘한 점과 다시 연습할 부분을 함께 안내해드릴게요.
      </MascotTip>

      <!-- 실제 은행 앱 UI를 참고한 이체 완료 영수증 (가은행/나은행처럼 브랜드 테마가 있을 때만) -->
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
        <p class="summary-card__line">
          {{ result.bankName }} · {{ result.receiverName }} · {{ result.amount?.toLocaleString('ko-KR') }}원
          <span v-if="result.durationSec"> · {{ formatDuration(result.durationSec) }}</span>
        </p>
        <p class="summary-card__meta">
          도움 사용 {{ result.helpUsedCount }}회 · 오류 {{ result.errorCount }}회
        </p>
      </div>

      <div class="spacer" />

      <div class="footer-actions">
        <AppButton variant="outline" @click="retrySame">같은 연습 다시</AppButton>
        <AppButton @click="newPractice">새 연습</AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import MascotTip from '@/components/common/MascotTip.vue'
import AppButton from '@/components/common/AppButton.vue'
import BankTransferReceipt from '@/components/common/BankTransferReceipt.vue'
import { useSessionStore } from '@/stores/session'
import { useBankTheme } from '@/composables/useBankTheme'
import { getAccountById } from '@/assets/data/accounts'
import { getBankByCode } from '@/assets/data/banks'

const router = useRouter()
const store = useSessionStore()
const result = computed(() => store.lastResult)
// 방금 실습에서 실제로 선택했던 '받는 분 은행'을 기준으로 테마를 유지합니다.
const completedBank = computed(() => getBankByCode(store.flow.receiverBankCode))
const { themeStyle, isKbStyle } = useBankTheme(completedBank)

// 방금 끝난 세션의 flow 값은 다음 연습을 시작하기 전까지 store.flow에 남아있어 그대로 활용
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

function formatDuration(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}분 ${s}초` : `${s}초`
}
function retrySame() {
  const scenarioId = store.flow.scenarioId
  store.startFlow('together', scenarioId)
  router.push('/together/step/1')
}
function newPractice() {
  store.resetFlow()
  router.push('/practice')
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
.summary-card {
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
}
.summary-card__line {
  margin: 0 0 4px;
  font-weight: 700;
}
.summary-card__meta {
  margin: 0;
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
}
.footer-actions {
  display: flex;
  gap: 10px;
  width: 100%;
}
.footer-actions > * {
  flex: 1;
}
</style>
