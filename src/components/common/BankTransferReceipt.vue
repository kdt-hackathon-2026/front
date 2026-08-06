<template>
  <div class="receipt">
    <p class="receipt__title">{{ receiverName }}님에게<br /><strong>{{ formattedAmount }}원</strong> 빠른이체가 되었습니다.</p>

    <div class="receipt__rows">
      <div class="receipt__row">
        <span>출금계좌</span>
        <strong>{{ withdrawLabel }}</strong>
      </div>
      <div class="receipt__row">
        <span>받는 분 정보</span>
        <strong>{{ receiverName }} · {{ bankName }} · {{ maskedAccountNumber }}</strong>
      </div>
      <div class="receipt__row">
        <span>수수료</span>
        <strong>무료 (교육용 연습)</strong>
      </div>
      <div class="receipt__row">
        <span>이체 후 잔액</span>
        <strong>{{ formattedRemaining }}원</strong>
      </div>
    </div>

    <div class="receipt__actions">
      <button class="receipt__btn" @click="$emit('home')">홈</button>
      <button class="receipt__btn receipt__btn--primary" @click="$emit('history')">예금거래내역 조회</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  receiverName: { type: String, required: true },
  bankName: { type: String, required: true },
  maskedAccountNumber: { type: String, default: '' },
  withdrawLabel: { type: String, default: '' },
  formattedAmount: { type: String, required: true },
  formattedRemaining: { type: String, default: '' }
})
defineEmits(['home', 'history'])
</script>

<style scoped>
.receipt {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.receipt__title {
  margin: 0;
  font-size: var(--fs-body-lg);
  line-height: 1.5;
  text-align: center;
}
.receipt__title strong {
  font-size: var(--fs-title-lg);
  color: var(--color-primary-dark);
}
.receipt__rows {
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.receipt__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--fs-caption);
}
.receipt__row span {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.receipt__row strong {
  text-align: right;
  font-weight: 700;
}
.receipt__actions {
  display: flex;
  gap: 8px;
}
.receipt__btn {
  flex: 1;
  min-height: 48px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-weight: 700;
  font-size: var(--fs-caption);
  cursor: pointer;
}
.receipt__btn--primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}
</style>
