<template>
  <div class="page">
    <AppHeader title="처음 설정" badge="처음 설정" show-back @back="router.back()" />
    <StepProgress :current="2" :total="4" />

    <div class="screen">
      <h2 class="screen-title">보기와 듣기를 맞출게요</h2>
      <p class="screen-subtitle">원하는 설정을 한번씩 눌러보세요. <button class="link-btn" @click="replay">다시 듣기</button></p>

      <div class="setting-row" @click="cycleFontSize">
        <div class="setting-row__text">
          <span class="setting-row__label">화면</span>
          <strong>{{ fontSizeLabel }}</strong>
        </div>
        <span class="setting-row__chevron">›</span>
      </div>

      <div class="setting-row" @click="toggleVoice">
        <div class="setting-row__text">
          <span class="setting-row__label">음성 안내</span>
          <strong>{{ store.settings.voiceEnabled ? '켜짐' : '꺼짐' }}</strong>
        </div>
        <span class="setting-row__chevron">›</span>
      </div>

      <div class="setting-row" @click="cycleHelpLevel">
        <div class="setting-row__text">
          <span class="setting-row__label">도움 수준</span>
          <strong>{{ helpLevelLabel }}</strong>
        </div>
        <span class="setting-row__chevron">›</span>
      </div>

      <div class="preview" :style="{ fontSize: 'var(--fs-body-lg)' }">
        미리보기: 이렇게 보이고 들려요.
      </div>

      <div class="spacer" />
      <AppButton @click="next">이 설정으로 계속 →</AppButton>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import StepProgress from '@/components/common/StepProgress.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useSessionStore } from '@/stores/session'
import { useTTS } from '@/composables/useTTS'

const router = useRouter()
const store = useSessionStore()
const { speak } = useTTS()

const FONT_SIZES = ['basic', 'large', 'xlarge']
const FONT_LABEL = { basic: '기본 크게 보기', large: '크게 보기', xlarge: '아주 크게 보기' }
const HELP_LEVELS = ['first', 'guided', 'solo']
const HELP_LABEL = { first: '처음 연습 (모두 설명)', guided: '힌트 먼저', solo: '혼자 연습' }

const fontSizeLabel = computed(() => FONT_LABEL[store.settings.fontSize])
const helpLevelLabel = computed(() => HELP_LABEL[store.settings.helpLevel])

function applyFontScale(size) {
  const scale = { basic: 1, large: 1.15, xlarge: 1.3 }[size] || 1
  document.documentElement.style.setProperty('--font-scale', scale)
}

function cycleFontSize() {
  const idx = FONT_SIZES.indexOf(store.settings.fontSize)
  const next = FONT_SIZES[(idx + 1) % FONT_SIZES.length]
  store.updateSettings({ fontSize: next })
  applyFontScale(next)
}
function toggleVoice() {
  store.updateSettings({ voiceEnabled: !store.settings.voiceEnabled })
}
function cycleHelpLevel() {
  const idx = HELP_LEVELS.indexOf(store.settings.helpLevel)
  const next = HELP_LEVELS[(idx + 1) % HELP_LEVELS.length]
  store.updateSettings({ helpLevel: next })
}
function replay() {
  speak('원하는 설정을 한번씩 눌러보세요.')
}
function next() {
  router.push('/onboarding/bank')
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.link-btn {
  border: none;
  background: none;
  color: var(--color-primary);
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--tap-min);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  cursor: pointer;
}
.setting-row__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.setting-row__label {
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
}
.setting-row__text strong {
  font-size: var(--fs-body-lg);
}
.setting-row__chevron {
  color: var(--color-text-muted);
  font-size: 20px;
}
.preview {
  background: var(--color-tip-bg);
  border: 1px solid var(--color-tip-border);
  border-radius: var(--radius-sm);
  padding: 14px;
  text-align: center;
  font-weight: 700;
  color: var(--color-tip-text);
}
</style>
