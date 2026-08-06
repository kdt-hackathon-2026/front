<template>
  <div class="page">
    <AppHeader title="스스로 해보기" badge="가상 연습" show-back show-home @back="router.push('/')" @home="router.push('/')" />

    <div class="screen">
      <h2 class="screen-title">AI 튜터와 스스로 연습하기</h2>

      <MascotTip>
        저는 계속 옆에 있어요. 막히면 오른쪽 아래 'AI 도우미' 버튼을 눌러 언제든 저를 불러주세요.
      </MascotTip>

      <SelectCard
        v-for="s in scenarios"
        :key="s.id"
        :title="s.title"
        :subtitle="`${s.amount.toLocaleString('ko-KR')}원 · 가상 상황`"
        :icon="s.icon"
        :selected="selectedScenarioId === s.id"
        @click="selectedScenarioId = s.id"
      />

      <p class="section-label">연습 난이도</p>
      <div class="level-grid">
        <button
          v-for="lv in levels"
          :key="lv.key"
          class="level-chip"
          :class="{ 'is-selected': level === lv.key }"
          @click="level = lv.key"
        >
          <strong>{{ lv.label }}</strong>
          <span>{{ lv.desc }}</span>
        </button>
      </div>

      <div class="spacer" />
      <AppButton @click="startFlow">▷ {{ steps }}단계 실습 시작</AppButton>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import SelectCard from '@/components/common/SelectCard.vue'
import MascotTip from '@/components/common/MascotTip.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useSessionStore } from '@/stores/session'
import { SCENARIOS } from '@/assets/data/scenarios'

const router = useRouter()
const store = useSessionStore()

const scenarios = SCENARIOS
const selectedScenarioId = ref(SCENARIOS[0].id)
const level = ref(store.settings.helpLevel)
const steps = 6

const levels = [
  { key: 'first', label: '기본', desc: '정상 흐름 그대로' },
  { key: 'guided', label: '도움 포함', desc: '힌트와 화면 강조 제공' },
  { key: 'solo', label: '실수 찾기', desc: '스스로 오류를 확인해요' }
]

function startFlow() {
  store.updateSettings({ helpLevel: level.value })
  store.startFlow('practice', selectedScenarioId.value)
  router.push('/practice/step/1')
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.level-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.level-chip {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 10px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  text-align: left;
}
.level-chip.is-selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.level-chip strong {
  font-size: var(--fs-caption);
}
.level-chip span {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.3;
}
</style>
