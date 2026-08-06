<template>
  <button
    v-if="visible"
    class="ai-fab"
    aria-label="AI 튜터 불러오기"
    @click="$emit('click')"
  >
    <span class="ai-fab__icon" aria-hidden="true">🐥</span>
    <span class="ai-fab__label">AI 도우미</span>
  </button>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: true }
})
defineEmits(['click'])
</script>

<style scoped>
.ai-fab {
  position: fixed;
  right: max(16px, calc((100vw - 480px) / 2 + 16px));
  bottom: 20px;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 48px;
  padding: 10px 16px 10px 12px;
  border: none;
  border-radius: 999px;
  background: var(--color-primary);
  color: var(--color-on-primary, #fff);
  box-shadow: var(--shadow-pop);
  cursor: pointer;
  font-weight: 800;
  font-size: var(--fs-caption);
}
.ai-fab:active {
  transform: scale(0.97);
}
.ai-fab__icon {
  font-size: 20px;
}
</style>
