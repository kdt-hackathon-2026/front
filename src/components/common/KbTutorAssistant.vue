<template>
  <button class="kb-tutor-fab" aria-label="AI 도우미 열기" @click="openFresh">
    <MascotCharacter :size="30" />
    <span>AI 도우미</span>
  </button>

  <teleport to="body">
    <div v-if="open" class="kb-tutor-overlay" aria-live="polite">
      <div class="kb-tutor-overlay__scrim" @click="close" />

      <div class="kb-tutor-overlay__character" :style="characterStyle">
        <MascotCharacter :size="56" talking />
      </div>

      <div class="kb-tutor-overlay__bubble" :style="bubbleStyle" role="dialog" aria-label="AI 도우미 안내">
        <div class="kb-tutor-overlay__header">
          <span class="kb-tutor-overlay__title">{{ guide.title }}</span>
          <button class="kb-tutor-overlay__icon-btn" aria-label="다시 듣기" @click="replay">
            <Icon name="volume" :size="16" />
          </button>
          <button class="kb-tutor-overlay__icon-btn" aria-label="안내 닫기" @click="close">
            <Icon name="close" :size="16" />
          </button>
        </div>

        <p class="kb-tutor-overlay__text">{{ displayText }}</p>

        <div v-if="guide.steps.length > 1" class="kb-tutor-overlay__progress">
          <span
            v-for="i in guide.steps.length"
            :key="i"
            class="kb-tutor-overlay__dot"
            :class="{ 'is-active': i - 1 === stepIndex }"
          />
        </div>

        <div class="kb-tutor-overlay__actions">
          <button v-if="stepIndex > 0" class="kb-tutor-overlay__btn" @click="prev">이전</button>
          <button class="kb-tutor-overlay__btn kb-tutor-overlay__btn--ghost" @click="close">건너뛰기</button>
          <button class="kb-tutor-overlay__btn kb-tutor-overlay__btn--primary" @click="next">
            {{ isLastStep ? '완료' : '다음' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from 'vue'
import MascotCharacter from './MascotCharacter.vue'
import Icon from './icons/Icon.vue'
import { useTTS } from '@/composables/useTTS'
import { getAppBounds, type AppBounds } from '@/utils/appBounds'

const props = defineProps<{ screen: string; error?: string }>()
const { speak } = useTTS()

interface KbTutorStep { elementId?: string; instruction: string }
interface KbTutorGuide { title: string; steps: KbTutorStep[] }

// 화면(버튼)마다 실제로 눌러야 할 요소를 순서대로 안내합니다.
// elementId는 화면의 data-tutor-id 속성과 매칭됩니다.
const guides: Record<string, KbTutorGuide> = {
  home: {
    title: '은행 홈',
    steps: [{ elementId: 'transfer-practice-button', instruction: '노란색 계좌이체 버튼을 누르면 이체 연습을 시작할 수 있어요.' }]
  },
  menu: {
    title: '전체 메뉴',
    steps: [{ elementId: 'kb-menu-transfer', instruction: '맨 아래 이체/출금 버튼을 누르면 바로 이체를 시작할 수 있어요.' }]
  },
  settings: {
    title: '환경설정',
    steps: [{ elementId: 'kb-easy-settings-link', instruction: '간편모드/큰글씨 뱅킹 설정 버튼을 누르면 화면을 더 크고 쉽게 바꿀 수 있어요.' }]
  },
  'settings-detail': {
    title: '상세 설정',
    steps: [{ elementId: 'kb-large-text-link', instruction: '큰글씨 뱅킹 설정 버튼을 누르면 글씨 크기를 조절할 수 있어요.' }]
  },
  'easy-settings': {
    title: '보기 설정',
    steps: [
      { elementId: 'kb-easy-mode-toggle', instruction: '이 스위치를 누르면 간편모드를 켜고 끌 수 있어요.' },
      { elementId: 'kb-large-text-toggle', instruction: '이 스위치를 누르면 큰글씨 뱅킹을 켜고 끌 수 있어요.' },
      { elementId: 'kb-easy-settings-save', instruction: '설정을 마쳤으면 아래 저장 버튼을 눌러주세요.' }
    ]
  },
  'transfer-start': {
    title: '받는 계좌 입력',
    steps: [{ elementId: 'kb-recipient-account', instruction: '계좌번호 입력 칸을 누르면 번호를 입력할 수 있어요.' }]
  },
  'transfer-input': {
    title: '계좌번호 입력',
    steps: [
      { elementId: 'kb-sample-account-button', instruction: '연습용 계좌번호를 한 번에 넣으려면 자동 입력 버튼을 누르세요.' },
      { elementId: 'kb-numeric-keypad', instruction: '직접 입력하려면 숫자 키패드를 한 자리씩 눌러주세요.' },
      { elementId: 'kb-account-confirm', instruction: '계좌번호를 다 입력했으면 계좌 확인 버튼을 눌러주세요.' }
    ]
  },
  amount: {
    title: '보낼 금액 입력',
    steps: [
      { elementId: 'kb-quick-amount', instruction: '빠른 금액 버튼을 누르면 쉽게 금액을 넣을 수 있어요.' },
      { elementId: 'kb-amount-keypad', instruction: '직접 입력하려면 숫자 키패드를 눌러주세요.' },
      { elementId: 'kb-amount-confirm', instruction: '금액을 다 넣었으면 받는 분 확인 버튼을 눌러주세요.' }
    ]
  },
  recipient: {
    title: '최종 확인',
    steps: [{ elementId: 'kb-transfer-submit', instruction: '받는 분, 은행, 금액을 확인했으면 이체 버튼을 눌러주세요.' }]
  },
  done: {
    title: '이체 완료',
    steps: [{ elementId: 'kb-done-confirm', instruction: '확인 버튼을 누르면 홈 화면으로 돌아가요.' }]
  },
  history: {
    title: '거래내역',
    steps: [{ elementId: 'kb-history-transfer', instruction: '이체 버튼을 누르면 다시 이체를 시작할 수 있어요.' }]
  }
}

const open = ref(false)
const stepIndex = ref(0)
const errorText = ref('')

const guide = computed(() => guides[props.screen] || guides.home)
const currentStep = computed(() => guide.value.steps[stepIndex.value] || guide.value.steps[0])
const isLastStep = computed(() => stepIndex.value >= guide.value.steps.length - 1)
const displayText = computed(() => errorText.value || currentStep.value?.instruction || '')

const HIGHLIGHT_CLASS = 'tutor-target-highlight'
let highlightedEl: HTMLElement | null = null

const targetRect = ref<DOMRect | null>(null)
const appBounds = ref<AppBounds>(getAppBounds())

function refreshAppBounds() {
  appBounds.value = getAppBounds()
}

onMounted(() => {
  refreshAppBounds()
  window.addEventListener('resize', refreshAppBounds)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', refreshAppBounds)
  clearHighlight()
})

function clearHighlight() {
  if (highlightedEl) {
    highlightedEl.classList.remove(HIGHLIGHT_CLASS)
    highlightedEl = null
  }
}

async function locateTarget() {
  clearHighlight()
  const elementId = currentStep.value?.elementId
  if (!elementId) {
    targetRect.value = null
    return
  }
  await nextTick()
  const el = document.querySelector<HTMLElement>(`[data-tutor-id="${elementId}"]`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    await new Promise((r) => setTimeout(r, 220))
    targetRect.value = el.getBoundingClientRect()
    el.classList.add(HIGHLIGHT_CLASS)
    highlightedEl = el
  } else {
    targetRect.value = null
  }
}

function openFresh() {
  stepIndex.value = 0
  errorText.value = ''
  open.value = true
}

function close() {
  open.value = false
  clearHighlight()
}

function replay() {
  speak(displayText.value)
}

function next() {
  errorText.value = ''
  if (!isLastStep.value) stepIndex.value += 1
  else close()
}

function prev() {
  errorText.value = ''
  if (stepIndex.value > 0) stepIndex.value -= 1
}

// 화면이 바뀔 때마다 그 화면에서 눌러야 할 첫 버튼을 자동으로 다시 안내합니다.
watch(
  () => props.screen,
  () => {
    stepIndex.value = 0
    errorText.value = ''
    open.value = true
  },
  { immediate: true }
)

watch(
  () => props.error,
  (message) => {
    if (message) {
      errorText.value = message
      open.value = true
      speak(message)
    }
  }
)

watch(
  [open, currentStep],
  () => {
    if (open.value) {
      locateTarget()
      if (!errorText.value) speak(currentStep.value?.instruction)
    } else {
      clearHighlight()
    }
  },
  { immediate: true }
)

const characterStyle = computed<CSSProperties>(() => {
  const rect = targetRect.value
  const b = appBounds.value
  const SIZE = 56
  if (!rect) {
    const left = b.right - SIZE - 20
    const top = b.bottom - SIZE - 96
    return { top: `${top}px`, left: `${left}px`, right: 'auto', bottom: 'auto' }
  }
  const top = Math.max(b.top + 12, rect.top - 40)
  const left = Math.min(b.right - SIZE - 12, Math.max(b.left + 12, rect.left + rect.width / 2 - 28))
  return { top: `${top}px`, left: `${left}px`, right: 'auto', bottom: 'auto' }
})

const bubbleStyle = computed<CSSProperties>(() => {
  const rect = targetRect.value
  const b = appBounds.value
  const BUBBLE_WIDTH = 280
  if (!rect) {
    const left = b.right - BUBBLE_WIDTH - 16
    const top = b.bottom - 20 - 190
    return { top: `${top}px`, left: `${left}px`, right: 'auto', bottom: 'auto' }
  }
  const preferBelow = rect.bottom + 200 < b.bottom
  const top = preferBelow ? rect.bottom + 12 : Math.max(b.top + 12, rect.top - 210)
  const left = Math.min(b.right - BUBBLE_WIDTH - 12, Math.max(b.left + 12, rect.left))
  return { top: `${top}px`, left: `${left}px`, right: 'auto', bottom: 'auto' }
})
</script>

<style>
/* teleport로 body에 붙기 때문에 scoped를 쓸 수 없는 전역 하이라이트 스타일 */
.tutor-target-highlight {
  position: relative;
  z-index: 61;
  outline: 3px solid var(--color-primary, #22468c);
  outline-offset: 3px;
  border-radius: 12px;
  animation: kb-tutor-pulse 1.2s ease-in-out infinite;
}
@keyframes kb-tutor-pulse {
  0%, 100% { outline-color: var(--color-primary, #22468c); }
  50% { outline-color: var(--color-primary-light, #a9c2ea); }
}
</style>

<style scoped>
.kb-tutor-fab {
  position: fixed;
  right: max(16px, calc((100vw - 480px) / 2 + 16px));
  bottom: 18px;
  z-index: 24;
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 52px;
  padding: 8px 16px 8px 10px;
  border: 0;
  border-radius: 999px;
  background: var(--color-primary, #22468c);
  color: #fff;
  box-shadow: 0 8px 24px #14203c38;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}
.kb-tutor-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  pointer-events: none;
}
.kb-tutor-overlay__scrim {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.12);
  pointer-events: auto;
}
.kb-tutor-overlay__character {
  position: fixed;
  width: 56px;
  height: 56px;
  transition: top 0.45s cubic-bezier(0.4, 0, 0.2, 1), left 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 6px 10px rgba(20, 30, 60, 0.25));
  pointer-events: none;
}
.kb-tutor-overlay__bubble {
  position: fixed;
  width: min(280px, calc(100vw - 32px));
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(20, 30, 60, 0.2);
  padding: 14px 16px;
  pointer-events: auto;
  transition: top 0.45s cubic-bezier(0.4, 0, 0.2, 1), left 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}
.kb-tutor-overlay__header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.kb-tutor-overlay__title {
  flex: 1;
  font-weight: 800;
  font-size: 15px;
  color: #1b1f27;
}
.kb-tutor-overlay__icon-btn {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 50%;
  background: #f4f6fb;
  color: #6b7280;
  cursor: pointer;
}
.kb-tutor-overlay__text {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.5;
  color: #1b1f27;
}
.kb-tutor-overlay__progress {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
}
.kb-tutor-overlay__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e2e5ec;
}
.kb-tutor-overlay__dot.is-active {
  background: var(--color-primary, #22468c);
}
.kb-tutor-overlay__actions {
  display: flex;
  gap: 6px;
}
.kb-tutor-overlay__btn {
  flex: 1;
  min-height: 38px;
  border-radius: 10px;
  border: 1px solid #e2e5ec;
  background: #fff;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  color: #1b1f27;
}
.kb-tutor-overlay__btn--ghost {
  border-color: transparent;
  color: #9aa1ac;
}
.kb-tutor-overlay__btn--primary {
  background: var(--color-primary, #22468c);
  color: #fff;
  border-color: transparent;
}
</style>
