<template>
  <div class="page">
    <AppHeader title="함께 해보기" badge="가상 연습" show-back show-home @back="router.push('/')" @home="router.push('/')" />

    <div class="screen">
      <h2 class="screen-title">6단계를 같이 배워요</h2>

      <MascotTip>막히면 AI 튜터가 다음 버튼을 알려줘요.</MascotTip>

      <div class="scenario-card">
        <p class="scenario-card__label">가상 설정</p>
        <p class="scenario-card__title">{{ scenario.title }} {{ formattedAmount }}원 보내기</p>
        <p class="scenario-card__note">가상 연습 · 실제 송금 없음</p>
      </div>

      <ol class="step-list">
        <li v-for="(label, idx) in steps" :key="label">
          <span class="step-list__num">{{ idx + 1 }}</span>
          {{ label }}
        </li>
      </ol>

      <div class="spacer" />
      <AppButton @click="startFlow">☎ 함께 시작</AppButton>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import MascotTip from '@/components/common/MascotTip.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useSessionStore } from '@/stores/session'
import { SCENARIOS } from '@/assets/data/scenarios'

const router = useRouter()
const store = useSessionStore()

const scenario = SCENARIOS[0] // '함께 해보기'는 병원비 시나리오로 고정 안내
const formattedAmount = computed(() => scenario.amount.toLocaleString('ko-KR'))
const steps = ['보낼 계좌', '받는 은행', '계좌번호', '금액', '확인', '완료']

function startFlow() {
  store.startFlow('together', scenario.id)
  router.push('/together/step/1')
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
