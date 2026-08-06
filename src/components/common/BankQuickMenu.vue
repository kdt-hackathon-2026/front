<template>
  <div class="quick-menu">
    <button
      v-for="(label, i) in items"
      :key="label"
      class="quick-menu__item"
      :class="{ 'is-active': label === active }"
      @click="$emit('select', label)"
    >
      <span class="quick-menu__icon" aria-hidden="true">{{ ICONS[i % ICONS.length] }}</span>
      <span class="quick-menu__label">{{ label }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
  active: { type: String, default: '' }
})
defineEmits(['select'])

const ICONS = ['🔍', '⇄', '＋', '📊', '≡']
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
