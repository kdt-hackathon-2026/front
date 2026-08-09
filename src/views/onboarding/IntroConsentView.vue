<template>
  <div class="page">
    <AppHeader title="처음 설정" badge="처음 설정" />
    <StepProgress :current="1" :total="4" />

    <div class="screen">
      <h2 class="screen-title">금융한걸음을 소개할게요</h2>
      <p class="screen-subtitle">천천히 읽어보시고, 다 확인하셨으면 아래 동의에 체크해 주세요.</p>

      <div class="intro-card">
        <div class="intro-card__row" v-for="item in introItems" :key="item.title">
          <span class="intro-card__icon"><Icon :name="item.icon" :size="22" /></span>
          <div>
            <p class="intro-card__title">{{ item.title }}</p>
            <p class="intro-card__desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>

      <div class="consent-card">
        <p class="consent-card__title">이용 전 꼭 확인해 주세요</p>
        <ul class="consent-card__list">
          <li>이 서비스는 <strong>가상 연습</strong>이며, 실제 계좌·송금과는 관련이 없어요.</li>
          <li>실제 비밀번호, OTP, 공동인증서 정보는 어떤 화면에서도 입력하지 않아요.</li>
          <li>연습 기록은 도움 수준을 맞추는 용도로만 저장돼요.</li>
        </ul>
        <label class="consent-check" data-tutor-id="consent-agree-checkbox">
          <input type="checkbox" v-model="agreed" />
          <span>위 내용을 확인했으며 이용에 동의합니다.</span>
        </label>
      </div>

      <div class="spacer" />
      <AppButton :disabled="!agreed" @click="next">동의하고 다음 →</AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import StepProgress from '@/components/common/StepProgress.vue'
import AppButton from '@/components/common/AppButton.vue'
import Icon from '@/components/common/icons/Icon.vue'
import type { IconName } from '@/components/common/icons/registry'

const router = useRouter()
const agreed = ref(false)

const introItems: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'transfer', title: '계좌이체를 반복 연습해요', desc: '실제 앱과 비슷한 화면으로 여러 번 연습할 수 있어요.' },
  { icon: 'bot', title: 'AI 도우미가 함께해요', desc: '막히는 부분마다 화면 위에서 순서대로 알려드려요.' },
  { icon: 'lock', title: '실제 금융정보는 다루지 않아요', desc: '가상 계좌·가상 금액으로만 연습해요.' }
]

function next() {
  router.push('/onboarding/start')
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.intro-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
}
.intro-card__row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.intro-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.intro-card__title {
  margin: 0 0 2px;
  font-weight: 700;
  font-size: var(--fs-body);
}
.intro-card__desc {
  margin: 0;
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
}
.consent-card {
  background: var(--color-tip-bg);
  border: 1px solid var(--color-tip-border);
  border-radius: var(--radius-md);
  padding: 16px;
}
.consent-card__title {
  margin: 0 0 8px;
  font-weight: 800;
  color: var(--color-tip-text);
}
.consent-card__list {
  margin: 0 0 12px;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: var(--fs-caption);
  color: var(--color-tip-text);
}
.consent-check {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: var(--fs-body);
}
.consent-check input {
  width: 22px;
  height: 22px;
}
</style>
