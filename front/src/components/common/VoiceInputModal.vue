<template>
  <div v-if="modelValue" class="voice-modal__overlay" @click.self="close">
    <div class="voice-modal" role="dialog" aria-modal="true" aria-label="말하기 인식">
      <div class="voice-modal__header">
        <span class="voice-modal__title">말하기 인식</span>
        <span class="voice-modal__badge">음성 입력</span>
      </div>

      <div class="voice-modal__hint mascot-tip-like">
        <MascotCharacter :size="28" />
        <p>천천히 말씀하셔도 기다릴게요.<br />예: "KB국민은행 김하나 오만 원"</p>
      </div>

      <div class="voice-modal__mic" :class="{ 'is-listening': isListening }">
        <Icon name="mic" :size="34" />
      </div>
      <p class="voice-modal__status">{{ statusText }}</p>

      <div v-if="transcript" class="voice-modal__transcript">
        <p>화면에 이렇게 확인됩니다</p>
        <strong>{{ transcript }}</strong>
      </div>

      <div class="voice-modal__actions">
        <AppButton variant="outline" @click="retry">다시 말하기</AppButton>
        <AppButton variant="primary" :disabled="!transcript" @click="confirm">확인</AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppButton from './AppButton.vue'
import Icon from './icons/Icon.vue'
import MascotCharacter from './MascotCharacter.vue'
import { useSTT } from '@/composables/useSTT'

withDefaults(
  defineProps<{
    modelValue?: boolean
  }>(),
  {
    modelValue: false
  }
)
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; result: [text: string] }>()

const { start, stop, isListening, transcript, isSupported } = useSTT()

const statusText = computed(() => {
  if (!isSupported) return '이 브라우저는 음성 인식을 지원하지 않아요. 버튼으로 입력해 주세요.'
  if (isListening.value) return '듣고 있어요…'
  if (transcript.value) return '인식 결과를 확인해 주세요.'
  return '마이크 버튼을 눌러 말씀해 주세요.'
})

function close() {
  stop()
  emit('update:modelValue', false)
}
function retry() {
  start({ onError: () => {} })
}
function confirm() {
  emit('result', transcript.value)
  close()
}
</script>

<style scoped>
.voice-modal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 50;
}
.voice-modal {
  width: 100%;
  max-width: 480px;
  background: var(--color-surface);
  border-radius: 24px 24px 0 0;
  padding: 20px 20px calc(20px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.voice-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.voice-modal__title {
  font-size: var(--fs-title);
  font-weight: 800;
}
.voice-modal__badge {
  font-size: var(--fs-caption);
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 999px;
  padding: 4px 10px;
  font-weight: 700;
}
.mascot-tip-like {
  display: flex;
  gap: 10px;
  background: var(--color-mascot-bg);
  border: 1.5px solid var(--color-mascot-border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: var(--fs-caption);
  color: var(--color-mascot-text);
}
.mascot-tip-like p {
  margin: 0;
  line-height: 1.5;
}
.voice-modal__mic {
  width: 88px;
  height: 88px;
  margin: 8px auto 0;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
}
.voice-modal__mic.is-listening {
  animation: pulse 1.1s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 70, 140, 0.25); }
  50% { box-shadow: 0 0 0 14px rgba(34, 70, 140, 0); }
}
.voice-modal__status {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--fs-body);
  margin: 0;
}
.voice-modal__transcript {
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
}
.voice-modal__transcript strong {
  display: block;
  margin-top: 4px;
  font-size: var(--fs-body-lg);
  color: var(--color-text);
}
.voice-modal__actions {
  display: flex;
  gap: 10px;
}
</style>
