<template>
  <div class="home">
    <AppHeader title="금융한걸음" :badge="'가상 연습'" />

    <div class="screen">
      <h2 class="screen-title">무엇을 연습할까요?</h2>
      <p class="screen-subtitle">필요한 기능만 크게 보여드려요.</p>

      <button class="hero-card" @click="goTogetherOrPractice">
        <span class="hero-card__icon" aria-hidden="true">⇄</span>
        <span class="hero-card__text">
          <strong>계좌이체 연습</strong>
          <small>천천히 6단계로 연습</small>
        </span>
      </button>

      <button class="hero-card hero-card--secondary" @click="goAiTutor">
        <span class="hero-card__icon" aria-hidden="true">◎</span>
        <span class="hero-card__text">
          <strong>AI 튜터</strong>
          <small>말로 물어보기</small>
        </span>
      </button>

      <button class="list-card" @click="goStartMethod">
        <span>처음 배우기</span>
        <span aria-hidden="true">⟳</span>
      </button>

      <div class="status-strip">
        <span>주거래 은행 <strong>{{ store.selectedBank.name }}</strong></span>
        <span>도움 수준 <strong>{{ helpLevelLabel }}</strong></span>
        <button class="status-strip__link" @click="router.push('/onboarding/bank')">변경</button>
      </div>

      <TipBox tone="yellow" icon="ℹ️">
        가상 연습입니다. 실제 돈은 이용하지 않아요.
      </TipBox>

      <div v-if="hasResumableSession" class="resume-card">
        <p class="resume-card__title">이어서 연습할까요?</p>
        <p class="resume-card__desc">{{ store.selectedBank.name }} · {{ store.flow.step }}단계에서 멈췄어요.</p>
        <AppButton variant="outline" @click="resume">이어하기</AppButton>
      </div>
    </div>

    <BottomNav v-model="activeTab" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import AppButton from '@/components/common/AppButton.vue'
import TipBox from '@/components/common/TipBox.vue'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const store = useSessionStore()
const activeTab = ref('home')

const helpLevelLabel = computed(() => {
  const map = { first: '처음 연습', guided: '도움 받으며', solo: '혼자 연습' }
  return map[store.settings.helpLevel] || '도움 받으며'
})

const hasResumableSession = computed(
  () => !!store.flow.mode && store.flow.step > 0 && store.flow.step < 6 && !store.flow.completedAt
)

function goStartMethod() {
  router.push('/onboarding/start')
}
function goAiTutor() {
  router.push('/ai-tutor')
}
function goTogetherOrPractice() {
  // 처음 사용자는 함께 해보기로, 온보딩을 마친 사용자는 스스로 해보기로 안내
  if (!store.settings.onboardingDone) {
    router.push('/together')
  } else {
    router.push('/practice')
  }
}
function resume() {
  const base = store.flow.mode === 'together' ? '/together/step/' : '/practice/step/'
  router.push(base + store.flow.step)
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
  color: #fff;
  padding: 18px 20px;
  cursor: pointer;
  text-align: left;
}
.hero-card--secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border-color: var(--color-border);
}
.hero-card__icon {
  font-size: 30px;
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
.list-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--tap-min);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  font-size: var(--fs-body-lg);
  font-weight: 700;
  cursor: pointer;
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
