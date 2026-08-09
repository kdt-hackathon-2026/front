<template>
  <div class="home">
    <AppHeader title="금융한걸음" badge="가상 연습" />

    <div class="screen">
      <IntroMotion v-if="showIntro" @done="dismissIntro" />

      <template v-else>
        <h2 class="screen-title">무엇을 연습할까요?</h2>
        <p class="screen-subtitle">필요한 기능만 크게 보여드려요.</p>

        <button class="hero-card" data-tutor-id="transfer-practice-button" @click="goTransferPractice">
          <span class="hero-card__icon" aria-hidden="true"><Icon name="transfer" :size="28" /></span>
          <span class="hero-card__text">
            <strong>계좌이체 연습</strong>
            <small>천천히 5단계로 연습</small>
          </span>
        </button>

        <div class="status-strip">
          <span>주거래 은행 <strong>{{ store.selectedBank.bankName }}</strong></span>
          <span>도움 수준 <strong>{{ helpLevelLabel }}</strong></span>
          <button class="status-strip__link" @click="router.push('/onboarding/bank')">변경</button>
        </div>

        <button v-if="store.onboardingDone" class="link-line" @click="router.push('/together')">
          처음 배우기(AI와 함께) 다시 해보기
        </button>

        <TipBox tone="yellow">가상 연습입니다. 실제 돈은 이용하지 않아요.</TipBox>

        <div v-if="resumePractice" class="resume-card">
          <p class="resume-card__title">이어서 연습할까요?</p>
          <p class="resume-card__desc">{{ resumePractice.scenarioTitle }} · 진행률 {{ resumePractice.progressRate }}%</p>
          <AppButton variant="outline" @click="resume">이어하기</AppButton>
        </div>
      </template>
    </div>

    <BottomNav v-model="activeTab" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import AppButton from '@/components/common/AppButton.vue'
import TipBox from '@/components/common/TipBox.vue'
import Icon from '@/components/common/icons/Icon.vue'
import IntroMotion from '@/components/common/IntroMotion.vue'
import { useSessionStore } from '@/stores/session'
import { fetchHome } from '@/api/homeApi'
import { stepIndexForCode } from '@/router/screenMap'
import type { HelpLevel, ResumePractice } from '@/types'

const router = useRouter()
const store = useSessionStore()
const activeTab = ref('home')

const showIntro = ref(false)
const resumePractice = ref<ResumePractice | null>(null)

const HELP_LEVEL_LABEL: Record<HelpLevel, string> = {
  BEGINNER: '처음 연습',
  NORMAL: '도움 받으며',
  ADVANCED: '혼자 연습'
}
const helpLevelLabel = computed(() => HELP_LEVEL_LABEL[store.settings.helpLevel] || '도움 받으며')

onMounted(async () => {
  const home = await fetchHome()
  resumePractice.value = home.resumePractice
  // 처음 방문이거나, 아직 소개 모션을 안 본 경우에만 보여줍니다.
  showIntro.value = home.isFirstVisit || !store.introVideoSeen
})

function dismissIntro() {
  showIntro.value = false
  store.markIntroVideoSeen()
}

function goTransferPractice() {
  // 온보딩을 마치지 않았으면 온보딩(소개→접근성→은행)부터, 마쳤으면 스스로 해보기로 안내
  router.push(store.onboardingDone ? '/practice' : '/onboarding/intro')
}
function resume() {
  if (!resumePractice.value) return
  const { practiceId, bankCode, currentStep } = resumePractice.value
  // 서버 응답에 진행 모드(함께/스스로) 구분이 없어, 이어하기는 '스스로 해보기' 흐름으로 재개합니다.
  store.resumeFlow('practice', practiceId, bankCode, currentStep)
  router.push(`/practice/step/${stepIndexForCode(currentStep)}`)
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.hero-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 84px;
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-primary);
  background: var(--color-primary);
  color: var(--color-on-primary, #fff);
  padding: 18px 20px;
  cursor: pointer;
  text-align: left;
}
.hero-card__icon {
  display: flex;
}
.hero-card__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.hero-card__text strong {
  font-size: var(--fs-title);
}
.hero-card__text small {
  font-size: var(--fs-caption);
  opacity: 0.85;
}
.status-strip {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
  flex-wrap: wrap;
}
.status-strip strong {
  color: var(--color-text);
}
.status-strip__link {
  margin-left: auto;
  border: none;
  background: none;
  color: var(--color-primary);
  font-weight: 700;
  cursor: pointer;
}
.link-line {
  align-self: flex-start;
  border: none;
  background: none;
  color: var(--color-primary);
  font-weight: 700;
  font-size: var(--fs-caption);
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}
.resume-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.resume-card__title {
  margin: 0;
  font-weight: 800;
  font-size: var(--fs-body-lg);
}
.resume-card__desc {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--fs-caption);
}
</style>
