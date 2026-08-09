<template>
  <div class="analysis-page">
    <AppHeader title="AI 분석노트" show-back @back="goHome" />

    <main class="screen analysis-screen">
      <div v-if="loading" class="analysis-state">
        <div class="analysis-state__icon" aria-hidden="true"><Icon name="sparkle" :size="28" /></div>
        <h2>실습 내용을 분석하고 있어요</h2>
        <p>잠시만 기다려 주세요.</p>
      </div>

      <div v-else-if="errorMessage" class="analysis-state">
        <div class="analysis-state__icon analysis-state__icon--warning" aria-hidden="true"><Icon name="alert-triangle" :size="28" /></div>
        <h2>분석을 불러오지 못했어요</h2>
        <p>{{ errorMessage }}</p>
        <AppButton variant="outline" @click="loadFeedback">다시 불러오기</AppButton>
      </div>

      <template v-else-if="feedback">
        <section class="analysis-heading" aria-labelledby="analysis-title">
          <span class="analysis-heading__badge"><Icon name="sparkle" :size="16" /> {{ isExample ? 'AI 분석 예시' : 'AI 분석 완료' }}</span>
          <h2 id="analysis-title">이번 실습에서 보완할 점이에요</h2>
          <p>{{ isExample ? '실수가 많은 사용자 예시예요.' : '아래 부분을 다시 연습해요.' }}</p>
        </section>

        <section class="analysis-card" aria-labelledby="area-title">
          <h3 id="area-title">지금 보완할 점</h3>
          <div class="skill-grid">
            <article v-for="(area, index) in skillAreas" :key="area.title" class="skill-card">
              <div class="skill-card__top">
                <span class="skill-card__title">{{ area.title }}</span>
                <strong>{{ area.level }}</strong>
              </div>
              <div class="skill-card__graph" role="img" :aria-label="`${area.title} ${skillPercent(index)}%`">
                <span :style="{ width: `${skillPercent(index)}%` }" />
              </div>
              <p>{{ area.detail }}</p>
            </article>
          </div>
        </section>

        <section class="analysis-card" aria-labelledby="difficult-title">
          <div class="analysis-card__title-row">
            <h3 id="difficult-title">꼭 다시 연습할 단계</h3>
            <span class="analysis-card__count">{{ feedback.difficultSteps.length }}개</span>
          </div>
          <div v-if="feedback.difficultSteps.length" class="analysis-list">
            <div v-for="(step, index) in feedback.difficultSteps" :key="step.stepCode" class="analysis-list__item">
              <span class="analysis-list__number">{{ index + 1 }}</span>
              <span class="analysis-list__body">
                <strong>{{ stepLabel(step.stepCode) }}</strong>
                <p>팁: {{ stepTip(step.stepCode) }}</p>
              </span>
            </div>
          </div>
          <p v-else class="analysis-card__empty">어려워한 단계 없이 잘 진행했어요.</p>
        </section>

        <section class="analysis-card" aria-labelledby="strength-title">
          <h3 id="strength-title">잘하는 점</h3>
          <ul v-if="feedback.strengths.length" class="strength-list">
            <li v-for="strength in feedback.strengths" :key="strength">
              <Icon name="check" :size="18" />
              <span>{{ strength }}</span>
            </li>
          </ul>
          <p v-else class="analysis-card__empty">실습을 완료하면 잘한 점을 알려드릴게요.</p>
        </section>

        <section class="analysis-card analysis-card--next" aria-labelledby="next-title">
          <h3 id="next-title">연습 순서</h3>
          <p>한 단계씩 천천히 해보세요.</p>
          <div class="recommended-steps">
            <span v-for="step in feedback.recommendedSteps" :key="step">{{ stepLabel(step) }}</span>
          </div>
          <AppButton @click="goPractice">다시 실습하기</AppButton>
        </section>
      </template>
    </main>

    <BottomNav v-model="activeTab" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AppButton from '@/components/common/AppButton.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import Icon from '@/components/common/icons/Icon.vue'
import { fetchPracticeFeedback } from '@/api/tutorApi'
import { useSessionStore } from '@/stores/session'
import type { PracticeFeedback, StepCode } from '@/types'

const router = useRouter()
const store = useSessionStore()
const activeTab = ref('home')
const loading = ref(false)
const errorMessage = ref('')
const feedback = ref<PracticeFeedback | null>(null)
const isExample = ref(false)

const latestPracticeId = computed(() => store.lastResult?.practiceId || store.flow.practiceId)
const practiceLevel = computed(() => {
  if (isExample.value) return '순서 연습 필요'
  if (!feedback.value?.difficultSteps.length) return '잘하고 있어요'
  return '조금 더 연습'
})
const skillAreas = computed(() => [
  {
    title: '메시지 확인',
    level: isExample.value ? '많이 연습 필요' : '주의 필요',
    detail: isExample.value ? '파란 링크를 누르려 했어요.' : '파란 링크는 누르지 않고 발신자를 먼저 확인해요.'
  },
  {
    title: '앱 설정',
    level: isExample.value ? '설정 미완료' : (store.settings.helpLevel === 'BEGINNER' ? '도움 받는 중' : '설정 완료'),
    detail: isExample.value ? '설정을 정하지 않고 시작했어요.' : `${store.settings.textSize === 'XLARGE' ? '큰' : '편한'} 글씨와 AI 도움을 정했어요.`
  },
  {
    title: '계좌이체',
    level: practiceLevel.value,
    detail: isExample.value ? '받는 분과 금액 확인을 놓쳤어요.' : '받는 분과 금액을 확인하며 연습해요.'
  },
  {
    title: '은행 앱 이용',
    level: isExample.value ? '기초부터 연습' : practiceLevel.value,
    detail: isExample.value ? '계좌 선택과 금액 입력 순서를 헷갈려요.' : '계좌 선택부터 확인까지 순서를 익히고 있어요.'
  }
])

const STEP_TIP: Record<StepCode, string> = {
  SELECT_SOURCE_ACCOUNT: '은행 이름과 계좌를 비교해요.',
  ENTER_RECIPIENT_ACCOUNT: '문자 계좌번호를 복사해 붙여넣어요.',
  ENTER_AMOUNT: '문자 금액과 화면 금액을 비교해요.',
  FINAL_REVIEW: '받는 분·계좌·금액을 차례로 읽어요.',
  AUTHENTICATION: '안내를 읽고 다음을 눌러요.',
  TRANSFER: '완료 내용도 한 번 더 봐요.'
}

function stepTip(step: StepCode) {
  return STEP_TIP[step] || '한 단계씩 천천히 확인해요.'
}

const STEP_LABEL: Record<StepCode, string> = {
  SELECT_SOURCE_ACCOUNT: '출금계좌 선택',
  ENTER_RECIPIENT_ACCOUNT: '받는 분 계좌번호 입력',
  ENTER_AMOUNT: '이체 금액 입력',
  FINAL_REVIEW: '최종 확인',
  AUTHENTICATION: '인증 단계',
  TRANSFER: '이체 완료'
}

function stepLabel(step: StepCode) {
  return STEP_LABEL[step] || '이체 단계'
}

function skillPercent(index: number) {
  if (isExample.value) return [35, 48, 56, 44][index] || 40
  return [72, 78, 68, 74][index] || 70
}

async function loadFeedback() {
  errorMessage.value = ''
  feedback.value = null
  isExample.value = !latestPracticeId.value
  if (!latestPracticeId.value) {
    feedback.value = {
      practiceId: 0,
      overallScore: 42,
      strengths: ['AI 도우미 안내를 다시 확인하려고 했어요.'],
      difficultSteps: [
        { stepCode: 'SELECT_SOURCE_ACCOUNT', reason: '출금 계좌를 잘못 골랐어요.', timeSpentSeconds: 75 },
        { stepCode: 'ENTER_RECIPIENT_ACCOUNT', reason: '계좌번호를 여러 번 고쳤어요.', timeSpentSeconds: 98 },
        { stepCode: 'ENTER_AMOUNT', reason: '금액 확인 없이 다음을 누르려 했어요.', timeSpentSeconds: 80 },
        { stepCode: 'FINAL_REVIEW', reason: '받는 분과 금액 확인을 놓쳤어요.', timeSpentSeconds: 64 }
      ],
      recommendedSteps: ['SELECT_SOURCE_ACCOUNT', 'ENTER_RECIPIENT_ACCOUNT', 'ENTER_AMOUNT', 'FINAL_REVIEW']
    }
    return
  }

  loading.value = true
  try {
    feedback.value = await fetchPracticeFeedback(latestPracticeId.value)
  } catch {
    errorMessage.value = '실습을 완료한 뒤 잠시 후 다시 확인해 주세요.'
  } finally {
    loading.value = false
  }
}

function goHome() {
  router.push('/')
}

function goPractice() {
  router.push(store.onboardingDone ? '/practice' : '/onboarding/intro')
}

onMounted(loadFeedback)
</script>

<style scoped>
.analysis-page {
  min-height: 100vh;
  padding-bottom: 92px;
}
.analysis-screen {
  gap: 20px;
}
.analysis-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 58vh;
  flex-direction: column;
  gap: 10px;
  text-align: center;
}
.analysis-state__icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-bottom: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
}
.analysis-state__icon--muted {
  background: var(--color-surface-muted, #edf0f4);
  color: var(--color-primary);
}
.analysis-state__icon--warning {
  background: #fff3d4;
  color: #9a6a00;
}
.analysis-state h2,
.analysis-state p {
  margin: 0;
}
.analysis-state h2 {
  color: #102a43;
  font-size: 24px;
}
.analysis-state p {
  color: #334e68;
  font-size: 18px;
  line-height: 1.6;
}
.analysis-state .app-button {
  width: min(100%, 300px);
  margin-top: 12px;
}
.analysis-heading {
  padding: 8px 2px 2px;
}
.analysis-heading__badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eaf1ff;
  color: var(--color-primary);
  font-size: 16px;
  font-weight: 800;
}
.analysis-heading h2 {
  margin: 14px 0 6px;
  color: #102a43;
  font-size: 26px;
  line-height: 1.35;
}
.analysis-heading p {
  margin: 0;
  color: #334e68;
  font-size: 18px;
  line-height: 1.6;
}
.analysis-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border: 1px solid #c7d1dc;
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
.analysis-card h3,
.analysis-card p {
  margin: 0;
}
.analysis-card h3 {
  color: #102a43;
  font-size: 21px;
}
.analysis-card__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.analysis-card__count {
  color: var(--color-primary);
  font-size: 16px;
  font-weight: 800;
}
.analysis-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.analysis-list__item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 15px;
  border: 1px solid #d9e2ec;
  border-radius: 12px;
  background: #f7f8fa;
}
.analysis-list__number {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: 50%;
  background: #fff0d3;
  color: #9a6a00;
  font-size: 18px;
  font-weight: 800;
}
.analysis-list__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}
.analysis-list__body small,
.analysis-card__empty,
.analysis-card--next p {
  color: #334e68;
  font-size: 17px;
  line-height: 1.5;
}
.analysis-list__body strong {
  color: #102a43;
  font-size: 18px;
}
.analysis-list__body p {
  margin: 2px 0 0;
  color: #174a8b;
  font-size: 17px;
  line-height: 1.5;
}
.skill-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.skill-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 15px;
  border: 1px solid #d9e2ec;
  border-radius: 12px;
  background: #f7f8fa;
}
.skill-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.skill-card__title {
  color: #334e68;
  font-size: 16px;
  font-weight: 700;
}
.skill-card strong {
  color: #174a8b;
  font-size: 15px;
  text-align: right;
}
.skill-card__graph {
  height: 14px;
  overflow: hidden;
  border-radius: 999px;
  background: #dfe7f0;
}
.skill-card__graph span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #f0a83a 0%, #2d5aa7 100%);
}
.skill-card p {
  margin: 0;
  color: #243b53;
  font-size: 17px;
  line-height: 1.55;
}
.strength-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.strength-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-success, #25785c);
  font-size: 17px;
  line-height: 1.5;
}
.strength-list li span {
  color: var(--color-text);
}
.analysis-card--next {
  background: #f4f7fd;
}
.recommended-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.recommended-steps span {
  padding: 9px 12px;
  border-radius: 999px;
  background: #fff;
  color: var(--color-primary);
  border: 1px solid #b8c7dc;
  color: #174a8b;
  font-size: 16px;
  font-weight: 700;
}
</style>
