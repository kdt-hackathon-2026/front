<template>
  <div class="messages-page">
    <AppHeader
      v-if="!selectedMessage"
      title="메시지"
      show-back
      show-home
      @back="goHome"
      @home="goHome"
    />

    <template v-if="selectedMessage">
      <AppHeader :title="selectedMessage.sender" show-back show-home home-tutor-id="message-home-button" @back="closeMessage" @home="goHome" />
      <main class="message-detail screen">
        <div
          class="message-focus-area"
          :class="{ 'is-suspicious-focus': selectedMessage.isSuspicious && suspiciousWarningShown }"
          :data-tutor-id="selectedMessage.isSuspicious ? 'message-suspicious-focus' : undefined"
        >
          <div class="detail-contact">
            <span class="contact-avatar"><Icon name="user" :size="26" /></span>
            <div><strong>{{ selectedMessage.sender }}</strong><small>{{ selectedMessage.phone }}</small></div>
            <span class="detail-date">{{ selectedMessage.date }}</span>
          </div>

          <article class="message-bubble">
          <p>{{ selectedMessage.body }}</p>
          <button v-if="selectedMessage.isSuspicious" class="message-suspicious-link" data-tutor-id="message-suspicious-link" type="button" @click="warnAboutSuspiciousLink">
            {{ selectedMessage.linkLabel }}
          </button>
          <button v-else class="message-account-link" data-tutor-id="message-account-link" type="button" @click="openCopyPopup(selectedMessage.account)">
            {{ selectedMessage.bank }} {{ selectedMessage.account }}
          </button>
          <p v-if="!selectedMessage.isSuspicious" class="message-bubble__notice">{{ selectedMessage.notice }}</p>
          <small v-if="copiedAccount" class="copy-feedback">계좌번호를 복사했어요.</small>
          <time>{{ selectedMessage.date }}</time>
          </article>
        </div>

        <p v-if="selectedMessage.isSuspicious && suspiciousWarningShown" class="suspicious-warning-text">이 링크는 누르면 안 돼요. 문자 링크를 닫고 공식 앱이나 대표번호로 직접 확인하세요.</p>

        <div v-if="copyTarget" class="copy-modal-layer" @click.self="closeCopyPopup">
          <section class="copy-modal" role="dialog" aria-modal="true" aria-labelledby="copy-modal-title">
            <h2 id="copy-modal-title">계좌번호 복사</h2>
            <p>복사하시겠어요?</p>
            <div class="copy-modal__actions">
              <button type="button" @click="closeCopyPopup">취소</button>
              <button type="button" class="copy-modal__confirm" data-tutor-id="copy-confirm-button" @click="confirmCopy">복사하기</button>
            </div>
          </section>
        </div>

        <section v-if="!selectedMessage.isSuspicious" class="request-card" aria-label="이체 요청 정보">
          <div class="request-card__heading"><Icon name="receipt" :size="20" /> 이체 요청</div>
          <div class="request-card__amount">{{ selectedMessage.amount }}</div>
          <p>{{ selectedMessage.bank }} {{ selectedMessage.account }}</p>
        </section>

        <p class="demo-note">이 메시지는 실제 연락이 아닌 가상 연습용 메시지입니다.</p>
        <div class="spacer" />
        <AppButton v-if="!selectedMessage.isSuspicious" data-tutor-id="message-practice-button" @click="startPractice">이 요청으로 이체 연습</AppButton>
      </main>
    </template>

    <main v-else class="message-list screen">
      <div class="message-list__title">
        <div><h2>받은 메시지</h2><span>새 메시지 {{ unreadCount }}개</span></div>
        <button aria-label="메시지 검색"><Icon name="search" :size="24" /></button>
      </div>
      <p class="message-list__hint">연습에 사용할 이체 요청을 메시지에서 확인해보세요.</p>

      <div class="message-list__items">
        <button
          v-for="message in messages"
          :key="message.id"
          class="message-card"
          :data-tutor-id="message.id === 1 ? 'message-card-1' : undefined"
          :class="{ unread: message.unread }"
          @click="openMessage(message)"
        >
          <span class="contact-avatar"><Icon name="user" :size="23" /></span>
          <span class="message-card__content">
            <span class="message-card__top"><strong>{{ message.sender }}</strong><time>{{ message.date }}</time></span>
            <span class="message-card__phone">{{ message.phone }}</span>
            <span class="message-card__preview">{{ message.preview }}</span>
          </span>
          <span v-if="message.unread" class="unread-dot" aria-label="읽지 않음" />
          <Icon name="chevron-right" :size="20" class="message-card__arrow" />
        </button>
      </div>

      <div class="message-safety"><Icon name="shield" :size="20" /><span>모든 메시지는 실제 송금이 아닌 가상 연습용으로 제공됩니다.</span></div>
    </main>

    <AiHelperFab v-if="!selectedMessage" @click="openMessageGuide" />
    <BottomNav v-model="activeTab" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/common/AppButton.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AiHelperFab from '@/components/common/AiHelperFab.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import Icon from '@/components/common/icons/Icon.vue'
import { useTutorStore } from '@/stores/tutor'

type PracticeMessage = {
  id: number
  sender: string
  phone: string
  date: string
  preview: string
  body: string
  notice: string
  amount: string
  bank: string
  account: string
  isSuspicious?: boolean
  linkLabel?: string
  unread: boolean
}

const router = useRouter()
const tutor = useTutorStore()
const activeTab = ref('messages')
const selectedMessage = ref<PracticeMessage | null>(null)
const suspiciousWarningShown = ref(false)
const copyTarget = ref<string | null>(null)
const copiedAccount = ref(false)
let copyFeedbackTimer: number | undefined
const messages = ref<PracticeMessage[]>([
  {
    id: 1,
    sender: '김씨 할머니',
    phone: '010-1234-5678',
    date: '오늘 오후 7:12',
    preview: '복자야, 김씨 할머니야. 이번 달 용돈 30,000원 부탁해.',
    body: '복자야\n김씨 할머니야. 이번 달 용돈 조금만 보내줄 수 있을까?',
    notice: '※ 실제 계좌가 아닙니다.',
    amount: '30,000원',
    bank: 'KB국민은행',
    account: '943202-00-582932',
    unread: true
  },
  {
    id: 2,
    sender: '딸',
    phone: '010-9876-5432',
    date: '오늘 오후 5:40',
    preview: '엄마, 장보는 데 필요한 금액 50,000원 입금해주세요.',
    body: '엄마\n오늘 장보는 데 필요한 금액 50,000원 입금해주세요.',
    notice: '※ 실제 계좌가 아닙니다.',
    amount: '50,000원',
    bank: 'KB국민은행',
    account: '943202-00-582932',
    unread: true
  },
  {
    id: 3,
    sender: '박보영복지사',
    phone: '010-2468-1357',
    date: '어제 오후 2:18',
    preview: '김복자씨, 필요한 금액 1,000원만 입금해주세요.',
    body: '김복자씨, 안녕하세요.\n박보영복지사입니다.\n필요한 금액 1,000원만 입금해주세요.',
    notice: '※ 실제 계좌가 아닙니다.',
    amount: '1,000원',
    bank: 'KB국민은행',
    account: '943202-00-582932',
    unread: false
  },
  {
    id: 4,
    sender: '070-0000-1234',
    phone: '070-0000-1234',
    date: '오늘 오후 1:26',
    preview: '[배송안내] 주소 오류로 배송이 보류되었습니다. 링크에서 확인하세요.',
    body: '[배송안내]\n주소 오류로 배송이 보류되었습니다.\n배송을 계속하려면 아래 링크에서 주소를 확인해 주세요.',
    notice: '※ 출처가 불분명한 링크가 포함된 의심 문자입니다.',
    amount: '',
    bank: '',
    account: '',
    isSuspicious: true,
    linkLabel: '확인하러 가기',
    unread: true
  }
])

const unreadCount = computed(() => messages.value.filter((message) => message.unread).length)

function goHome() {
  if (tutor.walkthroughStep === 'message-home') tutor.setWalkthroughStep('home-transfer')
  tutor.close()
  router.push('/')
}
function openMessageGuide() {
  tutor.openForScreen('MESSAGES', { force: true })
}
function openMessage(message: PracticeMessage) {
  message.unread = false
  selectedMessage.value = message
  suspiciousWarningShown.value = false
  if (message.id === 1) tutor.setWalkthroughStep('message-detail')
}
function closeMessage() {
  selectedMessage.value = null
  suspiciousWarningShown.value = false
}
function startPractice() { router.push('/practice') }
function openCopyPopup(account: string) {
  copyTarget.value = account
  tutor.setWalkthroughStep('copy')
}
function warnAboutSuspiciousLink() {
  suspiciousWarningShown.value = true
}
function closeCopyPopup() { copyTarget.value = null }
async function confirmCopy() {
  if (!copyTarget.value) return
  await copyAccount(copyTarget.value)
  closeCopyPopup()
  tutor.setWalkthroughStep('message-home')
  tutor.openForScreen('MESSAGE_HOME', { force: true })
}
async function copyAccount(account: string) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(account)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = account
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    copiedAccount.value = true
    if (copyFeedbackTimer) window.clearTimeout(copyFeedbackTimer)
    copyFeedbackTimer = window.setTimeout(() => { copiedAccount.value = false }, 1800)
  } catch {
    copiedAccount.value = false
  }
}
</script>

<style scoped>
.messages-page { min-height: 100vh; background: var(--color-bg); }
.message-list, .message-detail { min-height: calc(100vh - 68px); }
.message-list__title { display:flex; align-items:flex-start; justify-content:space-between; }
.message-list__title h2 { margin:0; font-size:var(--fs-title); }
.message-list__title span { display:block; margin-top:5px; color:var(--color-text-secondary); font-size:var(--fs-caption); }
.message-list__title button { display:grid; place-items:center; width:48px; height:48px; border:1px solid var(--color-border); border-radius:50%; background:var(--color-surface); color:var(--color-primary); }
.message-list__hint { margin:0; padding:13px 15px; border:1px solid var(--color-tip-border); border-radius:var(--radius-sm); background:var(--color-tip-bg); color:var(--color-tip-text); font-size:var(--fs-caption); line-height:1.45; }
.message-list__items { display:flex; flex-direction:column; gap:10px; }
.message-card { position:relative; display:flex; align-items:flex-start; gap:12px; width:100%; padding:16px 12px; border:1px solid var(--color-border); border-radius:var(--radius-md); background:var(--color-surface); text-align:left; box-shadow:var(--shadow-card); }
.message-card.unread { border-color:var(--color-primary-light); background:#fbfdff; }
.contact-avatar { display:grid; place-items:center; flex:0 0 46px; width:46px; height:46px; border-radius:50%; background:#e8f0fe; color:var(--color-primary); }
.message-card__content { display:flex; min-width:0; flex:1; flex-direction:column; gap:4px; }
.message-card__top { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.message-card__top strong { font-size:var(--fs-body-lg); }.message-card__top time,.message-card__phone { color:var(--color-text-muted); font-size:var(--fs-caption); }
.message-card__preview { overflow:hidden; color:var(--color-text-secondary); font-size:var(--fs-body); text-overflow:ellipsis; white-space:nowrap; }
.unread-dot { flex:0 0 9px; width:9px; height:9px; margin-top:7px; border-radius:50%; background:#e34848; }.message-card__arrow { align-self:center; color:var(--color-text-muted); }
.message-safety { display:flex; align-items:flex-start; gap:8px; margin-top:auto; padding:13px 14px; border-radius:var(--radius-sm); background:#eef6f3; color:#28644f; font-size:var(--fs-caption); line-height:1.4; }
.detail-contact { display:flex; align-items:center; gap:12px; padding-bottom:12px; border-bottom:1px solid var(--color-border); }.detail-contact>div { display:flex; flex:1; flex-direction:column; gap:4px; }.detail-contact strong { font-size:var(--fs-body-lg); }.detail-contact small,.detail-date { color:var(--color-text-secondary); font-size:var(--fs-caption); }.detail-date { align-self:flex-start; }
.message-bubble { align-self:flex-start; max-width:92%; padding:18px; border-radius:6px 18px 18px 18px; background:var(--color-surface); box-shadow:var(--shadow-card); }.message-bubble p { margin:0; white-space:pre-line; font-size:var(--fs-body); line-height:1.65; }.message-account-link { display:block; margin-top:8px; padding:0; border:0; background:transparent; color:#1769d1; font:inherit; font-size:var(--fs-body); text-align:left; text-decoration:underline; cursor:pointer; }.message-bubble__notice { margin-top:10px !important; color:#c0392b; font-size:var(--fs-caption) !important; font-weight:700; }.copy-feedback { display:block; margin-top:5px; color:var(--color-success); font-size:var(--fs-caption); }.message-bubble time { display:block; margin-top:12px; color:var(--color-text-muted); font-size:var(--fs-caption); text-align:right; }
.message-focus-area.is-suspicious-focus { padding:6px; border:3px solid #d94a42; border-radius:14px; }
.request-card { padding:18px; border:1px solid var(--color-primary-light); border-radius:var(--radius-md); background:#f7faff; }.request-card__heading { display:flex; align-items:center; gap:7px; color:var(--color-primary); font-weight:800; }.request-card__amount { margin-top:13px; font-size:var(--fs-title-lg); font-weight:800; }.request-card p { margin:5px 0 0; color:var(--color-text-secondary); font-size:var(--fs-body); }.demo-note { margin:0; color:var(--color-text-muted); font-size:var(--fs-caption); text-align:center; }
.copy-modal-layer { position:fixed; inset:0; z-index:80; display:grid; place-items:center; padding:20px; background:rgba(15, 23, 42, .38); }
.copy-modal { position:relative; width:min(100%, 360px); padding:26px 22px 20px; border-radius:18px; background:var(--color-surface); box-shadow:0 14px 36px rgba(20, 30, 60, .22); text-align:center; }
.copy-modal__close { position:absolute; top:10px; right:12px; width:36px; height:36px; border:0; background:transparent; color:var(--color-text-muted); font-size:28px; line-height:1; cursor:pointer; }
.copy-modal h2 { margin:0; font-size:var(--fs-body-lg); }.copy-modal p { margin:12px 0 14px; color:var(--color-text-secondary); font-size:var(--fs-caption); }.copy-modal > strong { display:block; color:#1769d1; font-size:var(--fs-body-lg); letter-spacing:.02em; }
.copy-modal__actions { display:flex; gap:8px; margin-top:22px; }.copy-modal__actions button { flex:1; min-height:48px; border:1px solid var(--color-border); border-radius:10px; background:var(--color-surface); color:var(--color-text-secondary); font-weight:700; cursor:pointer; }.copy-modal__actions .copy-modal__confirm { border-color:var(--color-primary); background:var(--color-primary); color:#fff; }
.message-suspicious-link { display:block; margin-top:10px; padding:0; border:0; background:transparent; color:#1769d1; font:inherit; font-size:var(--fs-body); text-align:left; text-decoration:underline; cursor:pointer; }
.suspicious-warning-text { margin:0; padding:0 2px; color:#c0392b !important; font-size:var(--fs-body) !important; line-height:1.65 !important; font-weight:700; }
</style>
