<template>
  <div class="page" :style="isKbStyle ? themeStyle : {}">
    <AppHeader title="함께 해보기" badge="가상 연습" show-back show-home :bank="isKbStyle ? receiverBank : null" @back="goBack" @home="router.push('/')" />
    <StepProgress :current="stepNumber" :total="5" />

    <div class="screen">
      <MascotTip v-if="mascotText">{{ mascotText }}</MascotTip>

      <!-- 1/5 출금 계좌 -->
      <template v-if="stepNumber === 1">
        <h2 class="screen-title">출금 계좌를 고르세요</h2>
        <p class="screen-subtitle">{{ scenario.title }}에 사용할 계좌를 골라주세요.</p>
        <SelectCard
          v-for="acc in accounts"
          :key="acc.id"
          :title="acc.name"
          :subtitle="`${acc.bankName} · ${acc.numberMasked} · 가상 잔액 ${acc.balance.toLocaleString('ko-KR')}원`"
          :icon="acc.icon"
          :selected="store.flow.withdrawAccountId === acc.id"
          @click="store.setWithdrawAccount(acc.id)"
        />
      </template>

      <!-- 2/5 받는 분 은행 -->
      <template v-else-if="stepNumber === 2">
        <h2 class="screen-title">받는 분 은행을 고르세요</h2>
        <p class="screen-subtitle">{{ scenario.title }}에서 안내한 은행을 눌러주세요.</p>
        <SelectCard
          v-for="bank in banks"
          :key="bank.code"
          :title="bank.name"
          :subtitle="bank.code === scenario.receiverBankCode ? '이번 연습에서 안내한 은행' : ''"
          :icon="bank.shortName"
          :selected="store.flow.receiverBankCode === bank.code"
          @click="store.setReceiverBank(bank.code)"
        />
        <!-- 은행을 고르는 순간부터 그 은행 화면 스타일로 바뀌어요 -->
        <BankQuickMenu v-if="isKbStyle" :items="receiverBank.theme.quickMenu" active="이체" />
      </template>

      <!-- 3/5 계좌번호 입력 -->
      <template v-else-if="stepNumber === 3">
        <h2 class="screen-title">계좌번호를 입력하세요</h2>
        <p class="screen-subtitle">숫자만 천천히 눌러주세요. {{ scenario.title }} 내용과 같은지 다시 확인해요.</p>
        <div class="number-display">{{ formattedAccountNumber || '계좌번호를 입력해 주세요' }}</div>
        <NumericKeypad
          @input="onKeypadInput"
          @backspace="onBackspace"
          @clear="resetLookup"
        />
        <AppButton variant="outline" :disabled="submitting" @click="lookup">
          {{ submitting ? '조회 중…' : '🔍 계좌번호 조회' }}
        </AppButton>

        <div v-if="store.flow.receiverMatched" class="receiver-confirm">
          <p class="receiver-confirm__label">받는 분 확인 <span class="badge">조회 완료</span></p>
          <p class="receiver-confirm__value">{{ store.flow.receiverName }}</p>
          <p class="receiver-confirm__meta">{{ scenario.title }}의 받는 사람과 이름이 같은지 확인하세요.</p>
        </div>
        <TipBox v-if="accountError" tone="danger" icon="⚠️">{{ accountError }}</TipBox>
      </template>

      <!-- 4/5 금액 -->
      <template v-else-if="stepNumber === 4">
        <h2 class="screen-title">보낼 금액을 넣으세요</h2>
        <p class="screen-subtitle">숫자와 한글 금액을 함께 확인해요.</p>
        <div class="amount-display">
          <strong>{{ store.formattedAmount }}원</strong>
          <span>{{ koreanAmount }}</span>
        </div>
        <BankAmountAdjuster v-if="isKbStyle" @adjust="onAdjust" />
        <div v-else class="quick-amounts">
          <button v-for="q in quickAmounts" :key="q" class="quick-amounts__btn" @click="addAmount(q)">
            {{ (q / 10000) }}만
          </button>
        </div>
        <NumericKeypad
          @input="onAmountKeypadInput"
          @backspace="onAmountBackspace"
          @clear="store.setAmount(0)"
        />
        <TipBox v-if="amountError" tone="danger" icon="⚠️">{{ amountError }}</TipBox>
        <TipBox v-else tone="yellow" icon="✅">가상 잔액 {{ selectedAccount?.balance?.toLocaleString('ko-KR') }}원 안에서 가능</TipBox>
      </template>

      <!-- 5/5 최종 확인 -->
      <template v-else-if="stepNumber === 5">
        <h2 class="screen-title">마지막으로 확인하세요</h2>
        <p class="screen-subtitle">받는 분, 은행, 금액을 세 가지 확인해요.</p>
        <div class="confirm-card">
          <ConfirmRow
            label="받는 분"
            :value="receiverDisplayName"
            :checked="store.flow.confirmed.receiver"
            @toggle="store.toggleConfirm('receiver')"
            @edit="router.push('/together/step/2')"
          />
          <ConfirmRow
            label="은행·계좌"
            :value="`${receiverBank?.name || ''} · ${maskedAccountNumber}`"
            :checked="store.flow.confirmed.account"
            @toggle="store.toggleConfirm('account')"
            @edit="router.push('/together/step/3')"
          />
          <ConfirmRow
            label="보낼 금액"
            :value="`${store.formattedAmount}원`"
            :checked="store.flow.confirmed.amount"
            @toggle="store.toggleConfirm('amount')"
            @edit="router.push('/together/step/4')"
          />
        </div>
        <TipBox tone="yellow" icon="🔒">실제 인증정보(비밀번호·OTP)는 입력하지 않아요. 이 화면에서 확인 버튼만 누르면 완료돼요.</TipBox>
      </template>

      <div class="spacer" />

      <div class="footer-actions">
        <AppButton variant="outline" v-if="stepNumber > 1" @click="prevStep">이전</AppButton>
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
import ConfirmRow from '@/components/common/ConfirmRow.vue'
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

const scenario = computed(() => getScenarioById(store.flow.scenarioId))
const selectedAccount = computed(() => getAccountById(store.flow.withdrawAccountId))
const receiverBank = computed(() => getBankByCode(store.flow.receiverBankCode))
// 은행 테마는 '받는 분 은행'을 실제로 고른 뒤(2단계~)부터 적용됩니다.
// 1단계(출금 계좌 고르기)는 아직 은행을 선택하지 않은 상태라 우리 앱 기본 테마를 유지해요.
const { themeStyle, isKbStyle } = useBankTheme(receiverBank)

const quickAmounts = [10000, 50000, 100000]

const mascotMap = computed(() => ({
  1: `카드를 눌러 출금 계좌를 골라주세요.`,
  2: `${scenario.value.title}에서 안내한 은행을 골라볼까요?`,
  3: '숫자를 하나씩 천천히 눌러주세요.',
  4: '만원 단위 버튼을 쓰면 더 쉬워요.',
  5: '세 가지를 모두 확인해야 완료할 수 있어요.'
}))
const mascotText = computed(() => mascotMap.value[props.stepNumber])

const nextLabelMap = {
  1: '선택했어요, 다음 →',
  2: '은행 선택 완료 →',
  3: '조회 결과가 맞아요 →',
  4: '금액 확인 완료 →',
  5: '세 가지 확인하고 완료 →'
}
const nextLabel = computed(() => nextLabelMap[props.stepNumber])

const formattedAccountNumber = computed(() => store.flow.accountNumber)
const maskedAccountNumber = computed(() => {
  const n = store.flow.accountNumber
  if (!n || n.length < 4) return n
  return n.slice(0, -4) + '****'
})
const receiverDisplayName = computed(() => store.flow.receiverName || '조회 전')

const koreanAmount = computed(() => amountToKorean(store.flow.amount))

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
      return store.flow.confirmed.receiver && store.flow.confirmed.account && store.flow.confirmed.amount
    default:
      return false
  }
})

onMounted(() => {
  if (!store.flow.mode) {
    // 세션 없이 직접 접근한 경우 인트로로 되돌림
    router.replace('/together')
    return
  }
  store.goToStep(props.stepNumber)
  speak(mascotText.value)
  // 함께 해보기는 연습 상황(시나리오)의 금액 값을 미리 채워 보여줌(교육 목적)
  if (props.stepNumber === 4 && store.flow.amount === 0) {
    store.setAmount(scenario.value.amount)
  }
})

watch(
  () => props.stepNumber,
  (n) => {
    store.goToStep(n)
    speak(mascotMap.value[n])
    if (n === 4 && store.flow.amount === 0) {
      store.setAmount(scenario.value.amount)
    }
  }
)

function onKeypadInput(digit) {
  if (store.flow.accountNumber.replace(/\D/g, '').length >= 14) return
  store.setAccountNumber(store.flow.accountNumber + digit)
  if (store.flow.receiverMatched !== null) resetLookup(false)
}
function onBackspace() {
  store.setAccountNumber(store.flow.accountNumber.slice(0, -1))
  if (store.flow.receiverMatched !== null) resetLookup(false)
}
function resetLookup(clearNumber = true) {
  if (clearNumber) store.setAccountNumber('')
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
      accountError.value = '일치하는 수취인을 찾지 못했어요. 계좌번호를 다시 확인해 주세요.'
      store.recordError()
    }
  } catch (e) {
    accountError.value = e?.message || '조회 중 문제가 발생했어요. 다시 시도해 주세요.'
    store.recordError()
  } finally {
    submitting.value = false
  }
}

function onAmountKeypadInput(digit) {
  const current = String(store.flow.amount === 0 ? '' : store.flow.amount)
  const next = Number(current + digit)
  applyAmount(next)
}
function onAmountBackspace() {
  const current = String(store.flow.amount)
  const next = current.length <= 1 ? 0 : Number(current.slice(0, -1))
  applyAmount(next)
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

function amountToKorean(n) {
  if (!n) return '0원'
  const man = Math.floor(n / 10000)
  const rest = n % 10000
  let text = ''
  if (man > 0) text += `${man.toLocaleString('ko-KR')}만 `
  if (rest > 0) text += `${rest.toLocaleString('ko-KR')}`
  return text.trim() + '원'
}

async function prevStep() {
  router.push(`/together/step/${props.stepNumber - 1}`)
}

async function nextStep() {
  if (!canProceed.value) return

  if (props.stepNumber === 2) {
    router.push('/together/step/3')
    return
  }

  if (props.stepNumber === 3) {
    // 조회는 위의 '계좌번호 조회' 버튼에서 이미 완료됨 (canProceed가 receiverMatched를 확인)
    router.push('/together/step/4')
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
        mode: 'together',
        bankName: receiverBank.value?.name,
        receiverName: store.flow.receiverName,
        amount: store.flow.amount
      })
      await saveAttemptLog({
        mode: 'together',
        scenarioId: store.flow.scenarioId,
        errorCount: store.flow.errorCount,
        helpUsedCount: store.flow.helpUsedCount
      })
      router.push('/together/complete')
    } catch (e) {
      amountError.value = e?.message || '처리 중 문제가 발생했어요. 다시 시도해 주세요.'
    } finally {
      submitting.value = false
    }
    return
  }

  router.push(`/together/step/${props.stepNumber + 1}`)
}

function goBack() {
  if (props.stepNumber > 1) {
    prevStep()
  } else {
    router.push('/together')
  }
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
.footer-actions {
  display: flex;
  gap: 10px;
}
.footer-actions > * {
  flex: 1;
}
</style>
