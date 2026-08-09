<template>
  <div class="page">
    <AppHeader :title="mode === 'together' ? '함께 해보기' : '스스로 해보기'" badge="가상 연습" show-back show-home @back="router.push('/')" @home="router.push('/')" />

    <div class="screen">
      <h2 class="screen-title">어느 은행으로 연습할까요?</h2>
      <p class="screen-subtitle">고르신 은행 화면으로 이체 연습을 진행해요.</p>

      <MascotTip>
        {{ mode === 'together' ? '처음 배우기예요. 은행을 고르면 제가 화면마다 다 알려드릴게요.' : '은행을 고르면 다음 화면부터 그 은행 화면처럼 보여요.' }}
      </MascotTip>

      <div class="bank-list" data-tutor-id="bank-select-list">
        <SelectCard
          v-for="bank in banks"
          :key="bank.bankCode"
          :title="bank.bankName"
          :icon="bank.bankName.charAt(0)"
          :icon-bg="bank.themeColor + '22'"
          :selected="selectedCode === bank.bankCode"
          @click="selectedCode = bank.bankCode"
        />
      </div>

      <div class="spacer" />
      <AppButton :disabled="!selectedCode" @click="next">이 은행으로 계속 →</AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import SelectCard from '@/components/common/SelectCard.vue'
import MascotTip from '@/components/common/MascotTip.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useSessionStore } from '@/stores/session'
import { fetchBanks } from '@/api/practiceApi'
import { BANKS } from '@/assets/data/banks'
import type { Bank, BankCode } from '@/types'

const props = defineProps<{ mode: 'together' | 'practice' }>()
const router = useRouter()
const store = useSessionStore()

const banks = ref<Bank[]>(BANKS)
const selectedCode = ref<BankCode | null>(store.settings.defaultBankCode)

onMounted(async () => {
  banks.value = await fetchBanks()
})

function next() {
  if (!selectedCode.value) return
  store.setPendingBank(selectedCode.value)
  if (selectedCode.value === 'KB') {
    router.push({ path: '/kb-transfer', query: { mode: props.mode } })
    return
  }
  router.push(props.mode === 'together' ? '/together/start' : '/practice/level')
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.bank-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
