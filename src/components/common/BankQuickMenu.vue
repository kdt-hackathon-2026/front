<template>
  <div class="quick-menu">
    <button
      v-for="(label, i) in items"
      :key="label"
      class="quick-menu__item"
      :class="{ 'is-active': label === active }"
      @click="$emit('select', label)"
    >
      <span class="quick-menu__icon" aria-hidden="true"><Icon :name="icons[i % icons.length] || 'menu'" :size="18" /></span>
      <span class="quick-menu__label">{{ label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import Icon from './icons/Icon.vue'
import type { IconName } from './icons/registry'

withDefaults(
  defineProps<{
    items: string[]
    active?: string
    icons?: IconName[]
  }>(),
  {
    active: '',
    icons: () => ['search', 'transfer', 'plus', 'chart', 'menu']
  }
)
defineEmits<{ select: [label: string] }>()
</script>

<style scoped>
.quick-menu {
  display: flex;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 10px 6px;
}
.quick-menu__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: none;
  background: none;
  padding: 6px 2px;
  cursor: pointer;
}
.quick-menu__icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.quick-menu__item.is-active .quick-menu__icon {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.quick-menu__label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
}
</style>
