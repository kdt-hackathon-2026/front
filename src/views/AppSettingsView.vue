<template>
  <div class="app-settings-page">
    <AppHeader title="앱 설정" show-back show-home home-tutor-id="settings-home-button" @back="goHome" @home="goHome" />

    <main class="screen app-settings-content">
      <h2 class="screen-title">금융한걸음 설정</h2>
      <p class="screen-subtitle">은행 화면이 아닌 금융한걸음 앱에만 적용돼요.</p>

      <section class="setting-card" aria-labelledby="text-size-title">
        <div class="setting-card__heading">
          <div>
            <h3 id="text-size-title">글씨 크기 조절</h3>
            <p>앱 화면의 글씨 크기를 선택해요.</p>
          </div>
          <strong>{{ textSizeLabel }}</strong>
        </div>

        <div class="choice-grid choice-grid--three" data-tutor-id="settings-text-size" role="group" aria-label="글씨 크기 선택">
          <button
            v-for="option in textSizeOptions"
            :key="option.key"
            class="choice-button"
            :class="{ 'is-active': store.settings.textSize === option.key }"
            :aria-pressed="store.settings.textSize === option.key"
            @click="selectTextSize(option.key)"
          >
            <strong :class="`sample-text sample-text--${option.key.toLowerCase()}`">가</strong>
            <span>{{ option.label }}</span>
          </button>
        </div>
      </section>

      <section class="setting-card" aria-labelledby="help-level-title">
        <div class="setting-card__heading">
          <div>
            <h3 id="help-level-title">AI 안내 수준 강도</h3>
            <p>연습할 때 받을 AI 도움의 강도를 선택해요.</p>
          </div>
          <strong>{{ helpLevelLabel }}</strong>
        </div>

        <div class="choice-grid choice-grid--three" data-tutor-id="settings-help-level" role="group" aria-label="AI 안내 단계 선택">
          <button
            v-for="option in helpLevelOptions"
            :key="option.key"
            class="choice-button"
            :class="{ 'is-active': store.settings.helpLevel === option.key }"
            :aria-pressed="store.settings.helpLevel === option.key"
            @click="selectHelpLevel(option.key)"
          >
            <strong>{{ option.label }}</strong>
            <span>{{ option.description }}</span>
          </button>
        </div>
      </section>

      <section class="setting-card" aria-labelledby="volume-title">
        <div class="setting-card__heading">
          <div>
            <h3 id="volume-title">AI 음성 크기 조절</h3>
            <p>AI 안내 음성의 크기를 선택해요.</p>
          </div>
          <strong>{{ Math.round(store.settings.voiceVolume * 100) }}%</strong>
        </div>

        <input
          class="volume-slider"
          data-tutor-id="settings-voice-volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          :value="store.settings.voiceVolume"
          aria-label="AI 음성 크기"
          @input="updateVolume"
        />
        <div class="volume-slider__labels" aria-hidden="true"><span>0%</span><span>{{ Math.round(store.settings.voiceVolume * 100) }}%</span><span>100%</span></div>
      </section>

      <section class="setting-card" aria-labelledby="speed-title">
        <div class="setting-card__heading">
          <div>
            <h3 id="speed-title">AI 음성 속도 조절</h3>
            <p>AI 안내 음성의 속도를 선택해요.</p>
          </div>
          <strong>{{ store.settings.speechRate.toFixed(1) }}배</strong>
        </div>

        <div class="choice-grid choice-grid--three" data-tutor-id="settings-voice-speed" role="group" aria-label="AI 음성 속도 선택">
          <button
            v-for="speed in speechRates"
            :key="speed"
            class="choice-button"
            :class="{ 'is-active': store.settings.speechRate === speed }"
            :aria-pressed="store.settings.speechRate === speed"
            @click="selectSpeechRate(speed)"
          >
            <strong>{{ speed.toFixed(1) }}배</strong>
            <span>{{ speed === 0.6 ? '느리게' : speed === 0.8 ? '보통' : '빠르게' }}</span>
          </button>
        </div>

        <AppButton variant="outline" @click="previewVoice">안내 음성 들어보기</AppButton>
      </section>

      <TipBox tone="yellow">이 설정은 금융한걸음 앱의 연습 화면에만 적용돼요.</TipBox>
    </main>

    <BottomNav v-model="activeTab" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/common/AppButton.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import TipBox from '@/components/common/TipBox.vue'
import { useSessionStore } from '@/stores/session'
import { useTutorStore } from '@/stores/tutor'
import { useTTS } from '@/composables/useTTS'
import type { HelpLevel, TextSize } from '@/types'

const router = useRouter()
const store = useSessionStore()
const tutor = useTutorStore()
const { speak } = useTTS()
const activeTab = ref('settings')

const textSizeOptions: { key: TextSize; label: string }[] = [
  { key: 'BASIC', label: '보통' },
  { key: 'LARGE', label: '크게' },
  { key: 'XLARGE', label: '완전 크게' }
]
const helpLevelOptions: { key: HelpLevel; label: string; description: string }[] = [
  { key: 'ADVANCED', label: '하', description: '혼자 연습' },
  { key: 'NORMAL', label: '중', description: '필요할 때 안내' },
  { key: 'BEGINNER', label: '상', description: '처음부터 안내' }
]
const speechRates = [0.6, 0.8, 1.0]

const textSizeLabel = computed(() => textSizeOptions.find((option) => option.key === store.settings.textSize)?.label || '보통')
const helpLevelLabel = computed(() => helpLevelOptions.find((option) => option.key === store.settings.helpLevel)?.label || '상')

function goHome() {
  if (tutor.walkthroughStep === 'settings') tutor.setWalkthroughStep('messages')
  router.push('/')
}
function selectTextSize(textSize: TextSize) { store.updateSettings({ textSize }) }
function selectHelpLevel(helpLevel: HelpLevel) { store.updateSettings({ helpLevel }) }
function updateVolume(event: Event) {
  const voiceVolume = Number((event.target as HTMLInputElement).value)
  store.updateSettings({ voiceVolume })
}
function selectSpeechRate(speechRate: number) { store.updateSettings({ speechRate }) }
function previewVoice() { speak('금융한걸음 앱 설정을 확인해 보세요.') }
</script>

<style scoped>
.app-settings-page { min-height: 100vh; background: var(--color-bg); }
.app-settings-content { gap: 14px; }
.setting-card { display: flex; flex-direction: column; gap: 18px; padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); box-shadow: var(--shadow-card); }
.setting-card__heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.setting-card h3 { margin: 0; font-size: var(--fs-body-lg); }
.setting-card p { margin: 5px 0 0; color: var(--color-text-secondary); font-size: var(--fs-caption); line-height: 1.45; }
.setting-card__heading > strong { flex: 0 0 auto; color: var(--color-primary); font-size: var(--fs-caption); }
.choice-grid { display: grid; gap: 8px; }
.choice-grid--three { grid-template-columns: repeat(3, 1fr); }
.choice-button { display: flex; min-height: 72px; flex-direction: column; align-items: center; justify-content: center; gap: 5px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-text-secondary); cursor: pointer; }
.choice-button.is-active { border-color: var(--color-primary); background: var(--color-primary-light); color: var(--color-primary); box-shadow: inset 0 0 0 1px var(--color-primary); }
.choice-button strong { font-size: var(--fs-body-lg); }
.choice-button span { font-size: var(--fs-caption); font-weight: 700; }
.sample-text { line-height: 1; }
.sample-text--large { font-size: 28px !important; }
.sample-text--xlarge { font-size: 34px !important; }
.volume-slider { width: 100%; accent-color: var(--color-primary); cursor: pointer; }
.volume-slider__labels { display: flex; justify-content: space-between; color: var(--color-text-muted); font-size: var(--fs-caption); }
</style>
