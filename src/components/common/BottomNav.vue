<template>
  <nav class="bottom-nav" aria-label="주요 메뉴">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="bottom-nav__item"
      :class="{ 'is-active': modelValue === tab.key }"
      @click="$emit('update:modelValue', tab.key)"
    >
      <span class="bottom-nav__icon" aria-hidden="true">{{ tab.icon }}</span>
      <span class="bottom-nav__label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: 'home' }
})
defineEmits(['update:modelValue'])

const tabs = [
  { key: 'record', icon: '📋', label: '실습하기' },
  { key: 'home', icon: '⌂', label: '홈' },
  { key: 'settings', icon: '⚙', label: '설정' }
]
</script>

<style scoped>
.bottom-nav {
  position: sticky;
  bottom: 0;
  display: flex;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
}
.bottom-nav__item {
  flex: 1;
  border: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 0;
  color: var(--color-text-muted);
  cursor: pointer;
  min-height: var(--tap-min);
}
.bottom-nav__item.is-active {
  color: var(--color-primary);
  font-weight: 700;
}
.bottom-nav__icon {
  font-size: 20px;
}
.bottom-nav__label {
  font-size: var(--fs-caption);
}
</style>
