<template>
  <div class="intro-motion" role="dialog" aria-label="서비스 소개 영상">
    <button class="intro-motion__skip" @click="$emit('done')">건너뛰기</button>

    <div class="intro-motion__stage">
      <MascotCharacter :size="96" class="intro-motion__mascot" talking />
      <svg class="intro-motion__rings" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="70" class="ring ring--1" />
        <circle cx="100" cy="100" r="90" class="ring ring--2" />
      </svg>
    </div>

    <h2 class="intro-motion__title">금융한걸음</h2>
    <p class="intro-motion__line">{{ currentLine }}</p>

    <div class="intro-motion__dots">
      <span v-for="i in lines.length" :key="i" class="dot" :class="{ 'is-active': i - 1 === lineIndex }" />
    </div>

    <AppButton @click="$emit('done')">시작할게요</AppButton>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import MascotCharacter from './MascotCharacter.vue'
import AppButton from './AppButton.vue'

defineEmits<{ done: [] }>()

const lines = [
  '실제 앱과 비슷한 화면으로 계좌이체를 연습해요.',
  'AI 도우미가 화면 위에서 순서대로 알려줘요.',
  '실제 돈은 이용하지 않는 가상 연습이에요.'
]
const lineIndex = ref(0)
const currentLine = computed(() => lines[lineIndex.value])

let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  timer = setInterval(() => {
    lineIndex.value = (lineIndex.value + 1) % lines.length
  }, 2200)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.intro-motion {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: linear-gradient(180deg, var(--color-primary-light), var(--color-surface));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 28px 20px 22px;
  text-align: center;
  overflow: hidden;
}
.intro-motion__skip {
  position: absolute;
  top: 12px;
  right: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.intro-motion__stage {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.intro-motion__mascot {
  position: relative;
  z-index: 2;
  animation: intro-bounce 2.4s ease-in-out infinite;
}
.intro-motion__rings {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.ring {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 2;
  opacity: 0.35;
  transform-origin: 100px 100px;
}
.ring--1 {
  animation: intro-ring 2.6s ease-out infinite;
}
.ring--2 {
  animation: intro-ring 2.6s ease-out infinite 0.5s;
}
@keyframes intro-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes intro-ring {
  0% { transform: scale(0.6); opacity: 0.5; }
  100% { transform: scale(1.15); opacity: 0; }
}
.intro-motion__title {
  margin: 0;
  font-size: var(--fs-title-lg);
  font-weight: 800;
  color: var(--color-primary-dark);
}
.intro-motion__line {
  margin: 0;
  min-height: 42px;
  font-size: var(--fs-body);
  color: var(--color-text);
  transition: opacity 0.3s ease;
}
.intro-motion__dots {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-border);
}
.dot.is-active {
  background: var(--color-primary);
}
@media (prefers-reduced-motion: reduce) {
  .intro-motion__mascot,
  .ring--1,
  .ring--2 {
    animation: none;
  }
}
</style>
