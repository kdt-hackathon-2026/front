<template>
  <teleport to="body">
    <div v-if="tutor.isOpen" class="tutor-overlay" aria-live="polite">
      <div class="tutor-overlay__scrim" @click="handleScrimClick" />

      <div
        v-if="targetRect"
        class="tutor-overlay__spotlight"
        :style="spotlightStyle"
        aria-hidden="true"
      />

      <div
        class="tutor-overlay__character"
        :style="characterStyle"
      >
        <MascotCharacter :size="56" talking />
      </div>

      <div class="tutor-overlay__bubble" :style="bubbleStyle" role="dialog" aria-label="AI 도우미 안내">
        <div class="tutor-overlay__header">
          <span class="tutor-overlay__title">{{ tutor.guide?.title || 'AI 도우미' }}</span>
          <button class="tutor-overlay__close" aria-label="안내 닫기" @click="tutor.close()">
            <Icon name="chevron-right" :size="16" />
          </button>
        </div>

        <p v-if="tutor.loading" class="tutor-overlay__text">안내를 준비하고 있어요…</p>
        <template v-else>
          <p class="tutor-overlay__text">
            {{ tutor.currentAction?.instruction || tutor.guide?.summary }}
          </p>
          <div v-if="totalActions > 1" class="tutor-overlay__progress">
            <span
              v-for="i in totalActions"
              :key="i"
              class="tutor-overlay__dot"
              :class="{ 'is-active': i - 1 === tutor.actionIndex }"
            />
          </div>
        </template>

        <div class="tutor-overlay__actions">
          <button v-if="tutor.actionIndex > 0" class="tutor-overlay__btn" @click="tutor.prev()">이전</button>
          <button class="tutor-overlay__btn tutor-overlay__btn--ghost" @click="tutor.close()">건너뛰기</button>
          <button class="tutor-overlay__btn tutor-overlay__btn--primary" @click="tutor.next()">
            {{ tutor.isLastAction ? '완료' : '다음' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from 'vue'
import { useTutorStore } from '@/stores/tutor'
import { useTTS } from '@/composables/useTTS'
import { getAppBounds, type AppBounds } from '@/utils/appBounds'
import MascotCharacter from './MascotCharacter.vue'
import Icon from './icons/Icon.vue'

const tutor = useTutorStore()
const { speak } = useTTS()

const HIGHLIGHT_CLASS = 'tutor-target-highlight'
let highlightedEl: HTMLElement | null = null
let locateRequestId = 0

const targetRect = ref<DOMRect | null>(null)
// #app(가운데 정렬된 480px 컬럼)의 실제 화면 영역 - 데스크톱 넓은 화면에서 오버레이가
// 브라우저 창 가장자리가 아니라 앱이 보이는 영역 안에만 위치하도록 이 기준을 씁니다.
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
})

function clearHighlight() {
  if (highlightedEl) {
    highlightedEl.classList.remove(HIGHLIGHT_CLASS)
    highlightedEl = null
  }
}

async function findTutorTarget(elementId: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await nextTick()
    const el = document.querySelector<HTMLElement>(`[data-tutor-id="${elementId}"]`)
    if (el) return el
    await new Promise((resolve) => window.setTimeout(resolve, 40))
  }
  return null
}

async function locateTarget() {
  const requestId = ++locateRequestId
  clearHighlight()
  targetRect.value = null
  const elementId = tutor.currentAction?.elementId
  if (!elementId) {
    return
  }
  const el = await findTutorTarget(elementId)
  if (el) {
    el.scrollIntoView({ behavior: 'auto', block: 'center' })
    // 스크롤 애니메이션이 끝날 시간을 살짝 준 뒤 위치를 다시 잽니다.
    await nextTick()
    if (requestId !== locateRequestId || !tutor.isOpen || !el.isConnected) return
    targetRect.value = el.getBoundingClientRect()
    el.classList.add(HIGHLIGHT_CLASS)
    highlightedEl = el
  } else {
    targetRect.value = null
  }
}

watch(
  () => [tutor.isOpen, tutor.guide, tutor.actionIndex],
  () => {
    if (tutor.isOpen) {
      locateTarget()
      const text = tutor.currentAction?.instruction || tutor.guide?.summary
      if (text && !tutor.loading) speak(text)
    } else {
      locateRequestId += 1
      clearHighlight()
      targetRect.value = null
    }
  },
  { immediate: true }
)

const totalActions = computed(() => tutor.guide?.actions.length || 0)

const characterStyle = computed<CSSProperties>(() => {
  const rect = targetRect.value
  const b = appBounds.value
  const SIZE = 56
  if (!rect) {
    // 대상 요소가 없을 때: 앱이 보이는 영역의 우측 하단(도우미 버튼 위쪽)에 위치
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
    const top = b.bottom - 20 - 170 // 대략적인 말풍선 높이만큼 위로
    return { top: `${top}px`, left: `${left}px`, right: 'auto', bottom: 'auto' }
  }
  const preferBelow = rect.bottom + 180 < b.bottom
  const top = preferBelow ? rect.bottom + 12 : Math.max(b.top + 12, rect.top - 190)
  const left = Math.min(b.right - BUBBLE_WIDTH - 12, Math.max(b.left + 12, rect.left))
  return { top: `${top}px`, left: `${left}px`, right: 'auto', bottom: 'auto' }
})

const spotlightStyle = computed<CSSProperties>(() => {
  const rect = targetRect.value
  if (!rect) return { display: 'none' }
  return {
    top: `${Math.max(0, rect.top - 4)}px`,
    left: `${Math.max(0, rect.left - 4)}px`,
    width: `${rect.width + 8}px`,
    height: `${rect.height + 8}px`
  }
})

function handleScrimClick() {
  tutor.close()
}
</script>

<style>
/* 전역 스타일: 오버레이가 가리키는 실제 화면 요소를 강조 (teleport로 body에 붙기 때문에 scoped 불가) */
.tutor-target-highlight {
  position: relative;
  z-index: 61;
  outline: 3px solid var(--color-primary, #22468c);
  outline-offset: 3px;
  border-radius: 12px;
  animation: tutor-pulse 1.2s ease-in-out infinite;
}
@keyframes tutor-pulse {
  0%, 100% { outline-color: var(--color-primary, #22468c); }
  50% { outline-color: var(--color-primary-light, #a9c2ea); }
}
</style>

<style scoped>
.tutor-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  pointer-events: none;
}
.tutor-overlay__scrim {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.12);
  pointer-events: none;
}
.tutor-overlay__spotlight {
  position: fixed;
  z-index: 62;
  border: 3px solid var(--color-primary, #22468c);
  border-radius: 12px;
  box-shadow: 0 0 0 4px rgba(34, 70, 140, 0.2);
  animation: tutor-spotlight-pulse 1.2s ease-in-out infinite;
  pointer-events: none;
}
.tutor-overlay__character {
  position: fixed;
  width: 56px;
  height: 56px;
  transition: top 0.45s cubic-bezier(0.4, 0, 0.2, 1), left 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 6px 10px rgba(20, 30, 60, 0.25));
  pointer-events: none;
}
.tutor-overlay__bubble {
  position: fixed;
  width: min(280px, calc(100vw - 32px));
  background: var(--color-surface, #fff);
  border-radius: var(--radius-md, 16px);
  box-shadow: var(--shadow-pop, 0 8px 24px rgba(20, 30, 60, 0.2));
  padding: 14px 16px;
  pointer-events: auto;
  transition: top 0.45s cubic-bezier(0.4, 0, 0.2, 1), left 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}
.tutor-overlay__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.tutor-overlay__title {
  font-weight: 800;
  font-size: var(--fs-body, 17px);
}
.tutor-overlay__close {
  border: none;
  background: var(--color-bg, #f4f6fb);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: rotate(90deg);
  color: var(--color-text-secondary, #6b7280);
}
.tutor-overlay__text {
  margin: 0 0 10px;
  font-size: var(--fs-caption, 13px);
  line-height: 1.5;
  color: var(--color-text, #1b1f27);
}
.tutor-overlay__progress {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
}
.tutor-overlay__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-border, #e2e5ec);
}
.tutor-overlay__dot.is-active {
  background: var(--color-primary, #22468c);
}
.tutor-overlay__actions {
  display: flex;
  gap: 6px;
}
.tutor-overlay__btn {
  flex: 1;
  min-height: 38px;
  border-radius: var(--radius-sm, 10px);
  border: 1px solid var(--color-border, #e2e5ec);
  background: var(--color-surface, #fff);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  color: var(--color-text, #1b1f27);
}
.tutor-overlay__btn--ghost {
  border-color: transparent;
  color: var(--color-text-muted, #9aa1ac);
}
.tutor-overlay__btn--primary {
  background: var(--color-primary, #22468c);
  color: var(--color-on-primary, #fff);
  border-color: transparent;
}
@keyframes tutor-spotlight-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.62; }
}
</style>
