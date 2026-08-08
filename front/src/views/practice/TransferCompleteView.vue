<template>
  <div class="page" :style="isBrandedStyle ? themeStyle : {}">
    <AppHeader title="연습 완료" :bank="isBrandedStyle ? flowBank : null" show-home @home="goHome" />

    <div class="screen center">
      <div class="check-circle" aria-hidden="true"><Icon name="check" :size="30" /></div>
      <h2 class="screen-title center">{{ mode === 'together' ? '함께 해보기 완료!' : '계좌이체 연습을 끝냈어요!' }}</h2>

      <div class="badge-row">
        <span class="pill">가상 연습 완료</span>
        <span class="pill">실제 송금 없음</span>
      </div>

      <MascotTip>연습 결과예요! 잘한 점과 다시 연습할 부분을 함께 안내해드릴게요.</MascotTip>

      <BankTransferReceipt
        v-if="isBrandedStyle && result"
        :receiver-name="result.summary.recipientName"
        :bank-name="result.summary.bankName"
        :masked-account-number="result.summary.maskedAccountNumber"
        :formatted-amount="result.summary.amount.toLocaleString('ko-KR')"
        :formatted-remaining="formattedRemaining"
        @home="goHome"
        @history="goHome"
      />
      <div class="summary-card" v-else-if="result">
        <p class="summary-card__line">
          {{ result.summary.bankName }} · {{ result.summary.recipientName }} · {{ result.summary.amount.toLocaleString('ko-KR') }}원
        </p>
        <p class="summary-card__meta">도움 사용 {{ store.flow.helpUsedCount }}회 · 오류 {{ store.flow.errorCount }}회</p>
      </div>

      <div class="spacer" />

      <div class="footer-stack">
        <AppButton data-tutor-id="retry-button" @click="retrySame">같은 연습 다시 하기</AppButton>
        <AppButton v-if="mode === 'practice'" variant="outline" @click="newBank">다른 은행으로 연습</AppButton>
      </div>
      <p class="saved-note">연습 결과를 저장했어요.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import MascotTip from '@/components/common/MascotTip.vue'
import AppButton from '@/components/common/AppButton.vue'
import BankTransferReceipt from '@/components/common/BankTransferReceipt.vue'
import Icon from '@/components/common/icons/Icon.vue'
import { useSessionStore } from '@/stores/session'
import { useBankTheme } from '@/composables/useBankTheme'
import { getBankByCode } from '@/assets/data/banks'
import { fetchPracticeAccounts, fetchPracticeResult, restartPractice } from '@/api/practiceApi'
import type { PracticeResult } from '@/types'

const props = defineProps<{ mode: 'together' | 'practice' }>()
const router = useRouter()
const store = useSessionStore()

const flowBank = computed(() => getBankByCode(store.flow.bankCode))
const { themeStyle, isBrandedStyle } = useBankTheme(flowBank)

const result = ref<PracticeResult | null>(null)
const formattedRemaining = ref('')

onMounted(async () => {
  if (!store.flow.practiceId) return
  result.value = await fetchPracticeResult(store.flow.practiceId)
  const accounts = await fetchPracticeAccounts(store.flow.practiceId)
  const account = accounts.find((a) => a.accountId === store.flow.sourceAccountId)
  if (account) {
    formattedRemaining.value = Math.max(0, account.balance - (result.value?.summary.amount || 0)).toLocaleString('ko-KR')
  }
})

function goHome() {
  router.push('/')
}
async function retrySame() {
  if (!store.flow.practiceId || !store.flow.bankCode) return
  const restart = await restartPractice(store.flow.practiceId, { mode: 'SAME_SCENARIO', bankCode: store.flow.bankCode })
  const priorMission = store.flow.mission
  store.beginFlow(props.mode, restart.scenarioId)
  store.applyStartResult(
    restart.newPracticeId,
    restart.currentStep,
    priorMission ?? { recipientName: '', bankCode: restart.bankCode, maskedAccountNumber: '', amount: 0 },
    restart.bankCode
  )
  router.push(props.mode === 'together' ? '/together/step/1' : '/practice/step/1')
}
function newBank() {
  store.resetFlow()
  // '스스로 해보기'의 은행 선택 화면으로 - 온보딩의 기본 은행 설정과는 별개로,
  // 이번 한 번의 연습에서만 쓸 은행을 새로 고릅니다.
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
.summary-card__line {
  margin: 0 0 4px;
  font-weight: 700;
}
.summary-card__meta {
  margin: 0;
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
}
.footer-stack {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.saved-note {
  font-size: var(--fs-caption);
  color: var(--color-text-muted);
}
</style>
