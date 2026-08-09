<template>
  <div class="amount-adjust">
    <button
      v-for="opt in options"
      :key="opt.label"
      class="amount-adjust__btn"
      @click="$emit('adjust', opt)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
export interface AmountAdjustOption {
  label: string
  type: 'add' | 'subtract' | 'all'
  value?: number
}

withDefaults(
  defineProps<{
    options?: AmountAdjustOption[]
  }>(),
  {
    // 각 항목: { label: '+10만', type: 'add'|'subtract'|'all', value: 100000 }
    options: () => [
      { label: '+10만', type: 'add', value: 100000 },
      { label: '+5만', type: 'add', value: 50000 },
      { label: '-5만', type: 'subtract', value: 50000 },
      { label: '+1만', type: 'add', value: 10000 },
      { label: '전액', type: 'all' }
    ]
  }
)
defineEmits<{ adjust: [option: AmountAdjustOption] }>()
</script>

<style scoped>
.amount-adjust {
  display: flex;
  gap: 6px;
}
.amount-adjust__btn {
  flex: 1;
  min-height: 44px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 700;
  font-size: var(--fs-caption);
  cursor: pointer;
}
.amount-adjust__btn:active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}
</style>
