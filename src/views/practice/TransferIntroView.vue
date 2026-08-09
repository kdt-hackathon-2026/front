<template>
  <div class="page" :style="themeStyle">
    <AppHeader title="함께 해보기" badge="처음 배우기" :bank="pendingBank" show-back show-home @back="router.push('/together')" @home="router.push('/')" />

    <div class="screen">
      <h2 class="screen-title">5단계를 같이 배워요</h2>

      <MascotTip>
        처음 배우기예요. 막히지 않아도 제가 화면마다 순서대로 다 알려드릴게요.
      </MascotTip>

      <div class="scenario-card">
        <p class="scenario-card__label">가상 설정</p>
        <p class="scenario-card__title">{{ scenario.title }} {{ formattedAmount }}원 보내기</p>
        <p class="scenario-card__note">가상 연습 · 실제 송금 없음</p>
      </div>

      <ol class="step-list">
        <li v-for="(label, idx) in stepList" :key="label">
          <span class="step-list__num">{{ idx + 1 }}</span>
          {{ label }}
        </li>
      </ol>

      <div class="spacer" />
      <AppButton data-tutor-id="start-practice-button" :disabled="starting" @click="start">
        {{ starting ? '준비 중…' : '함께 시작' }}
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import MascotTip from '@/components/common/MascotTip.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useSessionStore } from '@/stores/session'
import { useBankTheme } from '@/composables/useBankTheme'
import { fetchScenarios, startPractice } from '@/api/practiceApi'
import { SCENARIOS } from '@/assets/data/scenarios'
import type { Scenario } from '@/types'

const router = useRouter()
const store = useSessionStore()

const pendingBank = computed(() => store.pendingBank)
const { themeStyle } = useBankTheme(pendingBank)

const scenarios = ref<Scenario[]>(SCENARIOS)
// 함께 해보기는 고른 은행에 맞는 문제를 자동으로 하나 골라서 안내해요.
const scenario = computed(
  () => scenarios.value.find((s) => s.bankCode === store.pendingBankCode) || scenarios.value[0] || SCENARIOS[0]
)
const formattedAmount = computed(() => scenario.value.amount.toLocaleString('ko-KR'))
const stepList = ['출금 계좌', '받는 분 계좌', '금액', '최종 확인', '모의 인증']
const starting = ref(false)

onMounted(async () => {
  if (!store.pendingBankCode) {
    router.replace('/together')
    return
  }
  scenarios.value = await fetchScenarios()
})

async function start() {
  if (!store.pendingBankCode) return
  starting.value = true
  try {
    store.beginFlow('together', scenario.value.scenarioId)
    const result = await startPractice({
      scenarioId: scenario.value.scenarioId,
      bankCode: store.pendingBankCode,
      helpLevel: 'BEGINNER'
    })
    store.applyStartResult(result.practiceId, result.currentStep, result.mission, store.pendingBankCode)
    router.push('/together/step/1')
  } finally {
    starting.value = false
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.scenario-card {
  background: var(--color-tip-bg);
  border: 1px solid var(--color-tip-border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
}
.scenario-card__label {
  margin: 0 0 4px;
  font-size: var(--fs-caption);
  color: var(--color-tip-text);
  font-weight: 700;
}
.scenario-card__title {
  margin: 0 0 4px;
  font-size: var(--fs-body-lg);
  font-weight: 800;
  color: var(--color-text);
}
.scenario-card__note {
  margin: 0;
  font-size: var(--fs-caption);
  color: var(--color-tip-text);
}
.step-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.step-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  font-size: var(--fs-body);
  font-weight: 600;
}
.step-list__num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: var(--fs-caption);
  flex-shrink: 0;
}
</style>
