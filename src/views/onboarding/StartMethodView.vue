<template>
  <div class="page">
    <AppHeader title="시작 방법" badge="처음 설정" show-back @back="router.back()" />
    <StepProgress :current="1" :total="4" />

    <div class="screen">
      <h2 class="screen-title">AI 튜터와 시작해요</h2>

      <SelectCard
        title="AI 튜터와 시작"
        subtitle="필요한 메뉴를 함께 알아봐요"
        icon="◎"
        :selected="method === 'ai'"
        @click="method = 'ai'"
      />
      <SelectCard
        title="다음 단계: 보기와 듣기 맞추기"
        subtitle="바로 화면·음성 설정으로 이동"
        icon="→"
        :selected="method === 'skip'"
        @click="method = 'skip'"
      />

      <div class="spacer" />
      <AppButton @click="next">다음: 보기와 듣기 →</AppButton>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import StepProgress from '@/components/common/StepProgress.vue'
import SelectCard from '@/components/common/SelectCard.vue'
import AppButton from '@/components/common/AppButton.vue'

const router = useRouter()
const method = ref('ai')

function next() {
  router.push('/onboarding/accessibility')
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
