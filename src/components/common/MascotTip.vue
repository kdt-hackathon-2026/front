<template>
  <div class="mascot-tip">
    <span class="mascot-tip__avatar" aria-hidden="true">🐥</span>
    <div class="mascot-tip__body">
      <p class="mascot-tip__text"><slot /></p>
      <button v-if="expandable" class="mascot-tip__more" @click="$emit('more')">더 듣기 ›</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  expandable: { type: Boolean, default: false }
})
defineEmits(['more'])
</script>

<style scoped>
.mascot-tip {
  display: flex;
  gap: 12px;
  background: var(--color-mascot-bg);
  border: 1.5px solid var(--color-mascot-border);
  border-radius: var(--radius-md);
  padding: 14px;
}
.mascot-tip__avatar {
  font-size: 26px;
  flex-shrink: 0;
}
.mascot-tip__body {
  flex: 1;
}
.mascot-tip__text {
  margin: 0;
  font-size: var(--fs-body);
  color: var(--color-mascot-text);
  font-weight: 600;
  line-height: 1.5;
}
.mascot-tip__more {
  margin-top: 6px;
  border: none;
  background: none;
  padding: 0;
  font-size: var(--fs-caption);
  color: var(--color-mascot-text);
  text-decoration: underline;
  cursor: pointer;
}
</style>
