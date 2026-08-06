<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade-slide" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </router-view>

  <!-- 모든 주요 화면에서 AI 튜터를 바로 부를 수 있게 항상 떠 있는 도우미 버튼 (기능명세 1.40) -->
  <AiHelperFab :visible="showAiFab" @click="callAiTutor" />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import AiHelperFab from '@/components/common/AiHelperFab.vue'

const store = useSessionStore()
const route = useRoute()
const router = useRouter()

const showAiFab = computed(() => route.name !== 'ai-tutor')

function callAiTutor() {
  router.push('/ai-tutor')
}

onMounted(() => {
  // 로컬 저장된 접근성/은행 설정 복원 (앱 재진입 시)
  store.restoreFromLocalStorage()
})
</script>

<style>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.18s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
}
</style>
