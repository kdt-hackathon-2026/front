<template>
  <button
    class="app-btn"
    :class="[`app-btn--${variant}`, { 'app-btn--block': block, 'app-btn--disabled': disabled }]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <span v-if="icon" class="app-btn__icon" aria-hidden="true">{{ icon }}</span>
    <span class="app-btn__label"><slot /></span>
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost | outline
  block: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  icon: { type: String, default: '' }
})
defineEmits(['click'])
</script>

<style scoped>
.app-btn {
  min-height: var(--tap-min);
  border-radius: var(--radius-md);
  font-size: var(--fs-body-lg);
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  transition: transform 0.06s ease, opacity 0.15s ease, background 0.15s ease;
}
.app-btn:active {
  transform: scale(0.98);
}
.app-btn--block {
  width: 100%;
}
.app-btn--primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.app-btn--primary:hover {
  background: var(--color-primary-dark);
}
.app-btn--secondary {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.app-btn--outline {
  background: #fff;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}
.app-btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
}
.app-btn--disabled,
.app-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.app-btn__icon {
  font-size: 1.15em;
  line-height: 1;
}
</style>
