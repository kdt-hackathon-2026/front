<template>
  <div class="page" :style="themeStyle">
    <AppHeader title="처음 설정" badge="처음 설정" show-back @back="router.back()" />
    <StepProgress :current="3" :total="4" />

    <div class="screen">
      <h2 class="screen-title">주거래 은행을 고르세요</h2>
      <p class="screen-subtitle">연습에서 사용할 가상 은행을 골라주세요.</p>

      <MascotTip>
        은행을 누르면 바로 아래 미리보기와 버튼 색이 그 은행 화면 색으로 바뀌어요.
        실제 은행 앱들의 디자인을 참고해서 만들었어요.
      </MascotTip>

      <div class="voice-row">
        <button class="link-btn" @click="speak('연습에서 사용할 가상 은행을 골라주세요.')">🔊 음성 듣기</button>
        <button class="link-btn" @click="fontLarge = !fontLarge">T 가</button>
      </div>

      <SelectCard
        v-for="bank in banks"
        :key="bank.code"
        :title="bank.name"
        :icon="bank.shortName"
        :icon-bg="bank.color + '22'"
        :selected="selectedCode === bank.code"
        @click="selectBank(bank.code)"
      />

      <!-- 2.40 선택한 은행 화면 예시 미리보기 -->
      <div class="preview">
        <p class="preview__label">선택한 은행 화면 미리보기</p>
        <div class="preview__frame">
          <AppHeader title="계좌이체" :bank="selectedBank" />
          <div class="preview__body">
            <BankQuickMenu v-if="isKbStyle" :items="selectedBank.theme.quickMenu" active="이체" />
            <p v-else class="preview__generic">
              {{ selectedBank.name }} 색상과 메뉴 배치로 계좌이체 화면이 구성돼요.
            </p>
          </div>
        </div>
        <p class="preview__note">실제 은행 앱 상표를 그대로 쓰지 않고, 색상·배치만 참고해 교육용으로 재구성했어요.</p>
      </div>

      <div class="spacer" />
      <AppButton @click="next">이 은행으로 계속 →</AppButton>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import StepProgress from '@/components/common/StepProgress.vue'
import SelectCard from '@/components/common/SelectCard.vue'
import BankQuickMenu from '@/components/common/BankQuickMenu.vue'
import MascotTip from '@/components/common/MascotTip.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useSessionStore } from '@/stores/session'
import { useTTS } from '@/composables/useTTS'
import { useBankTheme } from '@/composables/useBankTheme'
import { BANKS, getBankByCode } from '@/assets/data/banks'

const router = useRouter()
const store = useSessionStore()
const { speak } = useTTS()

const banks = BANKS
const selectedCode = ref(store.selectedBankCode)
const fontLarge = ref(false)

const selectedBank = computed(() => getBankByCode(selectedCode.value) || BANKS[0])
const { themeStyle, isKbStyle } = useBankTheme(selectedBank)

function selectBank(code) {
  // 버튼을 누르는 즉시(선택 순간) 이 화면 전체가 해당 은행 색감으로 바뀝니다.
  selectedCode.value = code
  const bank = getBankByCode(code)
  speak(`${bank.name}을 선택했어요.`)
}

function next() {
  store.setBank(selectedCode.value)
  store.completeOnboarding()
  router.push('/')
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.voice-row {
  display: flex;
  gap: 16px;
}
.link-btn {
  border: none;
  background: var(--color-bg);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: var(--fs-caption);
  font-weight: 700;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.preview__label {
  margin: 0;
  font-size: var(--fs-caption);
  font-weight: 700;
  color: var(--color-text-secondary);
}
.preview__frame {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg);
}
.preview__body {
  padding: 14px;
}
.preview__generic {
  margin: 0;
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
}
.preview__note {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
