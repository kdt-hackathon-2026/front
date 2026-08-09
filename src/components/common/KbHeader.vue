<template>
  <header class="kb-header">
    <button class="header-back" aria-label="뒤로가기" @click="emit('back')"><Icon name="chevron-left" :size="28" /></button>
    <h1>{{ title }}</h1>
    <button v-if="cancel" class="header-cancel" @click="emit('back')">취소</button>
    <div v-else class="header-tools">
      <button aria-label="은행 홈" @click="emit('home')"><Icon name="home" :size="23" /></button>
      <button aria-label="전체 메뉴" @click="emit('menu')"><Icon name="menu" :size="23" /></button>
    </div>
  </header>
</template>

<script setup lang="ts">
import Icon from './icons/Icon.vue'
defineProps<{ title: string; cancel?: boolean }>()
const emit = defineEmits<{ back: []; home: []; menu: [] }>()
</script>

<style scoped>
.kb-header{display:flex;align-items:center;min-height:68px;padding:0 18px;border-bottom:1px solid #e7eaec;background:#fff}.kb-header h1{flex:1;margin:0 14px;font-size:1.18em;font-weight:650}.kb-header button{display:grid;place-items:center;min-width:44px;min-height:44px;border:0;background:transparent;color:inherit;cursor:pointer}.header-cancel{color:#59616a!important;font:inherit}.header-tools{display:flex;gap:4px}
</style>
