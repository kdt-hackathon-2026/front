<template>
  <div class="step-progress">
    <div class="step-progress__label">{{ current }}/{{ total }} 단계</div>
    <div class="step-progress__track" role="progressbar" :aria-valuenow="current" :aria-valuemin="1" :aria-valuemax="total">
      <div
        v-for="i in total"
        :key="i"
        class="step-progress__dot"
        :class="{ 'is-done': i <= current }"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  current: { type: Number, required: true },
  total: { type: Number, required: true }
})
</script>

<style scoped>
.step-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px 0;
}
.step-progress__label {
  font-size: var(--fs-caption);
  font-weight: 700;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.step-progress__track {
  flex: 1;
  display: flex;
  gap: 6px;
}
.step-progress__dot {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: var(--color-border);
}
.step-progress__dot.is-done {
  background: var(--color-primary);
}
</style>
