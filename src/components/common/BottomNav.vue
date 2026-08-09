<template>
  <nav class="bottom-nav" aria-label="주요 메뉴">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="bottom-nav__item"
      :class="{ 'is-active': modelValue === tab.key }"
      :data-tutor-id="tab.tutorId"
      @click="selectTab(tab.key)"
    >
      <span class="bottom-nav__icon" aria-hidden="true"><Icon :name="tab.icon" :size="24" /></span>
      <span class="bottom-nav__label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import Icon from './icons/Icon.vue'
import { useRouter } from 'vue-router'
import type { IconName } from './icons/registry'
import { useTutorStore } from '@/stores/tutor'

withDefaults(
  defineProps<{
    modelValue?: string
  }>(),
  {
    modelValue: 'home'
  }
)
const emit = defineEmits<{ 'update:modelValue': [key: string] }>()
const router = useRouter()
const tutor = useTutorStore()

const tabs: { key: string; icon: IconName; label: string; tutorId: string }[] = [
  { key: 'messages', icon: 'document', label: '메시지', tutorId: 'messages-tab' },
  { key: 'home', icon: 'home', label: '홈', tutorId: 'home-tab' },
  { key: 'settings', icon: 'settings', label: '설정', tutorId: 'settings-tab' }
]

function selectTab(key: string) {
  emit('update:modelValue', key)
  if (key === 'messages') router.push('/messages')
  if (key === 'home') {
    if (tutor.walkthroughStep === 'settings') tutor.setWalkthroughStep('messages')
    if (tutor.walkthroughStep === 'message-home') tutor.setWalkthroughStep('home-transfer')
    tutor.close()
    router.push('/')
  }
  if (key === 'settings') router.push('/settings')
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 50%;
  width: min(100%, 480px);
  transform: translateX(-50%);
  bottom: 0;
  display: flex;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
  z-index: 30;
  box-shadow: 0 -4px 14px rgba(20, 30, 60, 0.08);
}
.bottom-nav__item {
  flex: 1;
  border: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 0;
  color: var(--color-text-muted);
  cursor: pointer;
  min-height: 68px;
}
.bottom-nav__item.is-active {
  color: var(--color-primary);
  font-weight: 700;
}
.bottom-nav__icon {
  display: flex;
}
.bottom-nav__label {
  font-size: var(--fs-body);
}
</style>
