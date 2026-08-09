<template>
  <div class="tip-box" :class="`tip-box--${tone}`">
    <span class="tip-box__icon" aria-hidden="true"><Icon :name="resolvedIcon" :size="16" /></span>
    <p class="tip-box__text"><slot /></p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from './icons/Icon.vue'
import type { IconName } from './icons/registry'

const props = withDefaults(
  defineProps<{
    tone?: 'yellow' | 'success' | 'danger'
    icon?: IconName | string
  }>(),
  {
    tone: 'yellow',
    icon: ''
  }
)

const TONE_DEFAULT_ICON: Record<string, IconName> = {
  yellow: 'info',
  success: 'check-circle',
  danger: 'alert-triangle'
}
const resolvedIcon = computed(() => props.icon || TONE_DEFAULT_ICON[props.tone] || 'info')
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
