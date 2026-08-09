<template>
  <div class="page" :style="themeStyle">
    <AppHeader title="스스로 해보기" badge="가상 연습" :bank="pendingBank" show-back show-home @back="router.push('/practice')" @home="router.push('/')" />

    <div class="screen">
      <h2 class="screen-title">도움 난이도를 골라주세요</h2>
      <p class="screen-subtitle">얼마나 도와드릴지 골라주시면 그에 맞춰 안내할게요.</p>

      <MascotTip>이 세 가지 중에서 편한 걸 골라주세요. 언제든 오른쪽 아래 AI 도우미로 다시 도움받을 수 있어요.</MascotTip>

      <div class="level-list" data-tutor-id="help-level-list">
        <button
          v-for="lv in levels"
          :key="lv.key"
          class="level-card"
          :class="{ 'is-selected': level === lv.key }"
          @click="level = lv.key"
        >
          <span class="level-card__icon"><Icon :name="lv.icon" :size="26" /></span>
          <span class="level-card__body">
            <strong>{{ lv.label }}</strong>
            <span>{{ lv.desc }}</span>
          </span>
          <span v-if="level === lv.key" class="level-card__check"><Icon name="check" :size="16" /></span>
        </button>
      </div>

      <div class="spacer" />
      <AppButton data-tutor-id="start-practice-button" :disabled="starting" @click="start">
        {{ starting ? '준비 중…' : '이 난이도로 실습 시작' }}
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import MascotTip from '@/components/common/MascotTip.vue'
import AppButton from '@/components/common/AppButton.vue'
import Icon from '@/components/common/icons/Icon.vue'
import { useSessionStore } from '@/stores/session'
import { useBankTheme } from '@/composables/useBankTheme'
import { startPractice } from '@/api/practiceApi'
import { SCENARIOS } from '@/assets/data/scenarios'
import type { HelpLevel } from '@/types'
import type { IconName } from '@/components/common/icons/registry'

const router = useRouter()
const store = useSessionStore()

const pendingBank = computed(() => store.pendingBank)
const { themeStyle } = useBankTheme(pendingBank)

const level = ref<HelpLevel>(store.settings.helpLevel)
const starting = ref(false)

const levels: { key: HelpLevel; icon: IconName; label: string; desc: string }[] = [
  { key: 'ADVANCED', icon: 'sparkle', label: '도움 없이', desc: '스스로 끝까지 해봐요' },
  { key: 'NORMAL', icon: 'bot', label: '작은 도움', desc: '막힐 때만 AI가 살짝 도와줘요' },
  { key: 'BEGINNER', icon: 'bot', label: '도움 (AI가 전부)', desc: 'AI 도우미가 처음부터 끝까지 알려줘요' }
]

async function start() {
  if (!store.pendingBankCode) {
    router.replace('/practice')
    return
  }
  starting.value = true
  try {
    store.updateSettings({ helpLevel: level.value })
    // 연습 문제는 고른 은행에 맞춰 자동으로 골라드려요 (별도 문제 선택 화면 없음)
    const scenario =
      SCENARIOS.find((s) => s.bankCode === store.pendingBankCode) || SCENARIOS[0]
    store.beginFlow('practice', scenario.scenarioId)

    const result = await startPractice({
      scenarioId: scenario.scenarioId,
      bankCode: store.pendingBankCode,
      helpLevel: level.value
    })
    store.applyStartResult(result.practiceId, result.currentStep, result.mission, store.pendingBankCode)
    router.push('/practice/step/1')
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
.level-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.level-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 76px;
  padding: 16px 18px;
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  text-align: left;
}
.level-card.is-selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.level-card__icon {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.level-card.is-selected .level-card__icon {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.level-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.level-card__body strong {
  font-size: var(--fs-body-lg);
}
.level-card__body span {
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
}
.level-card__check {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
