<template>
  <div class="tip-box" :class="`tip-box--${tone}`">
    <span class="tip-box__icon" aria-hidden="true">{{ icon }}</span>
    <p class="tip-box__text"><slot /></p>
  </div>
</template>

<script setup>
defineProps({
  tone: { type: String, default: 'yellow' }, // yellow | success | danger
  icon: { type: String, default: '💡' }
})
</script>

<style scoped>
.tip-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  font-size: var(--fs-caption);
  line-height: 1.5;
}
.tip-box--yellow {
  background: var(--color-tip-bg);
  border: 1px solid var(--color-tip-border);
  color: var(--color-tip-text);
}
.tip-box--success {
  background: var(--color-success-bg);
  border: 1px solid var(--color-success);
  color: var(--color-success);
}
.tip-box--danger {
  background: var(--color-danger-bg);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
}
.tip-box__icon {
  font-size: 1.1em;
}
.tip-box__text {
  margin: 0;
}
</style>
