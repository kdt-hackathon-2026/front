<template>
  <svg
    :viewBox="def.viewBox"
    :width="size"
    :height="size"
    class="app-icon"
    :aria-hidden="!label"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    v-html="def.body"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ICONS, type IconName } from './registry'

const props = withDefaults(
  defineProps<{
    name: IconName | string
    size?: number | string
    label?: string
  }>(),
  {
    size: 22,
    label: ''
  }
)

const def = computed(() => ICONS[props.name] || ICONS.info)
</script>

<style scoped>
.app-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  color: inherit;
}
</style>
