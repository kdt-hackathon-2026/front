<template>
  <div class="page" :style="isKbStyle ? themeStyle : {}">
    <AppHeader title="계좌이체 실습" badge="가상 연습" show-back show-home :bank="isKbStyle ? receiverBank : null" @back="goBack" @home="router.push('/')" />
    <StepProgress :current="stepNumber" :total="5" />

    <div class="screen">
      <MascotTip v-if="showHint && mascotText">{{ mascotText }}</MascotTip>

      <!-- 1/5 출금 계좌 -->
      <template v-if="stepNumber === 1">
        <h2 class="screen-title">출금 계좌를 선택하세요</h2>
        <p class="screen-subtitle">{{ scenario.title }} 연습에 사용할 계좌를 고르세요.</p>
        <SelectCard
          v-for="acc in accounts"
          :key="acc.id"
          :title="acc.name"
          :subtitle="`${acc.numberMasked} · 가상 계좌`"
          :icon="acc.icon"
          :selected="store.flow.withdrawAccountId === acc.id"
          @click="store.setWithdrawAccount(acc.id)"
        />
      </template>

      <!-- 2/5 받는 분 은행 -->
      <template v-else-if="stepNumber === 2">
        <h2 class="screen-title">받는 분의 은행은<br />어디인가요?</h2>
        <p class="screen-subtitle">{{ scenario.title }} 연습 상황과 같은 은행을 고르세요.</p>
        <SelectCard
          v-for="bank in banks"
          :key="bank.code"
          :title="bank.name"
          :icon="bank.shortName"
          :selected="store.flow.receiverBankCode === bank.code"
          @click="store.setReceiverBank(bank.code)"
        />
        <!-- 은행을 고르는 순간부터 그 은행 화면 스타일로 바뀌어요 -->
        <BankQuickMenu v-if="isKbStyle" :items="receiverBank.theme.quickMenu" active="이체" />
      </template>

      <!-- 3/5 계좌번호 -->
      <template v-else-if="stepNumber === 3">
        <h2 class="screen-title">계좌번호를 입력하세요</h2>
        <div class="field-group">
          <label class="field-group__label">받는 분 계좌번호</label>
          <div class="number-display">{{ store.flow.accountNumber || '123-456-789012' }}</div>
        </div>
        <NumericKeypad @input="onKeypadInput" @backspace="onBackspace" @clear="resetAccountNumber" />
        <button class="ghost-link" @click="lookup" :disabled="submitting">받는 분 확인하기</button>
        <div v-if="store.flow.receiverMatched" class="receiver-confirm">
          <p class="receiver-confirm__label">받는 분 확인 <span class="badge">자동확인</span></p>
          <p class="receiver-confirm__value">{{ store.flow.receiverName }}</p>
          <p class="receiver-confirm__meta">
            은행 {{ receiverBank?.name }} · 계좌 {{ maskedAccountNumber }}
          </p>
        </div>
        <TipBox v-if="accountError" tone="danger" icon="⚠️">{{ accountError }}</TipBox>
      </template>

      <!-- 4/5 금액 -->
      <template v-else-if="stepNumber === 4">
        <h2 class="screen-title">보낼 금액을<br />입력하세요</h2>
        <p class="screen-subtitle">금액과 한글 표기를 확인해요.</p>
        <div class="amount-display">
          <strong>{{ store.formattedAmount }}원</strong>
        </div>
        <BankAmountAdjuster v-if="isKbStyle" @adjust="onAdjust" />
        <div v-else class="quick-amounts">
          <button v-for="q in quickAmounts" :key="q" class="quick-amounts__btn" @click="addAmount(q)">+{{ q / 10000 }}만원</button>
        </div>
        <NumericKeypad @input="onAmountKeypadInput" @backspace="onAmountBackspace" @clear="store.setAmount(0)" />
        <TipBox v-if="amountError" tone="danger" icon="⚠️">{{ amountError }}</TipBox>
        <TipBox v-else tone="yellow" icon="ℹ️">이체 후 가상 잔액 {{ remainingBalance.toLocaleString('ko-KR') }}원</TipBox>
      </template>

      <!-- 5/5 최종 확인 -->
      <template v-else-if="stepNumber === 5">
        <h2 class="screen-title">마지막으로<br />확인하세요</h2>
        <p class="screen-subtitle">받는 분·계좌·금액을 확인하세요.</p>
        <div class="confirm-card">
          <div class="confirm-card__row">
            <span>받는 분</span><strong>{{ store.flow.receiverName }}</strong>
          </div>
          <div class="confirm-card__row">
            <span>은행·계좌</span><strong>{{ receiverBank?.name }} · {{ maskedAccountNumber }}</strong>
          </div>
          <div class="confirm-card__row">
            <span>보낼 금액</span><strong>{{ store.formattedAmount }}원</strong>
          </div>
          <div class="confirm-card__row">
            <span>통장 표시</span><strong>별표</strong>
          </div>
        </div>
        <label class="check-line">
          <input type="checkbox" v-model="allChecked" />
          세 가지를 확인했어요.
        </label>
        <TipBox tone="yellow" icon="🔒">가상 연습입니다. 실제 돈은 이용하지 않아요.</TipBox>
      </template>

      <div class="spacer" />

      <div class="footer-actions">
        <AppButton v-if="stepNumber === 5" variant="outline" @click="router.push('/practice/step/3')">✎ 수정</AppButton>
        <AppButton v-else-if="stepNumber > 1" variant="outline" @click="prevStep">이전 단계</AppButton>
        <AppButton :disabled="!canProceed || submitting" @click="nextStep">
          {{ submitting ? '처리 중…' : nextLabel }}
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import StepProgress from '@/components/common/StepProgress.vue'
import MascotTip from '@/components/common/MascotTip.vue'
import SelectCard from '@/components/common/SelectCard.vue'
import NumericKeypad from '@/components/common/NumericKeypad.vue'
import AppButton from '@/components/common/AppButton.vue'
import TipBox from '@/components/common/TipBox.vue'
import BankQuickMenu from '@/components/common/BankQuickMenu.vue'
import BankAmountAdjuster from '@/components/common/BankAmountAdjuster.vue'
import { useSessionStore } from '@/stores/session'
import { useTTS } from '@/composables/useTTS'
import { useBankTheme } from '@/composables/useBankTheme'
import { BANKS, getBankByCode } from '@/assets/data/banks'
import { ACCOUNTS, getAccountById } from '@/assets/data/accounts'
import { getScenarioById } from '@/assets/data/scenarios'
import { lookupReceiver, completePracticeTransfer, saveAttemptLog } from '@/api/practiceApi'

const props = defineProps({ stepNumber: { type: Number, required: true } })
const router = useRouter()
const store = useSessionStore()
const { speak } = useTTS()

const banks = BANKS
const accounts = ACCOUNTS
const submitting = ref(false)
const accountError = ref('')
const amountError = ref('')
const allChecked = ref(false)

const scenario = computed(() => getScenarioById(store.flow.scenarioId))
const selectedAccount = computed(() => getAccountById(store.flow.withdrawAccountId))
const receiverBank = computed(() => getBankByCode(store.flow.receiverBankCode))
const showHint = computed(() => store.settings.helpLevel !== 'solo')
// 은행 테마는 2단계에서 실제로 '받는 분 은행'을 고른 뒤부터 적용됩니다.
const { themeStyle, isKbStyle } = useBankTheme(receiverBank)
const quickAmounts = [10000, 50000, 100000]

const mascotMap = computed(() => ({
  1: `${scenario.value.title} 연습에 맞는 계좌를 골라보세요.`,
  2: `${scenario.value.title} 연습 상황에서 안내한 은행을 떠올려보세요.`,
  3: '입력 후 받는 분 확인하기를 눌러주세요.',
  4: '빠른 금액 버튼을 사용해도 좋아요.',
  5: '세 가지를 모두 확인해야 완료할 수 있어요.'
}))
const mascotText = computed(() => mascotMap.value[props.stepNumber])

const nextLabelMap = {
  1: '선택한 계좌로 계속 →',
  2: '모두 가상 은행이에요 →',
  3: '계좌번호 입력하고 →',
  4: '금액 입력하고 →',
  5: '✓ 모의 이체 완료'
}
const nextLabel = computed(() => nextLabelMap[props.stepNumber])

const maskedAccountNumber = computed(() => {
  const n = store.flow.accountNumber
  if (!n || n.length < 4) return n
  return n.slice(0, -4) + '****'
})
const remainingBalance = computed(() => (selectedAccount.value?.balance || 0) - store.flow.amount)

const canProceed = computed(() => {
  switch (props.stepNumber) {
    case 1:
      return !!store.flow.withdrawAccountId
    case 2:
      return !!store.flow.receiverBankCode
    case 3:
      return store.flow.receiverMatched === true
    case 4:
      return store.flow.amount > 0 && !amountError.value
    case 5:
      return allChecked.value
    default:
      return false
  }
})

onMounted(() => {
  if (!store.flow.mode) {
    router.replace('/practice')
    return
  }
  store.goToStep(props.stepNumber)
  if (showHint.value) speak(mascotText.value)
})

watch(
  () => props.stepNumber,
  (n) => {
    store.goToStep(n)
    if (showHint.value) speak(mascotMap.value[n])
  }
)

function onKeypadInput(digit) {
  if (store.flow.accountNumber.replace(/\D/g, '').length >= 14) return
  store.setAccountNumber(store.flow.accountNumber + digit)
  if (store.flow.receiverMatched !== null) store.setReceiverLookup({ name: null, matched: null })
}
function onBackspace() {
  store.setAccountNumber(store.flow.accountNumber.slice(0, -1))
  if (store.flow.receiverMatched !== null) store.setReceiverLookup({ name: null, matched: null })
}
function resetAccountNumber() {
  store.setAccountNumber('')
  store.setReceiverLookup({ name: null, matched: null })
  accountError.value = ''
}
async function lookup() {
  accountError.value = ''
  const digits = store.flow.accountNumber.replace(/\D/g, '')
  if (digits.length < 8) {
    accountError.value = '계좌번호 형식을 다시 확인해 주세요.'
    store.recordError()
    return
  }
  submitting.value = true
  try {
    const res = await lookupReceiver({
      sessionId: store.flow.sessionId,
      accountNumber: store.flow.accountNumber,
      bankCode: store.flow.receiverBankCode
    })
    store.setReceiverLookup({ name: res.name, matched: res.matched })
    if (!res.matched) {
      accountError.value = '일치하는 수취인을 찾지 못했어요.'
      store.recordError()
    }
  } catch (e) {
    accountError.value = e?.message || '조회 중 문제가 발생했어요.'
  } finally {
    submitting.value = false
  }
}

function onAmountKeypadInput(digit) {
  const current = String(store.flow.amount === 0 ? '' : store.flow.amount)
  applyAmount(Number(current + digit))
}
function onAmountBackspace() {
  const current = String(store.flow.amount)
  applyAmount(current.length <= 1 ? 0 : Number(current.slice(0, -1)))
}
function addAmount(v) {
  applyAmount(store.flow.amount + v)
}
function onAdjust(opt) {
  if (opt.type === 'all') {
    applyAmount(selectedAccount.value?.balance || 0)
  } else if (opt.type === 'subtract') {
    applyAmount(Math.max(0, store.flow.amount - opt.value))
  } else {
    applyAmount(store.flow.amount + opt.value)
  }
}
function applyAmount(v) {
  amountError.value = ''
  if (v < 0) return
  if (selectedAccount.value && v > selectedAccount.value.balance) {
    amountError.value = `가상 잔액(${selectedAccount.value.balance.toLocaleString('ko-KR')}원)을 넘을 수 없어요.`
  }
  store.setAmount(v)
}

function prevStep() {
  router.push(`/practice/step/${props.stepNumber - 1}`)
}

async function nextStep() {
  if (!canProceed.value) return

  if (props.stepNumber === 3) {
    router.push('/practice/step/4')
    return
  }

  if (props.stepNumber === 5) {
    submitting.value = true
    try {
      await completePracticeTransfer({
        sessionId: store.flow.sessionId,
        requestId: store.flow.requestId,
        withdrawAccountId: store.flow.withdrawAccountId,
        receiverBankCode: store.flow.receiverBankCode,
        accountNumber: store.flow.accountNumber,
        receiverName: store.flow.receiverName,
        amount: store.flow.amount
      })
      store.finishFlow({
        mode: 'practice',
        bankName: receiverBank.value?.name,
        receiverName: store.flow.receiverName,
        amount: store.flow.amount
      })
      await saveAttemptLog({
        mode: 'practice',
        scenarioId: store.flow.scenarioId,
        errorCount: store.flow.errorCount,
        helpUsedCount: store.flow.helpUsedCount
      })
      router.push('/practice/complete')
    } catch (e) {
      amountError.value = e?.message || '처리 중 문제가 발생했어요. 다시 시도해 주세요.'
    } finally {
      submitting.value = false
    }
    return
  }

  router.push(`/practice/step/${props.stepNumber + 1}`)
}

function goBack() {
  if (props.stepNumber > 1) {
    prevStep()
  } else {
    router.push('/practice')
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.field-group__label {
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: 6px;
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
}
.ghost-link {
  align-self: center;
  border: none;
  background: none;
  color: var(--color-primary);
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  font-size: var(--fs-caption);
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
  margin: 0 0 4px;
  font-size: var(--fs-title);
  font-weight: 800;
}
.receiver-confirm__meta {
  margin: 0;
  font-size: var(--fs-caption);
  color: var(--color-text-secondary);
}
.amount-display {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
}
.amount-display strong {
  font-size: var(--fs-display);
  color: var(--color-primary);
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
.confirm-card__row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--fs-body);
}
.confirm-card__row:last-child {
  border-bottom: none;
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
