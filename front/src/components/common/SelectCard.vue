<template>
  <button
    class="select-card"
    :class="{ 'is-selected': selected, 'is-disabled': disabled }"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <span
      v-if="iconName || icon"
      class="select-card__icon"
      :style="iconBg ? { background: iconBg } : {}"
      aria-hidden="true"
    >
      <Icon v-if="iconName" :name="iconName" :size="20" />
      <template v-else>{{ icon }}</template>
    </span>
    <span class="select-card__body">
      <span class="select-card__title">{{ title }}</span>
      <span v-if="subtitle" class="select-card__subtitle">{{ subtitle }}</span>
    </span>
    <span v-if="selected" class="select-card__check" aria-hidden="true"><Icon name="check" :size="14" /></span>
  </button>
</template>

<script setup lang="ts">
import Icon from './icons/Icon.vue'
import type { IconName } from './icons/registry'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    /** SVG 아이콘(registry.ts)을 쓸 때 - 계좌/시나리오 아이콘 등 */
    iconName?: IconName | string
    /** 은행 이니셜처럼 짧은 글자를 그대로 보여줄 때 (SVG가 없는 경우의 대체 표시) */
    icon?: string
    iconBg?: string
    selected?: boolean
    disabled?: boolean
  }>(),
  {
    subtitle: '',
    iconName: '',
    icon: '',
    iconBg: '',
    selected: false,
    disabled: false
  }
)
defineEmits<{ click: [] }>()
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
