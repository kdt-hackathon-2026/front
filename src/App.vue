<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade-slide" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </router-view>

  <!-- 모든 화면 위를 돌아다니며 순서대로 안내하는 AI 도우미 오버레이 (기능명세 8.x / AI 튜터 API) -->
  <template v-if="!isKbTransfer">
    <TutorOverlay />
    <AiHelperFab :visible="showAiFab" @click="tutor.openForScreen(screenForCurrentRoute(route), { force: true })" />
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { useTutorStore } from '@/stores/tutor'
import { screenForCurrentRoute } from '@/router/screenMap'
import AiHelperFab from '@/components/common/AiHelperFab.vue'
import TutorOverlay from '@/components/common/TutorOverlay.vue'

const store = useSessionStore()
const tutor = useTutorStore()
const route = useRoute()

const showAiFab = computed(() => route.name !== 'ai-tutor')
const isKbTransfer = computed(() => route.name === 'kb-transfer')

onMounted(() => {
  // 로컬 저장된 접근성/은행 설정 복원 (앱 재진입 시)
  store.restoreFromLocalStorage()
})

const FONT_SCALE = { BASIC: 1, LARGE: 1.15, XLARGE: 1.3 } as const
watch(
  () => store.settings.textSize,
  (size) => document.documentElement.style.setProperty('--font-scale', String(FONT_SCALE[size] || 1)),
  { immediate: true }
)

// 화면(이체연습 1~5단계 포함)이 바뀔 때마다 AI 도우미가 그 화면에 맞는 안내를
// (화면당 세션에서 처음 한 번) 자동으로 보여줍니다. together-step/practice-step처럼
// route.name은 그대로고 params.n만 바뀌는 경우도 놓치지 않도록 fullPath를 감시합니다.
watch(
  () => route.fullPath,
  () => {
    if (isKbTransfer.value) {
      tutor.close()
      return
    }
    if (!route.name) return
    tutor.openForScreen(screenForCurrentRoute(route))
  },
  { immediate: true }
)
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
