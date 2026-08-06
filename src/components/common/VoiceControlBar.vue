<template>
  <div class="voice-bar" role="group" aria-label="음성 안내 제어">
    <button class="voice-bar__btn" @click="$emit('replay')" aria-label="다시 듣기">
      ↺ <span>다시 듣기</span>
    </button>
    <button class="voice-bar__btn voice-bar__btn--main" @click="$emit('toggle')" :aria-label="isSpeaking ? '일시정지' : '재생'">
      {{ isSpeaking ? '⏸' : '▶' }} <span>{{ isSpeaking ? '일시정지' : '음성 듣기' }}</span>
    </button>
    <button class="voice-bar__btn" @click="$emit('speed')" aria-label="재생 속도 변경">
      🐢 <span>{{ speed }}배속</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  isSpeaking: { type: Boolean, default: false },
  speed: { type: Number, default: 0.8 }
})
defineEmits(['toggle', 'replay', 'speed'])
</script>

<style scoped>
.voice-bar {
  display: flex;
  gap: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 8px;
}
.voice-bar__btn {
  flex: 1;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  font-size: var(--fs-caption);
  font-weight: 700;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.voice-bar__btn--main {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
</style>
