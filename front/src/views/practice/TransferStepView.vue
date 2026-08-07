<template>
  <div class="page" :style="themeStyle">
    <AppHeader
      :title="mode === 'together' ? '함께 해보기' : '계좌이체 실습'"
      badge="가상 연습"
      show-back
      show-home
      :bank="flowBank"
      @back="goBack"
      @home="router.push('/')"
    />
    <StepProgress :current="stepIndex" :total="5" />

    <div class="screen">
      <MascotTip v-if="showHint && mascotText">{{ mascotText }}</MascotTip>

      <!-- 1/5 출금 계좌 -->
      <template v-if="stepIndex === 1">
        <h2 class="screen-title">출금 계좌를 고르세요</h2>
        <p class="screen-subtitle">{{ missionTitle }}에 사용할 계좌를 골라주세요.</p>
        <BankQuickMenu v-if="isBrandedStyle" :items="quickMenuLabels" :icons="quickMenuIcons" active="이체" />
        <div data-tutor-id="source-account-list">
          <SelectCard
            v-for="acc in accounts"
            :key="acc.accountId"
            :title="acc.accountName"
            :subtitle="`${acc.maskedAccountNumber} · 가상 잔액 ${acc.balance.toLocaleString('ko-KR')}원`"
            icon-name="wallet"
            :selected="store.flow.sourceAccountId === acc.accountId"
            @click="chooseSourceAccount(acc.accountId)"
          />
        </div>
      </template>

      <!-- 2/5 받는 분 계좌번호 (은행은 앞에서 이미 골랐으니 계좌번호만 입력) -->
      <template v-else-if="stepIndex === 2">
        <h2 class="screen-title">받는 분 계좌번호를 입력하세요</h2>
        <p class="screen-subtitle">{{ flowBank?.bankName }} · {{ missionTitle }}에서 안내한 계좌번호를 확인해요.</p>

        <div class="number-display">{{ store.flow.recipientAccountNumber || '계좌번호를 입력해 주세요' }}</div>
        <div data-tutor-id="recipient-account-keypad">
          <NumericKeypad @input="onKeypadInput" @backspace="onBackspace" @clear="resetRecipient" />
        </div>
        <AppButton data-tutor-id="recipient-confirm-button" variant="outline" :disabled="submitting" @click="confirmRecipientAccount">
          {{ submitting ? '확인 중…' : '계좌번호 확인' }}
        </AppButton>

        <div v-if="store.flow.recipientConfirmed" class="receiver-confirm">
          <p class="receiver-confirm__label">받는 분 확인 <span class="badge">확인 완료</span></p>
          <p class="receiver-confirm__value">{{ store.flow.recipientName }}</p>
        </div>
        <TipBox v-if="recipientError" tone="danger">{{ recipientError }}</TipBox>
      </template>

      <!-- 3/5 금액 -->
      <template v-else-if="stepIndex === 3">
        <h2 class="screen-title">보낼 금액을 넣으세요</h2>
        <p class="screen-subtitle">숫자와 한글 금액을 함께 확인해요.</p>
        <div class="amount-display">
          <strong>{{ store.formattedAmount }}원</strong>
          <span>{{ koreanAmount }}</span>
        </div>
        <BankAmountAdjuster v-if="isBrandedStyle" @adjust="onAdjust" />
        <div v-else class="quick-amounts">
          <button v-for="q in quickAmounts" :key="q" class="quick-amounts__btn" @click="addAmount(q)">{{ q / 10000 }}만</button>
        </div>
        <div data-tutor-id="amount-keypad">
          <NumericKeypad @input="onAmountKeypadInput" @backspace="onAmountBackspace" @clear="store.setAmount(0)" />
        </div>
        <TipBox v-if="amountError" tone="danger">{{ amountError }}</TipBox>
        <TipBox v-else tone="success">가상 잔액 안에서 보낼 수 있어요.</TipBox>
      </template>

      <!-- 4/5 최종 확인 -->
      <template v-else-if="stepIndex === 4">
        <h2 class="screen-title">마지막으로 확인하세요</h2>
        <p class="screen-subtitle">받는 분, 계좌, 금액을 세 가지 확인해요.</p>
        <div class="confirm-card" data-tutor-id="review-checklist">
          <ConfirmRow
            label="받는 분"
            :value="review?.recipient.name || store.flow.recipientName || ''"
            :checked="store.flow.confirmed.recipient"
            @toggle="store.toggleConfirm('recipient')"
            @edit="router.push(stepPath(2))"
          />
          <ConfirmRow
            label="은행·계좌"
            :value="`${review?.recipient.bankName || ''} · ${review?.recipient.maskedAccountNumber || ''}`"
            :checked="store.flow.confirmed.account"
            @toggle="store.toggleConfirm('account')"
            @edit="router.push(stepPath(2))"
          />
          <ConfirmRow
            label="보낼 금액"
            :value="`${store.formattedAmount}원`"
            :checked="store.flow.confirmed.amount"
            @toggle="store.toggleConfirm('amount')"
            @edit="router.push(stepPath(3))"
          />
        </div>
        <TipBox tone="yellow">실제 인증정보(비밀번호·OTP)는 입력하지 않아요. 다음 화면은 교육용 인증번호만 입력해요.</TipBox>
      </template>

      <!-- 5/5 모의 인증 -->
      <template v-else-if="stepIndex === 5">
        <h2 class="screen-title">모의 인증을 진행할게요</h2>
        <p class="screen-subtitle">실제 비밀번호나 OTP가 아니라, 화면에 적힌 교육용 인증번호를 입력해요.</p>

        <div class="auth-code-card">
          <p class="auth-code-card__label">교육용 인증번호</p>
          <p class="auth-code-card__value">123456</p>
        </div>

        <div class="number-display" data-tutor-id="auth-code-input">{{ authCode || '인증번호 입력' }}</div>
        <NumericKeypad @input="onAuthInput" @backspace="onAuthBackspace" @clear="authCode = ''" />

        <label class="check-line">
          <input type="checkbox" v-model="acknowledged" />
          실제 비밀번호나 OTP를 입력하지 않았어요.
        </label>
        <TipBox v-if="authError" tone="danger">{{ authError }}</TipBox>
      </template>

      <div class="spacer" />

      <div class="footer-actions">
        <AppButton variant="outline" v-if="stepIndex > 1" @click="prevStep">이전</AppButton>
        <AppButton :disabled="!canProceed || submitting" @click="nextStep">
          {{ submitting ? '처리 중…' : nextLabel }}
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import StepProgress from '@/components/common/StepProgress.vue'
import MascotTip from '@/components/common/MascotTip.vue'
import SelectCard from '@/components/common/SelectCard.vue'
import NumericKeypad from '@/components/common/NumericKeypad.vue'
import ConfirmRow from '@/components/common/ConfirmRow.vue'
import AppButton from '@/components/common/AppButton.vue'
import TipBox from '@/components/common/TipBox.vue'
import BankQuickMenu from '@/components/common/BankQuickMenu.vue'
import BankAmountAdjuster, { type AmountAdjustOption } from '@/components/common/BankAmountAdjuster.vue'
import { useSessionStore } from '@/stores/session'
import { useTTS } from '@/composables/useTTS'
import { useBankTheme } from '@/composables/useBankTheme'
import { getBankByCode } from '@/assets/data/banks'
import { fetchPracticeAccounts, selectSourceAccount, validateRecipient, confirmRecipient, validateAmount, fetchReview, authenticatePractice, executeTransfer, fetchPracticeResult, saveProgress } from '@/api/practiceApi'
import { errorMessage } from '@/api/client'
import { STEP_INDEX_TO_CODE } from '@/router/screenMap'
import type { PracticeAccount, PracticeReview } from '@/types'

const props = defineProps<{ mode: 'together' | 'practice'; stepIndex: number }>()
const router = useRouter()
const store = useSessionStore()
const { speak } = useTTS()

const accounts = ref<PracticeAccount[]>([])
const review = ref<PracticeReview | null>(null)
const authCode = ref('')
const acknowledged = ref(false)

const submitting = ref(false)
const recipientError = ref('')
const amountError = ref('')
const authError = ref('')

const missionTitle = computed(() => (props.mode === 'together' ? '이번 연습' : '문제'))
const flowBank = computed(() => getBankByCode(store.flow.bankCode))
// 은행은 이체연습을 시작하기 전(은행 선택 화면)에 이미 골랐으므로,
// 이 화면들은 처음부터 그 은행 테마로 보여줍니다.
const { themeStyle, isBrandedStyle, quickMenuLabels, quickMenuIcons } = useBankTheme(flowBank)

const showHint = computed(() => store.settings.helpLevel !== 'ADVANCED')
const quickAmounts = [10000, 50000, 100000]

function stepPath(n: number) {
  return props.mode === 'together' ? `/together/step/${n}` : `/practice/step/${n}`
}

const mascotMap = computed<Record<number, string>>(() => ({
  1: '카드를 눌러 출금 계좌를 골라주세요.',
  2: '계좌번호를 천천히 눌러주세요.',
  3: '만원 단위 버튼을 쓰면 더 쉬워요.',
  4: '세 가지를 모두 확인해야 다음으로 갈 수 있어요.',
  5: '실제 비밀번호가 아니라 화면에 보이는 번호를 그대로 입력하면 돼요.'
}))
const mascotText = computed(() => mascotMap.value[props.stepIndex])

const nextLabelMap: Record<number, string> = {
  1: '선택했어요, 다음 →',
  2: '계좌 확인하고 다음 →',
  3: '금액 확인 완료 →',
  4: '세 가지 확인하고 다음 →',
  5: '인증하고 완료 →'
}
const nextLabel = computed(() => nextLabelMap[props.stepIndex])

const koreanAmount = computed(() => amountToKorean(store.flow.amount))

const canProceed = computed(() => {
  switch (props.stepIndex) {
    case 1:
      return !!store.flow.sourceAccountId
    case 2:
      return store.flow.recipientConfirmed === true
    case 3:
      return store.flow.amount > 0 && !amountError.value
    case 4:
      return store.flow.confirmed.recipient && store.flow.confirmed.account && store.flow.confirmed.amount
    case 5:
      return authCode.value.length === 6 && acknowledged.value
    default:
      return false
  }
})

onMounted(async () => {
  if (!store.flow.practiceId) {
    router.replace(props.mode === 'together' ? '/together' : '/practice')
    return
  }
  store.goToStep(STEP_INDEX_TO_CODE[props.stepIndex] || 'SELECT_SOURCE_ACCOUNT')
  if (accounts.value.length === 0) {
    accounts.value = await fetchPracticeAccounts(store.flow.practiceId)
  }
  if (showHint.value) speak(mascotText.value)
  if (props.stepIndex === 4) {
    review.value = await fetchReview(store.flow.practiceId)
  }
})

watch(
  () => props.stepIndex,
  async (n) => {
    store.goToStep(STEP_INDEX_TO_CODE[n] || 'SELECT_SOURCE_ACCOUNT')
    if (showHint.value) speak(mascotMap.value[n])
    if (n === 4 && store.flow.practiceId) {
      review.value = await fetchReview(store.flow.practiceId)
    }
  }
)

async function chooseSourceAccount(accountId: string) {
  if (!store.flow.practiceId) return
  store.setSourceAccount(accountId)
  await selectSourceAccount(store.flow.practiceId, accountId)
}

function onKeypadInput(digit: string) {
  if (store.flow.recipientAccountNumber.replace(/\D/g, '').length >= 14) return
  store.setRecipientAccountNumber(store.flow.recipientAccountNumber + digit)
  resetRecipientConfirmation()
}
function onBackspace() {
  store.setRecipientAccountNumber(store.flow.recipientAccountNumber.slice(0, -1))
  resetRecipientConfirmation()
}
function resetRecipient() {
  store.setRecipientAccountNumber('')
  resetRecipientConfirmation()
}
function resetRecipientConfirmation() {
  if (store.flow.recipientConfirmed !== null) store.setRecipientLookup({ name: null, confirmed: null })
  recipientError.value = ''
}

async function confirmRecipientAccount() {
  if (!store.flow.practiceId || !store.flow.bankCode) return
  recipientError.value = ''
  submitting.value = true
  try {
    await validateRecipient(store.flow.practiceId, {
      bankCode: store.flow.bankCode,
      accountNumber: store.flow.recipientAccountNumber
    })
    const res = await confirmRecipient(store.flow.practiceId, {
      bankCode: store.flow.bankCode,
      accountNumber: store.flow.recipientAccountNumber,
      confirmedByUser: true
    })
    store.setRecipientLookup({ name: res.recipientName, confirmed: true })
  } catch (e) {
    recipientError.value = errorMessage(e, '계좌 확인 중 문제가 발생했어요.')
    store.recordError()
  } finally {
    submitting.value = false
  }
}

function onAmountKeypadInput(digit: string) {
  const current = String(store.flow.amount === 0 ? '' : store.flow.amount)
  applyAmount(Number(current + digit))
}
function onAmountBackspace() {
  const current = String(store.flow.amount)
  applyAmount(current.length <= 1 ? 0 : Number(current.slice(0, -1)))
}
function addAmount(v: number) {
  applyAmount(store.flow.amount + v)
}
function onAdjust(opt: AmountAdjustOption) {
  const account = accounts.value.find((a) => a.accountId === store.flow.sourceAccountId)
  if (opt.type === 'all') applyAmount(account?.balance || 0)
  else if (opt.type === 'subtract') applyAmount(Math.max(0, store.flow.amount - (opt.value || 0)))
  else applyAmount(store.flow.amount + (opt.value || 0))
}
function applyAmount(v: number) {
  amountError.value = ''
  if (v >= 0) store.setAmount(v)
}

function onAuthInput(digit: string) {
  if (authCode.value.length >= 6) return
  authCode.value += digit
}
function onAuthBackspace() {
  authCode.value = authCode.value.slice(0, -1)
}

function amountToKorean(n: number): string {
  if (!n) return '0원'
  const man = Math.floor(n / 10000)
  const rest = n % 10000
  let text = ''
  if (man > 0) text += `${man.toLocaleString('ko-KR')}만 `
  if (rest > 0) text += `${rest.toLocaleString('ko-KR')}`
  return text.trim() + '원'
}

function prevStep() {
  router.push(stepPath(props.stepIndex - 1))
}

async function nextStep() {
  if (!canProceed.value || !store.flow.practiceId) return
  const practiceId = store.flow.practiceId

  if (props.stepIndex === 3) {
    submitting.value = true
    try {
      const res = await validateAmount(practiceId, store.flow.amount)
      store.setAmount(res.amount)
    } catch (e) {
      amountError.value = errorMessage(e, '금액을 다시 확인해 주세요.')
      submitting.value = false
      return
    }
    submitting.value = false
    await saveStepProgress()
    router.push(stepPath(4))
    return
  }

  if (props.stepIndex === 5) {
    submitting.value = true
    authError.value = ''
    try {
      const auth = await authenticatePractice(practiceId, {
        educationCode: authCode.value,
        acknowledgedNoRealInfo: acknowledged.value
      })
      store.setAuthToken(auth.authToken)
      const transfer = await executeTransfer(
        practiceId,
        { authToken: auth.authToken, confirmed: true },
        `idem-${practiceId}-${Date.now()}`
      )
      store.setTransactionId(transfer.transactionId)
      const result = await fetchPracticeResult(practiceId)
      store.finishFlow({
        mode: props.mode,
        bankName: result.summary.bankName,
        recipientName: result.summary.recipientName,
        amount: result.summary.amount
      })
      router.push(props.mode === 'together' ? '/together/complete' : '/practice/complete')
    } catch (e) {
      authError.value = errorMessage(e, '인증번호를 다시 확인해 주세요.')
      store.recordError()
    } finally {
      submitting.value = false
    }
    return
  }

  await saveStepProgress()
  router.push(stepPath(props.stepIndex + 1))
}

async function saveStepProgress() {
  if (!store.flow.practiceId) return
  try {
    await saveProgress(store.flow.practiceId, {
      currentStep: store.flow.step || 'SELECT_SOURCE_ACCOUNT',
      helpUsageCount: store.flow.helpUsedCount,
      elapsedSeconds: store.flow.startedAt ? Math.round((Date.now() - store.flow.startedAt) / 1000) : 0,
      saveForResume: true
    })
  } catch {
    /* 진행상황 저장 실패는 조용히 무시 - 연습 자체는 계속 진행 가능 */
  }
}

function goBack() {
  if (props.stepIndex > 1) prevStep()
  else router.push(props.mode === 'together' ? '/together/start' : '/practice/level')
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.number-display {
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-md);
  font-size: var(--fs-title);
  font-weight: 800;
  letter-spacing: 1px;
}
.receiver-confirm {
  background: var(--color-success-bg);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-md);
  padding: 14px;
}
.receiver-confirm__label {
  margin: 0 0 4px;
  font-size: var(--fs-caption);
  color: var(--color-success);
  display: flex;
  align-items: center;
  gap: 6px;
}
.badge {
  background: var(--color-success);
  color: #fff;
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 11px;
}
.receiver-confirm__value {
  margin: 0;
  font-size: var(--fs-title);
  font-weight: 800;
}
.amount-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px;
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
}
.amount-display strong {
  font-size: var(--fs-display);
  color: var(--color-primary);
}
.amount-display span {
  font-size: var(--fs-body);
  color: var(--color-text-secondary);
}
.quick-amounts {
  display: flex;
  gap: 8px;
}
.quick-amounts__btn {
  flex: 1;
  min-height: 48px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-primary);
  background: #fff;
  color: var(--color-primary);
  font-weight: 700;
  cursor: pointer;
}
.confirm-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 4px 16px;
}
.auth-code-card {
  background: var(--color-tip-bg);
  border: 1px solid var(--color-tip-border);
  border-radius: var(--radius-md);
  padding: 14px;
  text-align: center;
}
.auth-code-card__label {
  margin: 0 0 4px;
  font-size: var(--fs-caption);
  color: var(--color-tip-text);
  font-weight: 700;
}
.auth-code-card__value {
  margin: 0;
  font-size: var(--fs-title-lg);
  font-weight: 800;
  letter-spacing: 4px;
  color: var(--color-tip-text);
}
.check-line {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--fs-body);
  font-weight: 700;
}
.check-line input {
  width: 22px;
  height: 22px;
}
.footer-actions {
  display: flex;
  gap: 10px;
}
.footer-actions > * {
  flex: 1;
}
</style>
