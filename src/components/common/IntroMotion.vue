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

    <AppButton @click="openConsent">시작할게요</AppButton>

    <div v-if="showConsent" class="intro-consent-modal" role="presentation" @click.self="showConsent = false">
      <section class="intro-consent" role="dialog" aria-modal="true" aria-labelledby="intro-consent-title">
        <h2 id="intro-consent-title">이용 전 안전 안내</h2>
        <p>안전한 가상 연습을 위해 아래 내용을 확인해 주세요.</p>
        <div class="intro-consent__notice">
          <strong>꼭 확인해 주세요</strong>
          <span>이 연습은 실제 계좌·송금과 관계없는 가상 연습입니다.</span>
          <span>비밀번호, OTP, 인증번호를 입력하지 않습니다.</span>
        </div>
        <label class="intro-consent__check">
          <input v-model="consentChecked" type="checkbox" />
          <span>위 내용을 확인했으며 이용에 동의합니다.</span>
        </label>
        <div class="intro-consent__actions">
          <button type="button" @click="showConsent = false">취소</button>
          <AppButton :disabled="!consentChecked" @click="confirmConsent">동의하고 시작하기</AppButton>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import MascotCharacter from './MascotCharacter.vue'
import AppButton from './AppButton.vue'

const emit = defineEmits<{ done: [] }>()

const showConsent = ref(false)
const consentChecked = ref(false)

function openConsent() {
  consentChecked.value = false
  showConsent.value = true
}

function confirmConsent() {
  if (!consentChecked.value) return
  localStorage.setItem('hangeoleum.safetyConsent', 'true')
  showConsent.value = false
  emit('done')
}

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
.intro-consent-modal {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(17, 27, 39, .52);
}
.intro-consent {
  width: min(100%, 420px);
  padding: 24px 20px 20px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  text-align: left;
  box-shadow: 0 12px 32px rgba(18, 35, 55, .22);
}
.intro-consent h2 {
  margin: 0;
  color: var(--color-primary-dark);
  font-size: var(--fs-title);
}
.intro-consent > p {
  margin: 8px 0 16px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
.intro-consent__notice {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 14px;
  border: 1px solid var(--color-tip-border);
  border-radius: var(--radius-md);
  background: var(--color-tip-bg);
  color: var(--color-tip-text);
  line-height: 1.45;
}
.intro-consent__notice strong {
  margin-bottom: 2px;
}
.intro-consent__check {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin: 18px 0;
  color: var(--color-text);
  font-weight: 700;
  line-height: 1.45;
}
.intro-consent__check input {
  width: 20px;
  height: 20px;
  flex: none;
  accent-color: var(--color-primary);
}
.intro-consent__actions {
  display: grid;
  grid-template-columns: 1fr 1.7fr;
  gap: 10px;
}
.intro-consent__actions > button {
  min-height: 48px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-weight: 700;
  cursor: pointer;
}
.intro-consent__actions :deep(.app-button) {
  width: 100%;
}
@media (prefers-reduced-motion: reduce) {
  .intro-motion__mascot,
  .ring--1,
  .ring--2 {
    animation: none;
  }
}
</style>
