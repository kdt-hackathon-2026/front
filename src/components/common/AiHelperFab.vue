<template>
  <div v-if="visible" class="ai-fab-wrap" :style="fabStyle">
    <p class="ai-fab__tip">사용 방법이 궁금하면<br />AI 도우미를 눌러보세요</p>
    <button
    class="ai-fab"
    :class="{ 'is-dragging': dragging }"
    aria-label="AI 튜터 불러오기"
    data-tutor-id="ai-helper-fab"
    @click="handleClick"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
  >
      <MascotCharacter :size="44" />
    <span class="ai-fab__label">AI 도우미</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MascotCharacter from './MascotCharacter.vue'

withDefaults(defineProps<{ visible?: boolean }>(), {
  visible: true
})
const emit = defineEmits<{ click: [] }>()

const offset = ref({ x: 0, y: 0 })
const dragging = ref(false)
const suppressClick = ref(false)
let pointerStart = { x: 0, y: 0 }
let offsetStart = { x: 0, y: 0 }
let basePosition = { left: 0, top: 0, width: 0, height: 0 }
let moved = false

const fabStyle = computed(() => ({
  transform: `translate3d(${offset.value.x}px, ${offset.value.y}px, 0)`
}))

function handlePointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  const button = event.currentTarget as HTMLElement
  const wrap = button.closest('.ai-fab-wrap') as HTMLElement | null
  if (!wrap) return

  const rect = wrap.getBoundingClientRect()
  pointerStart = { x: event.clientX, y: event.clientY }
  offsetStart = { ...offset.value }
  basePosition = {
    left: rect.left - offsetStart.x,
    top: rect.top - offsetStart.y,
    width: rect.width,
    height: rect.height
  }
  moved = false
  dragging.value = true
  button.setPointerCapture?.(event.pointerId)
}

function handlePointerMove(event: PointerEvent) {
  if (!dragging.value) return
  const dx = event.clientX - pointerStart.x
  const dy = event.clientY - pointerStart.y
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true

  const minX = 8 - basePosition.left
  const maxX = window.innerWidth - basePosition.width - 8 - basePosition.left
  const minY = 8 - basePosition.top
  const maxY = window.innerHeight - basePosition.height - 8 - basePosition.top
  offset.value = {
    x: Math.min(Math.max(offsetStart.x + dx, minX), Math.max(minX, maxX)),
    y: Math.min(Math.max(offsetStart.y + dy, minY), Math.max(minY, maxY))
  }
  event.preventDefault()
}

function handlePointerUp(event: PointerEvent) {
  if (!dragging.value) return
  const button = event.currentTarget as HTMLElement
  if (button.hasPointerCapture?.(event.pointerId)) button.releasePointerCapture(event.pointerId)
  dragging.value = false
  if (moved) {
    suppressClick.value = true
    window.setTimeout(() => { suppressClick.value = false }, 0)
  }
}

function handleClick() {
  if (suppressClick.value) {
    suppressClick.value = false
    return
  }
  emit('click')
}
</script>

<style scoped>
.ai-fab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 64px;
  padding: 8px 32px 8px 20px;
  border: none;
  border-radius: 999px;
  background: var(--color-primary);
  color: var(--color-on-primary, #fff);
  box-shadow: var(--shadow-pop);
  cursor: pointer;
  touch-action: none;
  user-select: none;
  font-weight: 800;
  font-size: var(--fs-body);
}
.ai-fab.is-dragging {
  cursor: grabbing;
}
.ai-fab-wrap {
  position: fixed;
  right: max(16px, calc((100vw - 480px) / 2 + 16px));
  bottom: calc(98px + env(safe-area-inset-bottom));
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  will-change: transform;
}
.ai-fab__tip {
  margin: 0;
  padding: 10px 14px;
  border: 1px solid var(--color-primary-light);
  border-radius: 14px;
  background: var(--color-surface);
  color: var(--color-primary-dark);
  box-shadow: var(--shadow-card);
  font-size: var(--fs-caption);
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
}
.ai-fab:active {
  transform: scale(0.97);
}
</style>
