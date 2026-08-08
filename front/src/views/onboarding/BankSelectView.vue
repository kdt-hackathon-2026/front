<template>
  <div class="page">
    <AppHeader title="처음 설정" badge="처음 설정" show-back @back="router.back()" />
    <StepProgress :current="4" :total="4" />

    <div class="screen">
      <h2 class="screen-title">주거래 은행을 고르세요</h2>
      <p class="screen-subtitle">연습에서 사용할 은행을 골라주세요. 화면은 다음 단계부터 그 은행 색으로 바뀌어요.</p>

      <MascotTip>
        은행을 고르면 아래에 미리보기가 나와요. 실제로 이 화면 색이 바뀌는 건 다음 화면부터예요.
      </MascotTip>

      <div class="voice-row">
        <button class="link-btn" @click="speak('연습에서 사용할 은행을 골라주세요.')">
          <Icon name="volume" :size="14" /> 음성 듣기
        </button>
      </div>

      <div class="bank-list" data-tutor-id="bank-select-list">
        <SelectCard
          v-for="bank in banks"
          :key="bank.bankCode"
          :title="bank.bankName"
          :icon="bank.bankName.charAt(0)"
          :icon-bg="bank.themeColor + '22'"
          :selected="selectedCode === bank.bankCode"
          @click="selectBank(bank.bankCode)"
        />
      </div>

      <!-- 2.40 선택한 은행 화면 예시 미리보기 (이 화면 자체의 테마는 바뀌지 않고, 미리보기 카드 안에서만 보여줘요) -->
      <div class="preview">
        <p class="preview__label">선택한 은행 화면 미리보기</p>
        <div class="preview__frame" :style="themeStyle">
          <AppHeader title="계좌이체" :bank="selectedBank" />
          <div class="preview__body">
            <BankQuickMenu v-if="isBrandedStyle" :items="quickMenuLabels" :icons="quickMenuIcons" active="이체" />
            <p v-else class="preview__generic">
              {{ selectedBank.bankName }} 색상으로 계좌이체 화면이 구성돼요.
            </p>
          </div>
        </div>
        <p class="preview__note">실제 은행 앱 상표를 그대로 쓰지 않고, 색상만 참고해 교육용으로 재구성했어요.</p>
      </div>

      <div class="spacer" />
      <AppButton @click="next">이 은행으로 계속 →</AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import StepProgress from '@/components/common/StepProgress.vue'
import SelectCard from '@/components/common/SelectCard.vue'
import BankQuickMenu from '@/components/common/BankQuickMenu.vue'
import MascotTip from '@/components/common/MascotTip.vue'
import AppButton from '@/components/common/AppButton.vue'
import Icon from '@/components/common/icons/Icon.vue'
import { useSessionStore } from '@/stores/session'
import { useTTS } from '@/composables/useTTS'
import { useBankTheme } from '@/composables/useBankTheme'
import { fetchBanks } from '@/api/practiceApi'
import { BANKS, getBankByCode } from '@/assets/data/banks'
import type { Bank, BankCode } from '@/types'

const router = useRouter()
const store = useSessionStore()
const { speak } = useTTS()

const banks = ref<Bank[]>(BANKS)
const selectedCode = ref<BankCode>(store.settings.defaultBankCode)

const selectedBank = computed(() => getBankByCode(selectedCode.value) || banks.value[0] || BANKS[0])
const { themeStyle, isBrandedStyle, quickMenuLabels, quickMenuIcons } = useBankTheme(selectedBank)

onMounted(async () => {
  banks.value = await fetchBanks()
})

function selectBank(code: BankCode) {
  // 은행 카드는 선택 상태만 바뀌고, 실제 테마 적용은 '다음 화면'부터입니다.
  selectedCode.value = code
  const bank = getBankByCode(code)
  if (bank) speak(`${bank.bankName}을 선택했어요.`)
}

function next() {
  // 이미 온보딩을 마친 사용자가 '변경' 링크로 기본 은행만 바꾸러 온 경우엔 원래 있던 곳(홈)으로 돌아가고,
  // 온보딩을 처음 완료하는 경우에만 이어서 처음 배우기(함께 해보기)로 안내합니다.
  const wasAlreadyOnboarded = store.onboardingDone
  store.setDefaultBank(selectedCode.value)
  store.completeOnboarding()
  router.push(wasAlreadyOnboarded ? '/' : '/together')
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
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.bank-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
