<template>
  <div class="page">
    <AppHeader title="AI 튜터" show-back show-home @back="router.back()" @home="router.push('/')" />

    <div class="screen">
      <MascotTip>
        무엇이든 쉬운 말로 물어보세요. 예를 들어 "계좌이체 연습은 어디서 해?" 라고 말씀하셔도 돼요.
      </MascotTip>

      <div class="chat-log">
        <div v-for="(msg, i) in messages" :key="i" class="chat-msg" :class="msg.from">
          {{ msg.text }}
        </div>
      </div>

      <div class="quick-questions">
        <button
          v-for="q in quickQuestions"
          :key="q"
          class="quick-questions__chip"
          @click="ask(q)"
        >
          {{ q }}
        </button>
      </div>

      <div class="spacer" />

      <div class="ask-bar">
        <input
          v-model="draft"
          type="text"
          class="ask-bar__input"
          placeholder="궁금한 것을 입력하세요"
          @keyup.enter="ask(draft)"
        />
        <button class="ask-bar__mic" aria-label="음성으로 묻기" @click="showVoiceModal = true">🎤</button>
      </div>
    </div>

    <VoiceInputModal v-model="showVoiceModal" @result="onVoiceResult" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import MascotTip from '@/components/common/MascotTip.vue'
import VoiceInputModal from '@/components/common/VoiceInputModal.vue'
import { useTTS } from '@/composables/useTTS'

const router = useRouter()
const { speak } = useTTS()

const draft = ref('')
const showVoiceModal = ref(false)
const messages = ref([
  { from: 'bot', text: '안녕하세요! 무엇을 도와드릴까요?' }
])
const quickQuestions = ['계좌이체는 어디서 해?', '여기는 뭐 하는 화면이야?', '다음엔 뭘 눌러?']

function ask(text) {
  if (!text) return
  messages.value.push({ from: 'user', text })
  draft.value = ''
  // 실제 서비스에서는 백엔드 AI 응답 API 호출로 교체
  const reply = generateReply(text)
  messages.value.push({ from: 'bot', text: reply })
  speak(reply)
}

function onVoiceResult(text) {
  ask(text)
}

function generateReply(text) {
  if (text.includes('이체')) return '홈 화면 맨 위 "계좌이체 연습" 버튼을 눌러주세요. 함께 6단계로 연습해요.'
  if (text.includes('화면')) return '지금은 AI 튜터에게 궁금한 것을 물어보는 화면이에요.'
  return '조금 더 쉬운 말로 다시 한 번 말씀해 주시겠어요?'
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.chat-log {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.chat-msg {
  max-width: 82%;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  font-size: var(--fs-body);
  line-height: 1.5;
}
.chat-msg.bot {
  align-self: flex-start;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}
.chat-msg.user {
  align-self: flex-end;
  background: var(--color-primary);
  color: #fff;
}
.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.quick-questions__chip {
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  background: #fff;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: var(--fs-caption);
  font-weight: 700;
  cursor: pointer;
}
.ask-bar {
  display: flex;
  gap: 8px;
  position: sticky;
  bottom: 12px;
}
.ask-bar__input {
  flex: 1;
  min-height: var(--tap-min);
  border-radius: 999px;
  border: 1px solid var(--color-border);
  padding: 0 18px;
  font-size: var(--fs-body);
  background: var(--color-surface);
}
.ask-bar__mic {
  width: var(--tap-min);
  height: var(--tap-min);
  border-radius: 50%;
  border: none;
  background: var(--color-primary);
  color: #fff;
  font-size: 22px;
  cursor: pointer;
}
</style>
