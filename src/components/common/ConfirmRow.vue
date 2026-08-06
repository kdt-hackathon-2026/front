<template>
  <div class="confirm-row">
    <div class="confirm-row__text">
      <span class="confirm-row__label">{{ label }}</span>
      <span class="confirm-row__value">{{ value }}</span>
    </div>
    <div class="confirm-row__actions">
      <button v-if="editable" class="confirm-row__edit" @click="$emit('edit')">수정</button>
      <button
        class="confirm-row__check"
        :class="{ 'is-checked': checked }"
        :aria-pressed="checked"
        :aria-label="`${label} 확인함`"
        @click="$emit('toggle')"
      >
        {{ checked ? '✓' : '' }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  checked: { type: Boolean, default: false },
  editable: { type: Boolean, default: true }
})
defineEmits(['toggle', 'edit'])
</script>

<style scoped>
.confirm-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}
.confirm-row:last-child {
  border-bottom: none;
}
.confirm-row__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.confirm-row__label {
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
}
.confirm-row__value {
  font-size: var(--fs-body-lg);
  font-weight: 700;
}
.confirm-row__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.confirm-row__edit {
  border: none;
  background: none;
  color: var(--color-primary);
  font-size: var(--fs-caption);
  font-weight: 700;
  cursor: pointer;
}
.confirm-row__check {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: #fff;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}
.confirm-row__check.is-checked {
  background: var(--color-success);
  border-color: var(--color-success);
}
</style>
