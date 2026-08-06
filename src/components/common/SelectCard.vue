<template>
  <button
    class="select-card"
    :class="{ 'is-selected': selected, 'is-disabled': disabled }"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <span v-if="icon" class="select-card__icon" :style="iconBg ? { background: iconBg } : {}" aria-hidden="true">
      {{ icon }}
    </span>
    <span class="select-card__body">
      <span class="select-card__title">{{ title }}</span>
      <span v-if="subtitle" class="select-card__subtitle">{{ subtitle }}</span>
    </span>
    <span v-if="selected" class="select-card__check" aria-hidden="true">✓</span>
  </button>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  iconBg: { type: String, default: '' },
  selected: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})
defineEmits(['click'])
</script>

<style scoped>
.select-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: var(--tap-min);
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  text-align: left;
}
.select-card.is-selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.select-card.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.select-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.select-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.select-card__title {
  font-size: var(--fs-body-lg);
  font-weight: 700;
  color: var(--color-text);
}
.select-card__subtitle {
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
}
.select-card__check {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
</style>
