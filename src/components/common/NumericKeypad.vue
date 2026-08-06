<template>
  <div class="keypad" role="group" aria-label="숫자 입력 키패드">
    <button
      v-for="key in keys"
      :key="key.value"
      class="keypad__key"
      :class="{ 'keypad__key--action': key.action }"
      @click="handlePress(key)"
      :aria-label="key.label || key.value"
    >
      {{ key.display ?? key.value }}
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['input', 'backspace', 'clear'])

const keys = [
  { value: '1' }, { value: '2' }, { value: '3' },
  { value: '4' }, { value: '5' }, { value: '6' },
  { value: '7' }, { value: '8' }, { value: '9' },
  { value: 'clear', display: '전체삭제', action: true, label: '전체 삭제' },
  { value: '0' },
  { value: 'back', display: '⌫', action: true, label: '한 글자 삭제' }
]

function handlePress(key) {
  if (key.value === 'clear') {
    emit('clear')
  } else if (key.value === 'back') {
    emit('backspace')
  } else {
    emit('input', key.value)
  }
}
</script>

<style scoped>
.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.keypad__key {
  min-height: 56px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: var(--fs-title);
  font-weight: 700;
  color: var(--color-text);
  cursor: pointer;
}
.keypad__key:active {
  background: var(--color-primary-light);
}
.keypad__key--action {
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
  font-weight: 700;
}
</style>
