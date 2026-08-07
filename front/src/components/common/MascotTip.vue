<template>
  <div class="mascot-tip">
    <MascotCharacter :size="32" class="mascot-tip__avatar" />
    <div class="mascot-tip__body">
      <p class="mascot-tip__text"><slot /></p>
      <button v-if="expandable" class="mascot-tip__more" @click="$emit('more')">
        더 듣기 <Icon name="chevron-right" :size="12" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from './icons/Icon.vue'
import MascotCharacter from './MascotCharacter.vue'

withDefaults(
  defineProps<{
    expandable?: boolean
  }>(),
  {
    expandable: false
  }
)
defineEmits<{ more: [] }>()
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
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
</style>
