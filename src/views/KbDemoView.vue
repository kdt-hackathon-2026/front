<template>
  <main class="kb-app" :class="{ 'large-mode': largeText, 'easy-mode': easyMode, 'dark-mode': darkMode }">
    <div class="status-bar" aria-label="상태 표시줄">
      <span>U+ <strong>{{ currentTime }}</strong></span>
      <span class="status-bar__icons" aria-label="네트워크 연결됨"><Icon name="volume" :size="15" /> LTE</span>
      <span>80%</span>
    </div>

    <section v-if="screen === 'home'" class="kb-page kb-home-page">
      <div class="home-topbar">
        <div class="simple-home">
          간편홈
          <button class="switch" :class="{ 'is-on': easyMode }" aria-label="간편홈 전환" @click="toggleEasyMode">
            <span />
          </button>
        </div>
        <nav class="home-links" aria-label="KB 메뉴">
          <button @click="notifyUnavailable"><Icon name="bell" :size="20" /><small>알림</small><i /></button>
          <button @click="notifyUnavailable">상담</button>
          <button @click="notifyUnavailable">검색</button>
          <button @click="openMenu">메뉴</button>
        </nav>
      </div>

      <button class="profile-row" @click="openMenu">
        <span class="profile-avatar"><Icon name="user" :size="19" /></span>
        <strong>{{ profileName }}님</strong><Icon name="chevron-right" :size="20" class="chevron" />
        <span class="family-pill"><Icon name="users" :size="16" /> 패밀리</span>
      </button>

      <article class="account-card" aria-label="본인 계좌 선택">
        <div class="account-switch-controls" data-tutor-id="kb-account-switches" aria-label="출금할 계좌 선택">
        <button class="account-switch account-switch--prev" aria-label="이전 본인 계좌" :disabled="homeAccountIndex === 0" @click="showPreviousAccount">
          <Icon name="chevron-left" :size="22" />
        </button>
        <button class="account-switch account-switch--next" aria-label="다음 본인 계좌" :disabled="homeAccountIndex === sourceAccounts.length - 1" @click="showNextAccount">
          <Icon name="chevron-right" :size="22" />
        </button>
        </div>
        <div class="account-card__title">
          <span class="kb-mark">KB</span>
          <span>{{ currentHomeAccount.name || '보통예금' }}</span>
          <button aria-label="계좌 메뉴" @click="notifyUnavailable"><Icon name="menu" :size="20" /></button>
        </div>
        <div class="account-number">{{ formatAccount(currentHomeAccount.number) }} <button aria-label="계좌번호 복사" @click="copyAccount(currentHomeAccount.number)"><Icon name="copy" :size="17" /></button></div>
        <div class="account-balance">{{ currentHomeAccountBalance.toLocaleString('ko-KR') }}<span>원</span> <em>숨김</em></div>
        <div class="account-actions">
          <button class="primary-yellow" data-tutor-id="transfer-practice-button" @click="startTransferFrom(currentHomeAccount)">계좌이체</button>
          <button class="disabled-action" @click="notifyUnavailable">연락처이체</button>
        </div>
        <span class="account-switch__position">{{ homeAccountIndex + 1 }} / {{ sourceAccounts.length }}</span>
      </article>

      <button class="representative-row" @click="openSettings">
        <span><Icon name="settings" :size="19" /> 대표계좌 설정</span><strong>2 / 4</strong>
      </button>

      <div class="home-service-card">
        <button @click="notifyUnavailable"><span class="service-icon green"><Icon name="building" /></span><span><strong>은행가서 기다리지 않는 방법</strong><small>번호표 미리 뽑기</small></span><Icon name="chevron-right" /></button>
        <button @click="openHistory"><span class="service-icon yellow"><Icon name="history" /></span><strong>통합거래내역</strong><Icon name="chevron-right" /></button>
        <button @click="notifyUnavailable"><span class="service-icon purple"><Icon name="refresh" /></span><strong>자동이체 관리</strong><Icon name="chevron-right" /></button>
        <button @click="notifyUnavailable"><span class="service-icon teal"><Icon name="shield" /></span><strong>보안서비스</strong><Icon name="chevron-right" /></button>
        <button @click="openSettings"><span class="service-icon gray"><Icon name="settings" /></span><strong>환경설정</strong><Icon name="chevron-right" /></button>
      </div>

      <div class="ars-card">
        <strong><Icon name="alert-triangle" :size="20" /> 사고신고 전화(ARS)</strong>
        <div><button @click="notifyUnavailable"><Icon name="phone" :size="18" /> 1588-9999</button><button @click="notifyUnavailable"><Icon name="phone" :size="18" /> 1599-9999</button></div>
      </div>
      <p class="notice-line"><Icon name="megaphone" :size="18" /> 공지&nbsp; 2026년 KB국민은행 금융자산 안내</p>
      <div class="kb-paybar"><span><Icon name="wallet" :size="20" /> KB Pay</span><span><Icon name="document" :size="20" /> 국민지갑(신분증)</span></div>
      <nav class="bottom-nav" aria-label="하단 메뉴">
        <button class="active" @click="notifyUnavailable"><Icon name="wallet" /><small>전체계좌</small></button>
        <button @click="notifyUnavailable"><Icon name="building" /><small>금융상품</small></button>
        <button @click="notifyUnavailable"><Icon name="chart" /><small>자산관리</small></button>
        <button @click="notifyUnavailable"><Icon name="gift" /><small>혜택</small></button>
        <button @click="notifyUnavailable"><Icon name="car" /><small>자동차</small></button>
      </nav>
    </section>

    <section v-else-if="screen === 'menu'" class="kb-page menu-page">
      <div class="menu-head"><button @click="goHome">로그아웃 <Icon name="chevron-right" :size="17" /></button><div><button aria-label="검색" @click="notifyUnavailable"><Icon name="search" /></button><button aria-label="닫기" @click="goHome"><Icon name="close" /></button></div></div>
      <div class="menu-shortcuts"><button @click="notifyUnavailable"><Icon name="phone" />고객센터</button><button @click="notifyUnavailable"><Icon name="shield" />인증/보안</button><button @click="openSettings"><Icon name="settings" />환경설정</button></div>
      <div class="menu-section"><div class="section-heading"><strong>최근/My메뉴</strong><button @click="notifyUnavailable">My메뉴 설정 <Icon name="chevron-right" :size="17" /></button></div><div class="chip-row"><button @click="openSettings"><Icon name="settings" :size="17" /> 환경설정</button><button @click="notifyUnavailable"><Icon name="star" :size="17" /> 환전 신청</button></div></div>
      <div class="menu-section product-section"><h2><span class="kb-mini">KB</span> 상품가입/관리</h2><div class="product-grid"><button @click="notifyUnavailable">추천상품</button><button @click="notifyUnavailable">예적금</button><button @click="notifyUnavailable">대출</button><button @click="notifyUnavailable">입출금</button><button @click="notifyUnavailable">퇴직연금</button><button @click="notifyUnavailable">펀드</button><button @click="notifyUnavailable">청약/채권</button><button @click="notifyUnavailable">ISA</button><button @click="notifyUnavailable">외화예금</button><button @click="notifyUnavailable">보험</button><button @click="notifyUnavailable">신탁</button><button @click="notifyUnavailable">골드/실버</button></div></div>
      <div class="menu-section inquiry-section"><h2><span class="round-icon"><Icon name="search" /></span> 조회</h2><button @click="notifyUnavailable">전체계좌조회</button><button @click="openHistory">통합거래내역조회</button><button @click="notifyUnavailable">패밀리뱅킹<small>부부 모임통장/노후자금, 우리아이 금융상품 관리</small></button><button @click="notifyUnavailable">휴면예금·보험금 찾기</button><button @click="notifyUnavailable">계좌관리<small>비밀번호 관리, 계좌통합관리서비스 등</small></button></div>
      <button class="menu-transfer" data-tutor-id="kb-menu-transfer" @click="startTransfer">➜ 이체/출금</button>
    </section>

    <section v-else-if="screen === 'settings'" class="kb-page settings-page">
      <KbHeader title="환경설정" @back="openMenu" @home="goHome" />
      <div class="settings-list">
        <p class="settings-label">앱 환경설정</p>
        <button @click="notifyUnavailable"><strong>로그인 방법</strong><span class="blue-text">앱 열 때마다 로그인</span><Icon name="chevron-right" /></button>
        <button @click="notifyUnavailable"><strong>언어(Language)</strong><Icon name="chevron-right" /></button>
        <button @click="toggleNotification"><strong>알림 설정</strong><span>{{ notificationEnabled ? '켜짐' : '꺼짐' }}</span><span class="switch" :class="{ 'is-on': notificationEnabled }"><i /></span></button>
        <button data-tutor-id="kb-easy-settings-link" @click="openEasySettings"><strong>간편모드/큰글씨 뱅킹 설정</strong><Icon name="chevron-right" /></button>
        <button @click="toggleDarkMode"><strong>다크모드</strong><small>눈의 피로감을 덜어주는 다크모드 설정</small><span class="switch" :class="{ 'is-on': darkMode }"><i /></span></button>
        <button @click="notifyUnavailable"><strong>흔들기</strong><small>휴대폰을 흔들어 설정한 메뉴로 이동</small><Icon name="chevron-right" /></button>
        <p class="settings-label">뱅킹 설정</p>
        <button @click="openDetailSettings"><strong>아이디조회/암호설정</strong><Icon name="chevron-right" /></button>
        <button @click="notifyUnavailable"><strong>인터넷뱅킹 이용제한해제</strong><Icon name="chevron-right" /></button>
        <button @click="notifyUnavailable"><strong>인터넷뱅킹 해지</strong><Icon name="chevron-right" /></button>
        <button @click="notifyUnavailable"><strong>간편회원/조회용ID 탈퇴</strong><Icon name="chevron-right" /></button>
      </div>
    </section>

    <section v-else-if="screen === 'settings-detail'" class="kb-page settings-page">
      <KbHeader title="환경설정" @back="openSettings" @home="goHome" />
      <div class="settings-list detail-list">
        <button @click="notifyUnavailable"><strong>계좌번호 복사 이체 설정</strong><small>복사 된 계좌번호를 이체 시 자동으로 불러오기</small><Icon name="chevron-right" /></button>
        <button @click="notifyUnavailable"><strong>생체 이체 설정</strong><small>간편비밀번호 대신 지문으로 편리하게 이체</small><Icon name="chevron-right" /></button>
        <p class="settings-label">회원가입</p>
        <button @click="notifyUnavailable"><strong>KB스타뱅킹 회원가입</strong><Icon name="chevron-right" /></button>
        <button @click="notifyUnavailable"><strong>KB스타틴즈 회원가입</strong><Icon name="chevron-right" /></button>
        <button @click="notifyUnavailable"><strong>우리 아이 KB스타뱅킹 시작하기</strong><Icon name="chevron-right" /></button>
        <p class="settings-label">앱 정보</p>
        <button @click="clearPracticeSettings"><strong>캐시/쿠키 삭제</strong><Icon name="chevron-right" /></button>
        <button @click="notifyUnavailable"><strong>앱 버전</strong><span class="blue-text">G6.5.12</span><Icon name="chevron-right" /></button>
        <button data-tutor-id="kb-large-text-link" @click="openEasySettings"><strong>큰글씨 뱅킹 설정</strong><Icon name="chevron-right" /></button>
      </div>
    </section>

    <section v-else-if="screen === 'easy-settings'" class="kb-page easy-page">
      <KbHeader title="간편모드/큰글씨 뱅킹 설정" @back="openSettings" @home="goHome" />
      <div class="easy-setting-block"><div><strong>간편모드</strong><p>홈화면에서 주요 거래들을 쉽게 이용할 수 있습니다.</p></div><button class="switch" data-tutor-id="kb-easy-mode-toggle" :class="{ 'is-on': easyMode }" aria-label="간편모드 전환" @click="toggleEasyMode"><span /></button></div>
      <div class="easy-divider" />
      <div class="easy-visual"><span class="mini-phone">KB국민은행<br /><b>{{ profileName }}님</b><br /><strong>계좌이체</strong></span></div>
      <div class="easy-setting-block"><div><strong>큰글씨 뱅킹</strong><p>계좌조회, 이체화면의 글자를 크게 볼 수 있습니다.</p></div><button class="switch" data-tutor-id="kb-large-text-toggle" :class="{ 'is-on': largeText }" aria-label="큰글씨 뱅킹 전환" @click="toggleLargeText"><span /></button></div>
      <div class="text-size-preview"><span>가</span><i>••••</i><strong>가</strong></div>
      <button class="wide-yellow" data-tutor-id="kb-easy-settings-save" @click="enableLargeText">큰글씨 뱅킹 켜고 홈으로</button>
    </section>

    <section v-else-if="screen === 'transfer-start' || screen === 'transfer-input'" class="kb-page transfer-page">
      <KbHeader title="이체" cancel @back="goBack" @home="goHome" />
      <div class="transfer-progress" aria-label="이체 진행 단계"><span class="active">1 받는 계좌</span><span>2 금액</span><span>3 확인</span></div>
      <div class="transfer-intro"><div>누구에게 보낼까요?</div><button @click="openBankPicker">계좌선택</button></div>
      <button v-if="screen === 'transfer-start'" class="account-input-line" data-tutor-id="kb-recipient-account" @click="screen = 'transfer-input'">{{ recipientAccount ? formatAccount(recipientAccount) : '계좌번호' }}<Icon v-if="recipientAccount" name="close" :size="18" @click.stop="clearRecipient" /></button>
      <div v-else class="account-input-line-wrap" data-tutor-id="kb-recipient-account">
        <input
          class="account-input-editable"
          :value="recipientAccount ? formatAccount(recipientAccount) : ''"
          inputmode="numeric"
          autocomplete="off"
          placeholder="계좌번호"
          aria-label="받는 분 계좌번호 입력"
          @input="handleAccountInput"
          @paste="handleAccountPaste"
        />
        <button v-if="recipientAccount" type="button" aria-label="계좌번호 지우기" @click="clearRecipient"><Icon name="close" :size="18" /></button>
      </div>
      <button class="bank-select-line" data-tutor-id="kb-bank-select" @click="openBankPicker"><strong>{{ selectedRecipientBank || '은행/증권사' }}</strong><Icon name="chevron-down" /></button>
      <p v-if="accountError" class="field-error"><Icon name="alert-triangle" :size="17" /> {{ accountError }}</p>
      <div v-if="screen === 'transfer-start'" class="recent-area">
        <div class="recent-heading"><strong>최근 보낸 분</strong><button @click="screen = 'transfer-input'">직접 입력</button></div>
        <button v-for="choice in recipientChoices" :key="choice.number" class="recent-recipient" @click="selectRecipientAndContinue(choice)"><span class="bank-logo" :style="{ background: choice.color }">{{ choice.mark }}</span><span><strong>{{ choice.name }}</strong><small>{{ choice.bank }} {{ formatAccount(choice.number) }}</small></span><Icon name="chevron-right" /></button>
      </div>
      <template v-else>
        <div class="practice-account-hint"><Icon name="info" :size="18" /><span>연습용 계좌번호 <strong>94320200582932</strong></span><button data-tutor-id="kb-sample-account-button" @click="useSampleAccount">자동 입력</button></div>
        <div class="transfer-shortcuts"><button @click="notifyUnavailable"><Icon name="camera" :size="18" /> 촬영이체</button><span>|</span><button @click="notifyUnavailable"><Icon name="users" :size="18" /> 연락처이체</button></div>
        <div class="number-keypad account-keypad" data-tutor-id="kb-numeric-keypad">
          <button v-for="key in numberKeys" :key="key" @click="appendAccount(key)">{{ key }}</button>
          <button class="backspace" aria-label="한 자리 지우기" @click="deleteAccount"><Icon name="backspace" :size="26" /></button>
        </div>
        <button class="bottom-confirm" data-tutor-id="kb-account-confirm" :disabled="recipientAccount.length !== 14 || !selectedRecipientBank" @click="confirmAccount">계좌 확인</button>
      </template>
    </section>

    <section v-else-if="screen === 'amount'" class="kb-page transfer-page amount-page">
      <KbHeader title="이체" cancel @back="goBack" @home="goHome" />
      <div class="transfer-progress"><span class="done">1 받는 계좌</span><span class="active">2 금액</span><span>3 확인</span></div>
      <button class="source-account-bar" @click="openAccountPicker"><span>출금계좌 | </span>{{ selectedSourceAccount.bank }} {{ formatAccount(selectedSourceAccount.number) }} <Icon name="chevron-down" /></button>
      <div class="recipient-summary"><span class="bank-logo">{{ bankMark(selectedRecipientBank) }}</span><span><strong>{{ recipientName }}</strong><small>{{ selectedRecipientBank }} {{ formatAccount(recipientAccount) }}</small></span><button @click="goBack">변경</button></div>
      <strong class="amount-value">{{ amount.toLocaleString('ko-KR') }}원</strong>
      <p class="korean-amount">{{ koreanAmount }}</p>
      <p class="available">출금가능금액 {{ availableBalance.toLocaleString('ko-KR') }}원</p>
      <div class="quick-amounts" data-tutor-id="kb-quick-amount"><button @click="addAmount(1000)">+1천</button><button @click="addAmount(10000)">+1만</button><button @click="addAmount(50000)">+5만</button><button @click="setMaximumAmount">전액</button><button class="reset-amount" @click="setAmount(0)">초기화</button></div>
      <div class="number-keypad amount-keypad" data-tutor-id="kb-amount-keypad"><button v-for="key in amountKeys" :key="key" @click="appendAmount(key)">{{ key }}</button><button class="backspace" aria-label="한 자리 지우기" @click="deleteAmount"><Icon name="backspace" :size="26" /></button></div>
      <div class="transfer-limit"><span>이체 수수료</span><strong>0원</strong><span>1회 이체한도</span><strong>1,000,000원</strong></div>
      <p v-if="amountError" class="field-error"><Icon name="alert-triangle" :size="17" /> {{ amountError }}</p>
      <button class="bottom-confirm" data-tutor-id="kb-amount-confirm" :disabled="amount <= 0 || amount > availableBalance" @click="openRecipient">받는 분 확인</button>
    </section>

    <section v-else-if="screen === 'recipient'" class="kb-page transfer-page recipient-page">
      <KbHeader title="이체" cancel @back="goBack" @home="goHome" />
      <div class="transfer-progress"><span class="done">1 받는 계좌</span><span class="done">2 금액</span><span class="active">3 확인</span></div>
      <button class="source-account-bar" @click="openAccountPicker"><span>출금계좌 | </span>{{ selectedSourceAccount.bank }} {{ formatAccount(selectedSourceAccount.number) }} <Icon name="chevron-down" /></button>
      <div class="recipient-card">
        <button class="recipient-account-row" @click="openRecipientPicker"><strong>{{ recipientName }}</strong><span>{{ selectedRecipientBank }} {{ formatAccount(recipientAccount) }}</span><b>변경</b></button>
        <button class="outline-pill multi-transfer" @click="notifyUnavailable">여러 건 이체</button>
        <strong class="recipient-amount">{{ amount.toLocaleString('ko-KR') }}원</strong>
        <small>출금가능금액 {{ availableBalance.toLocaleString('ko-KR') }}원</small>
      </div>
      <button class="select-line" @click="openDisplayEditor('recipient')"><span><label>받는 분 통장 표시</label><strong>{{ recipientDisplayName }}</strong></span><Icon name="chevron-down" /></button>
      <button class="select-line" @click="openDisplayEditor('sender')"><span><label>내 통장 표시</label><strong>{{ senderDisplayName }}</strong></span><Icon name="chevron-down" /></button>
      <button class="add-info" @click="openDisplayEditor('sender')"><Icon name="plus" :size="18" /> 추가정보 입력</button>
      <div class="safety-check"><Icon name="shield" :size="24" /><span><strong>마지막 안전 확인</strong><small>모르는 사람이 요청한 이체가 아닌지 확인하세요. 이 화면은 가상 연습입니다.</small></span></div>
      <button class="wide-yellow" data-tutor-id="kb-transfer-submit" @click="showConfirm = true">이체</button>

      <div v-if="showConfirm" class="modal-layer dim" @click.self="showConfirm = false">
        <div class="confirm-modal">
          <button class="modal-close" aria-label="닫기" @click="showConfirm = false"><Icon name="close" /></button>
          <div class="transfer-symbol"><span>KB</span><Icon name="transfer" :size="32" /><span>{{ bankMark(selectedRecipientBank) }}</span></div>
          <h2>{{ recipientDisplayName }}님께<br /><strong>{{ amount.toLocaleString('ko-KR') }}원</strong>을 이체합니다.</h2>
          <p>{{ selectedRecipientBank }} {{ formatAccount(recipientAccount) }}</p>
          <button class="modal-transfer" data-tutor-id="kb-transfer-modal-confirm" @click="completeTransfer">이체</button>
        </div>
      </div>
    </section>

    <section v-else-if="screen === 'done'" class="kb-page transfer-page done-page">
      <KbHeader title="이체" @back="goHome" @home="goHome" />
      <div class="done-visual"><Icon name="check-circle" :size="86" /></div>
      <h2>{{ recipientDisplayName }}님께<br />{{ amount.toLocaleString('ko-KR') }} 원<br /><span>이체가 완료되었습니다.</span></h2>
      <div class="done-account">{{ selectedRecipientBank }} {{ formatAccount(recipientAccount) }}</div>
      <div class="done-links"><button @click="notifyUnavailable"><Icon name="receipt" /> 메시지카드</button><button @click="shareReceipt"><Icon name="share" /> 공유하기</button></div>
      <button class="detail-link" @click="showDetail = !showDetail">이체 상세정보 <Icon name="chevron-down" /></button>
      <dl v-if="showDetail" class="transfer-detail"><div><dt>거래일시</dt><dd>{{ transactionTime }}</dd></div><div><dt>받는 분</dt><dd>{{ recipientDisplayName }}</dd></div><div><dt>출금계좌</dt><dd>{{ formatAccount(selectedSourceAccount.number) }}</dd></div><div><dt>수수료</dt><dd>0원</dd></div></dl>
      <div class="done-actions"><button @click="startTransfer">추가이체</button><button @click="openHistory">거래내역조회</button></div>
      <button class="wide-yellow" data-tutor-id="kb-done-confirm" @click="goHome">확인</button>
    </section>

    <section v-else-if="screen === 'history'" class="kb-page history-page">
      <KbHeader title="거래내역조회" @back="goHome" @home="goHome" />
      <div class="history-account">
        <p>직장인우대종합통장 <Icon name="pencil" :size="16" /></p>
        <button @click="openAccountPicker">{{ formatAccount(selectedSourceAccount.number) }} <Icon name="chevron-down" /></button>
        <b>{{ availableBalance.toLocaleString('ko-KR') }}<small>원</small></b>
        <small>출금가능금액 {{ availableBalance.toLocaleString('ko-KR') }}원</small>
        <div><button data-tutor-id="kb-history-transfer" @click="startTransfer">이체</button><button @click="notifyUnavailable">모으기</button><button @click="notifyUnavailable">ATM/창구출금</button></div>
      </div>
      <div class="history-filter"><Icon name="search" /><strong>3개월 · 전체 · 최신순</strong><span><Icon name="chevron-down" /><Icon name="menu" /></span></div>
      <div class="history-body"><div class="history-range">최근 3개월 <span>잔액표기 <button class="switch" :class="{ 'is-on': showHistoryBalance }" @click="showHistoryBalance = !showHistoryBalance"><span /></button></span></div><h3>{{ currentYearMonth }} <Icon name="chevron-down" /></h3>
        <article v-for="(transaction, index) in transactions" :key="`${transaction.date}-${index}`" class="transaction-item"><p>{{ transaction.date }} <i>|</i> 스마트출금</p><strong>{{ transaction.name }}</strong><b :class="{ negative: transaction.amount < 0 }">{{ transaction.amount.toLocaleString('ko-KR') }}원<small v-if="showHistoryBalance">{{ transaction.balance.toLocaleString('ko-KR') }}원</small></b></article>
      </div>
    </section>

    <div v-if="bankOverlay" class="modal-layer dim" @click.self="closeBankPicker">
      <section class="bank-sheet">
        <div class="sheet-header"><h2>은행/증권사</h2><button aria-label="닫기" @click="closeBankPicker"><Icon name="close" /></button></div>
        <div class="bank-tabs"><button class="active" @click="notifyUnavailable">은행</button><button @click="notifyUnavailable">증권사</button></div>
        <div class="bank-grid"><button v-for="bank in banks" :key="bank.name" @click="selectBank(bank)"><span class="bank-logo" :style="{ background: bank.color }">{{ bank.mark }}</span>{{ bank.name }}</button></div>
        <h3>국세/지방세</h3><div class="bank-grid tax-grid"><button v-for="tax in taxes" :key="tax" @click="notifyUnavailable"><span class="bank-logo tax"><Icon name="building" :size="19" /></span>{{ tax }}</button></div>
      </section>
    </div>

    <div v-if="accountOverlay" class="modal-layer dim" @click.self="accountOverlay = false">
      <section class="choice-sheet"><div class="sheet-header"><h2>출금계좌 선택</h2><button aria-label="닫기" @click="accountOverlay = false"><Icon name="close" /></button></div><button v-for="account in sourceAccounts" :key="account.number" class="choice-row" @click="selectSourceAccount(account)"><span class="bank-logo">KB</span><span><strong>{{ account.bank }}</strong><small>{{ formatAccount(account.number) }}</small></span><b>{{ account.balance.toLocaleString('ko-KR') }}원</b></button></section>
    </div>

    <div v-if="recipientOverlay" class="modal-layer dim" @click.self="recipientOverlay = false">
      <section class="choice-sheet"><div class="sheet-header"><h2>받는 분 계좌 선택</h2><button aria-label="닫기" @click="recipientOverlay = false"><Icon name="close" /></button></div><button v-for="choice in recipientChoices" :key="choice.number" class="choice-row" @click="selectRecipient(choice)"><span class="bank-logo" :style="{ background: choice.color }">{{ choice.mark }}</span><span><strong>{{ choice.name }}</strong><small>{{ choice.bank }} {{ formatAccount(choice.number) }}</small></span><Icon name="chevron-right" /></button></section>
    </div>

    <div v-if="displayEditor" class="modal-layer dim" @click.self="displayEditor = null">
      <section class="display-sheet">
        <div class="sheet-header"><h2>{{ displayEditor === 'recipient' ? '받는 분 통장 표시' : '내 통장 표시' }}</h2><button aria-label="닫기" @click="displayEditor = null"><Icon name="close" /></button></div>
        <p>{{ displayEditor === 'recipient' ? '받는 분 통장 표시 입력(10자)' : '내 통장 표시 입력(14자)' }}</p>
        <div class="display-input-wrap"><input v-if="displayEditor === 'recipient'" v-model="recipientDisplayName" maxlength="10" /><input v-else v-model="senderDisplayName" maxlength="14" /><button aria-label="입력 닫기" @click="displayEditor = null"><Icon name="close" :size="18" /></button></div>
        <p class="privacy-note"><Icon name="info" :size="17" /> 개인정보 입력에 유의해주세요.</p>
        <h3>자주 쓰는 통장 표시 선택 <button @click="notifyUnavailable">편집</button></h3>
        <div class="display-chips"><button v-for="choice in (displayEditor === 'recipient' ? recipientDisplayChoices : senderDisplayChoices)" :key="choice" @click="selectDisplay(choice)">{{ choice }}</button><button class="plus-chip" aria-label="통장 표시 추가" @click="notifyUnavailable"><Icon name="plus" /></button></div>
        <button class="wide-yellow" @click="displayEditor = null">확인</button>
      </section>
    </div>

    <div v-if="showSafetyConsent" class="modal-layer safety-consent-layer">
      <section class="safety-consent" role="dialog" aria-modal="true" aria-labelledby="safety-consent-title">
        <div class="safety-consent__icon"><Icon name="shield" :size="25" /></div>
        <h2 id="safety-consent-title">안전하게 연습하기</h2>
        <p>이용하기 전에 아래 내용을 확인해 주세요.</p>
        <div class="safety-consent__notice">
          <strong>안전 고지</strong>
          <span>이 연습은 실제 계좌·송금과 무관합니다.</span>
          <span>비밀번호와 OTP는 입력하지 않습니다.</span>
        </div>
        <label class="safety-consent__check">
          <input v-model="safetyConsentChecked" type="checkbox" />
          <span>위 내용을 확인했으며 이용에 동의합니다.</span>
        </label>
        <button class="wide-yellow" :disabled="!safetyConsentChecked" @click="acceptSafetyConsent">확인하고 시작하기</button>
      </section>
    </div>
    <div v-if="toastMessage" class="kb-toast" role="status">{{ toastMessage }}</div>
    <KbTutorAssistant :screen="screen" :error="tutorError" />
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import Icon from '@/components/common/icons/Icon.vue'
import KbHeader from '@/components/common/KbHeader.vue'
import KbTutorAssistant from '@/components/common/KbTutorAssistant.vue'

type KbScreen = 'home' | 'menu' | 'settings' | 'settings-detail' | 'easy-settings' | 'transfer-start' | 'transfer-input' | 'amount' | 'recipient' | 'done' | 'history'
type DisplayEditor = 'recipient' | 'sender' | null

type BankOption = { name: string; mark: string; color: string }
type AccountOption = { bank: string; number: string; balance: number; name?: string }
type RecipientOption = { name: string; bank: string; number: string; mark: string; color: string }
type Transaction = { date: string; name: string; amount: number; balance: number }

const screen = ref<KbScreen>('home')
const router = useRouter()
const session = useSessionStore()
const largeText = ref(localStorage.getItem('hangeoleum.kb.largeText') === 'true')
const easyMode = ref(localStorage.getItem('hangeoleum.kb.easyMode') !== 'false')
const darkMode = ref(localStorage.getItem('hangeoleum.kb.darkMode') === 'true')
const notificationEnabled = ref(localStorage.getItem('hangeoleum.kb.notification') === 'true')
const profileName = '김복자'
const balance = ref(32515123)
const primaryAccount: AccountOption = { bank: 'KB국민', number: '85560100126675', balance: 32515123, name: '보통예금' }
const selectedSourceAccount = ref<AccountOption>(primaryAccount)
const recipientName = ref('이춘자')
const recipientDisplayName = ref('이춘자')
const senderDisplayName = ref('김복자')
const selectedRecipientBank = ref('')
const recipientAccount = ref('')
const amount = ref(0)
const showConfirm = ref(false)
const bankOverlay = ref(false)
const accountOverlay = ref(false)
const recipientOverlay = ref(false)
const displayEditor = ref<DisplayEditor>(null)
const accountError = ref('')
const amountError = ref('')
const tutorError = ref('')
const toastMessage = ref('')
const currentTime = ref('')
const showSafetyConsent = ref(false)
const safetyConsentChecked = ref(false)
const showDetail = ref(false)
const transactionTime = ref('')
const showHistoryBalance = ref(true)
let toastTimer: number | undefined

const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
const amountKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0']
const sourceAccounts: AccountOption[] = [
  primaryAccount,
  { bank: 'KB국민', number: '12340101123456', balance: 1200000, name: '저축예금' },
]
const homeAccountIndex = ref(0)
const currentHomeAccount = computed(() => sourceAccounts[homeAccountIndex.value])
const currentHomeAccountBalance = computed(() => currentHomeAccount.value.number === primaryAccount.number ? balance.value : currentHomeAccount.value.balance)
const banks: BankOption[] = [
  { name: 'KB국민', mark: 'KB', color: '#66594b' }, { name: '기업', mark: 'IBK', color: '#214a9a' },
  { name: '농협', mark: 'NH', color: '#31b866' }, { name: '산업', mark: 'K', color: '#e9eef6' },
  { name: '수협', mark: 'S', color: '#f2f6f8' }, { name: '신한', mark: 'S', color: '#1a56dc' },
  { name: '우리', mark: 'W', color: '#1679bd' }, { name: '우체국', mark: 'P', color: '#ed1c24' },
  { name: '하나', mark: 'H', color: '#06a89c' }, { name: '한국씨티', mark: 'citi', color: '#2f6dad' },
  { name: 'SC제일', mark: 'S', color: '#eaf2f1' }, { name: '카카오뱅크', mark: 'B', color: '#ffd400' },
  { name: '케이뱅크', mark: 'K', color: '#102aa3' }, { name: '토스뱅크', mark: 'T', color: '#e9f1fb' },
  { name: '경남', mark: 'BNK', color: '#e51b2e' }, { name: '광주', mark: 'K', color: '#1b347f' },
  { name: '아이엠뱅크(구 대구)', mark: 'iM', color: '#edf7f2' }, { name: '부산', mark: 'BNK', color: '#e51b2e' },
  { name: '전북', mark: 'JB', color: '#1b347f' }, { name: '제주', mark: 'J', color: '#1f5bc9' },
  { name: '저축', mark: 'SB', color: '#43a463' }, { name: '산림조합', mark: 'S', color: '#153a69' },
  { name: '새마을', mark: 'M', color: '#67bce1' }, { name: '신협', mark: 'CU', color: '#1673b8' },
  { name: '도이치', mark: 'D', color: '#173eb0' }, { name: '뱅크오브아메리카', mark: 'B', color: '#f4f5f7' },
  { name: '중국건설', mark: 'C', color: '#1876bd' }, { name: '중국공상', mark: 'IC', color: '#bd1538' },
  { name: '중국', mark: 'C', color: '#b00b42' }, { name: 'HSBC', mark: 'H', color: '#e20f2a' },
  { name: 'BNP파리바', mark: 'BNP', color: '#00a05b' }, { name: 'JP모간체이스', mark: 'JPM', color: '#287ac1' },
]
const taxes = ['국세', '국고금', '관세', '지방세입']
const recipientChoices: RecipientOption[] = [
  { name: '이춘자', bank: 'KB국민', number: '94320200582932', mark: 'KB', color: '#66594b' },
  { name: '김복자', bank: '신한', number: '110123456789', mark: 'S', color: '#1a56dc' },
  { name: '홍길동', bank: '카카오뱅크', number: '3333123456789', mark: 'B', color: '#ffd400' },
]
const recipientDisplayChoices = ['이춘자', '급여', '월세', '용돈', '회비']
const senderDisplayChoices = ['김복자', '식비', '통신비', '교육비', '용돈', '월세', '저축']
const transactions = ref<Transaction[]>([
  { date: '08.03 19:41:03', name: '이춘자', amount: -5, balance: 33639 },
  { date: '07.28 19:38:01', name: '이춘자', amount: -50, balance: 33644 },
  { date: '07.15 19:30:43', name: '이춘자', amount: -1000, balance: 33694 },
])

const availableBalance = computed(() => selectedSourceAccount.value.number === primaryAccount.number ? balance.value : selectedSourceAccount.value.balance)

const koreanAmount = computed(() => amountToKorean(amount.value))
const currentYearMonth = computed(() => new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit' }).format(new Date()))

onMounted(() => {
  session.restoreFromLocalStorage()
  // 이 은행 데모 화면은 홈 화면의 인트로 모션을 거치지 않고 바로 들어올 수 있어(예: 은행 선택 후 KB 선택),
  // 안전 고지에 아직 동의하지 않은 사용자에게는 여기서도 한 번 더 보여줍니다.
  if (localStorage.getItem('hangeoleum.safetyConsent') !== 'true') {
    showSafetyConsent.value = true
  }
})

onBeforeUnmount(() => {
  if (toastTimer) window.clearTimeout(toastTimer)
})

function formatAccount(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 14) return `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`
  if (digits.length === 13) return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  return value
}

function goHome() { showConfirm.value = false; closeOverlays(); router.push('/') }
function goBack() {
  if (screen.value === 'transfer-input') screen.value = 'transfer-start'
  else if (screen.value === 'amount') screen.value = 'transfer-input'
  else if (screen.value === 'recipient') screen.value = 'amount'
  else if (screen.value === 'history') screen.value = 'home'
  else goHome()
}
function openMenu() { screen.value = 'menu' }
function openSettings() { screen.value = 'settings' }
function openDetailSettings() { screen.value = 'settings-detail' }
function openEasySettings() { screen.value = 'easy-settings' }
function openHistory() { screen.value = 'history'; closeOverlays() }
function toggleEasyMode() { easyMode.value = !easyMode.value; localStorage.setItem('hangeoleum.kb.easyMode', String(easyMode.value)); notify(`간편모드를 ${easyMode.value ? '켰어요' : '껐어요'}.`) }
function toggleNotification() { notificationEnabled.value = !notificationEnabled.value; localStorage.setItem('hangeoleum.kb.notification', String(notificationEnabled.value)); notify(`알림을 ${notificationEnabled.value ? '켰어요' : '껐어요'}.`) }
function toggleDarkMode() { darkMode.value = !darkMode.value; localStorage.setItem('hangeoleum.kb.darkMode', String(darkMode.value)); notify(`다크모드를 ${darkMode.value ? '켰어요' : '껐어요'}.`) }
function toggleLargeText() { largeText.value = !largeText.value; localStorage.setItem('hangeoleum.kb.largeText', String(largeText.value)); session.updateSettings({ textSize: largeText.value ? 'XLARGE' : 'BASIC' }) }
function enableLargeText() { localStorage.setItem('hangeoleum.kb.largeText', String(largeText.value)); session.updateSettings({ textSize: largeText.value ? 'XLARGE' : 'BASIC' }); screen.value = 'home'; notify('보기 설정을 저장했어요.') }

function startTransfer() {
  startTransferFrom(selectedSourceAccount.value)
}

function startTransferFrom(account: AccountOption) {
  selectedSourceAccount.value = account
  recipientAccount.value = ''
  selectedRecipientBank.value = ''
  recipientName.value = '이춘자'
  recipientDisplayName.value = '이춘자'
  amount.value = 0
  accountError.value = ''
  amountError.value = ''
  showConfirm.value = false
  screen.value = 'transfer-start'
  closeOverlays()
}
function showPreviousAccount() {
  if (homeAccountIndex.value > 0) homeAccountIndex.value -= 1
}
function showNextAccount() {
  if (homeAccountIndex.value < sourceAccounts.length - 1) homeAccountIndex.value += 1
}
function acceptSafetyConsent() {
  if (!safetyConsentChecked.value) return
  localStorage.setItem('hangeoleum.safetyConsent', 'true')
  showSafetyConsent.value = false
}
function appendAccount(key: string) { if (recipientAccount.value.length < 14) recipientAccount.value += key; accountError.value = ''; tutorError.value = '' }
function setAccountInput(value: string) {
  recipientAccount.value = value.replace(/\D/g, '').slice(0, 14)
  accountError.value = ''
  tutorError.value = ''
  if (recipientAccount.value === '94320200582932') selectedRecipientBank.value = 'KB국민'
}
function handleAccountInput(event: Event) { setAccountInput((event.target as HTMLInputElement).value) }
function handleAccountPaste(event: ClipboardEvent) {
  event.preventDefault()
  setAccountInput(event.clipboardData?.getData('text') || '')
}
function deleteAccount() { recipientAccount.value = recipientAccount.value.slice(0, -1); accountError.value = '' }
function clearRecipient() { recipientAccount.value = ''; accountError.value = '' }
function useSampleAccount() { recipientAccount.value = '94320200582932'; selectedRecipientBank.value = 'KB국민'; recipientName.value = '이춘자'; recipientDisplayName.value = '이춘자'; screen.value = 'transfer-input'; accountError.value = ''; notify('연습용 계좌번호를 입력했어요.') }
function confirmAccount() {
  if (recipientAccount.value.length !== 14) { accountError.value = '계좌번호 14자리를 모두 입력해 주세요.'; tutorError.value = accountError.value; return }
  if (!selectedRecipientBank.value) { accountError.value = '은행을 먼저 선택해 주세요.'; tutorError.value = accountError.value; return }
  const matched = recipientChoices.find((choice) => choice.number === recipientAccount.value && choice.bank === selectedRecipientBank.value)
  if (!matched) { accountError.value = '등록되지 않은 연습용 계좌예요. 94320200582932를 입력해 주세요.'; tutorError.value = accountError.value; return }
  recipientName.value = matched.name
  recipientDisplayName.value = matched.name
  accountError.value = ''
  screen.value = 'amount'
}
function setAmount(value: number) { amount.value = Math.min(value, availableBalance.value); amountError.value = '' }
function addAmount(value: number) { setAmount(amount.value + value) }
function setMaximumAmount() { setAmount(availableBalance.value) }
function appendAmount(key: string) {
  const next = `${amount.value || ''}${key}`
  const parsed = Number(next)
  if (Number.isFinite(parsed) && parsed <= availableBalance.value && parsed <= 1000000) { amount.value = parsed; amountError.value = '' }
  else { amountError.value = `출금 가능 금액 ${availableBalance.value.toLocaleString('ko-KR')}원 안에서 입력해 주세요.`; tutorError.value = amountError.value }
}
function deleteAmount() { amount.value = Math.floor(amount.value / 10) }
function openRecipient() { if (amount.value > 0 && amount.value <= availableBalance.value) screen.value = 'recipient' }

function openBankPicker() { bankOverlay.value = true }
function closeBankPicker() { bankOverlay.value = false }
function selectBank(bank: BankOption) { selectedRecipientBank.value = bank.name; bankOverlay.value = false }
function openAccountPicker() { accountOverlay.value = true }
function selectSourceAccount(account: AccountOption) { selectedSourceAccount.value = account; accountOverlay.value = false }
function openRecipientPicker() { recipientOverlay.value = true }
function selectRecipient(choice: RecipientOption) {
  recipientName.value = choice.name
  recipientDisplayName.value = choice.name
  selectedRecipientBank.value = choice.bank
  recipientAccount.value = choice.number
  recipientOverlay.value = false
}
function selectRecipientAndContinue(choice: RecipientOption) { selectRecipient(choice); screen.value = 'amount' }
function openDisplayEditor(kind: Exclude<DisplayEditor, null>) { displayEditor.value = kind }
function selectDisplay(value: string) {
  if (displayEditor.value === 'recipient') recipientDisplayName.value = value
  if (displayEditor.value === 'sender') senderDisplayName.value = value
  displayEditor.value = null
}
function closeOverlays() { bankOverlay.value = false; accountOverlay.value = false; recipientOverlay.value = false; displayEditor.value = null }
function completeTransfer() {
  const sentAmount = amount.value
  if (selectedSourceAccount.value.number === primaryAccount.number) balance.value = Math.max(0, balance.value - sentAmount)
  else selectedSourceAccount.value.balance = Math.max(0, selectedSourceAccount.value.balance - sentAmount)
  transactionTime.value = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date())
  transactions.value.unshift({ date: transactionTime.value, name: recipientDisplayName.value, amount: -sentAmount, balance: availableBalance.value })
  showConfirm.value = false
  screen.value = 'done'
}

function bankMark(bankName: string) { return banks.find((bank) => bank.name === bankName)?.mark || 'KB' }
function amountToKorean(value: number) {
  if (!value) return '0원'
  const units = [{ value: 100000000, label: '억' }, { value: 10000, label: '만' }]
  let rest = value
  let result = ''
  for (const unit of units) { if (rest >= unit.value) { result += `${Math.floor(rest / unit.value).toLocaleString('ko-KR')}${unit.label} `; rest %= unit.value } }
  if (rest) result += rest.toLocaleString('ko-KR')
  return `${result.trim()}원`
}
function notify(message: string) { toastMessage.value = message; if (toastTimer) window.clearTimeout(toastTimer); toastTimer = window.setTimeout(() => { toastMessage.value = '' }, 2600) }
function notifyUnavailable() { notify('해당 실습에는 사용되지 않는 버튼이에요.') }
async function copyAccount(value: string) { try { await navigator.clipboard.writeText(value); notify('계좌번호를 복사했어요.') } catch { notify(`계좌번호는 ${formatAccount(value)}예요.`) } }
async function shareReceipt() { const text = `${recipientDisplayName.value}님께 ${amount.value.toLocaleString('ko-KR')}원 이체 연습 완료`; try { if (navigator.share) await navigator.share({ title: '이체 연습 결과', text }); else await navigator.clipboard.writeText(text); notify('이체 연습 결과를 공유했어요.') } catch { notify('공유를 취소했어요.') } }
function clearPracticeSettings() {
  localStorage.removeItem('hangeoleum.kb.easyMode')
  localStorage.removeItem('hangeoleum.kb.largeText')
  localStorage.removeItem('hangeoleum.kb.darkMode')
  localStorage.removeItem('hangeoleum.kb.notification')
  easyMode.value = true
  largeText.value = false
  darkMode.value = false
  notificationEnabled.value = false
  session.updateSettings({ textSize: 'BASIC' })
  notify('연습 화면 설정을 초기화했어요.')
}
</script>

<style scoped>
.kb-app { --kb-yellow:#ffd338; --kb-blue-bg:#eef5fb; --kb-text:#24262b; min-height:100vh; background:var(--kb-blue-bg); color:var(--kb-text); font-family:'Pretendard','Malgun Gothic',sans-serif; font-size:16px; }
.kb-app.large-mode { font-size:20px; }
.status-bar { display:none; }
.status-bar strong { font-size:18px; }.status-bar__icons { letter-spacing:2px; }
.kb-page { min-height:calc(100vh - 42px); position:relative; overflow:hidden; } button { border:0; font:inherit; color:inherit; background:transparent; cursor:pointer; }
.home-topbar { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 12px; }.simple-home { display:flex; align-items:center; gap:8px; font-size:1.05em; }
.switch { width:50px; height:28px; padding:3px; border-radius:20px; background:#aaa; vertical-align:middle; }.switch span,.switch i { display:block; width:22px; height:22px; border-radius:50%; background:#fff; box-shadow:0 1px 3px #5555; transition:.2s; }.switch.is-on { background:#ffc400; }.switch.is-on span,.switch.is-on i { margin-left:22px; }
.home-links { display:flex; gap:14px; font-weight:700; }.home-links button { position:relative; display:flex; flex-direction:column; align-items:center; gap:2px; font-size:.8em; }.home-links i { position:absolute; width:6px; height:6px; top:-3px; right:2px; border-radius:50%; background:#ee4c54; }
.profile-row { display:flex; align-items:center; width:100%; padding:12px 24px; text-align:left; font-size:1.15em; gap:8px; }.profile-avatar { width:27px; height:27px; display:grid; place-items:center; background:#ffd64b; border-radius:8px; color:#eea400; }.chevron { color:#737b85; font-size:1.5em; }.family-pill { margin-left:auto; padding:7px 13px; border:2px solid #b8c3cd; border-radius:18px; font-size:.85em; background:#fff; }
.account-card { margin:8px 22px 0; border-radius:18px; padding:20px 22px 22px; background:#fff; box-shadow:0 3px 12px #98a8b233; }.account-card__title { display:flex; gap:8px; align-items:center; font-weight:700; font-size:1.02em; }.account-card__title>button { display:grid;place-items:center;margin-left:auto;color:#89919b }.kb-mark,.kb-mini { display:inline-grid; place-items:center; background:#5c5144; color:#ffd12e; border-radius:50%; font-size:.72em; width:28px; height:28px; }.kb-mini { width:26px; height:21px; border-radius:5px; background:#ffd028; color:#6a5400; font-size:.65em; }.account-number { display:flex;align-items:center;gap:8px;padding:8px 0 46px; font-size:1.04em; }.account-number button {display:grid;place-items:center;color:#7b858e}.account-balance { font-size:2em; font-weight:800; }.account-balance span { font-size:.55em; font-weight:500; margin-left:3px; }.account-balance em { font-size:.45em; font-style:normal; color:#888; border:1px solid #d5d8dc; border-radius:18px; padding:5px 9px; vertical-align:middle; margin-left:4px; font-weight:500; }.account-actions { display:flex; gap:16px; margin-top:18px; }.account-actions button { flex:1; min-height:54px; border-radius:5px; font-size:1.05em; }.primary-yellow,.wide-yellow { background:var(--kb-yellow); font-weight:800; }.disabled-action { background:#eef1f4; color:#525862; }
.representative-row { width:100%; display:flex; justify-content:space-between; padding:24px 44px 15px; color:#4c5158; font-size:1.1em; }.representative-row span,.ars-card>strong,.ars-card button,.notice-line{display:flex;align-items:center;gap:7px}.home-service-card { margin:0 22px; padding:5px 20px; border-radius:18px; background:#fff; box-shadow:0 3px 12px #98a8b21f; }.home-service-card button { display:flex; align-items:center; gap:14px; width:100%; min-height:74px; text-align:left; border-bottom:1px solid #e8eaed; }.home-service-card button:last-child { border-bottom:0; }.home-service-card button>.app-icon:last-child { margin-left:auto;color:#8b949d }.home-service-card small { display:block; color:#555d65; font-weight:400; margin-top:4px; }.service-icon { width:40px; height:40px; border-radius:10px; display:grid; place-items:center; font-size:1.4em; flex:none; }.service-icon.green{background:#a7db78}.service-icon.yellow{background:#ffe071}.service-icon.purple{background:#c2a3f0}.service-icon.teal{background:#79d5cb}.service-icon.gray{background:#bbbfc2}.ars-card { margin:20px 22px 0; padding:16px 20px; background:#fff; border-radius:18px; font-size:1.02em; }.ars-card>strong { margin-bottom:14px; }.ars-card div { display:flex; gap:8px; }.ars-card button { flex:1; justify-content:center;min-height:44px; border:1px solid #d9dde1; border-radius:10px; }.notice-line { margin:22px 24px 12px; white-space:nowrap; overflow:hidden; font-size:.9em; }.kb-paybar { display:flex; justify-content:space-around; padding:18px; background:#60656e; color:#fff; font-weight:700; }.kb-paybar span { flex:1; text-align:center; border-right:1px solid #9da1a6; }.kb-paybar span:last-child { border:0; }.bottom-nav { display:flex; background:#fff; border-top:1px solid #e0e2e5; padding:12px 5px 8px; position:sticky; bottom:0; z-index:3; }.bottom-nav button { display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;color:#4d545d; }.bottom-nav button.active { color:#e3b500; }.bottom-nav small { display:block; font-size:.72em; }
.easy-mode .home-service-card button:nth-child(n+3),.easy-mode .notice-line{display:none}.easy-mode .account-actions button{min-height:64px;font-size:1.18em}
.menu-page,.settings-page,.easy-page { background:#fff; }.menu-head { display:flex; justify-content:space-between; padding:24px 25px; font-size:1.05em; }.menu-head div { display:flex; gap:22px; font-size:1.6em; }.menu-shortcuts { display:flex; gap:4px; margin:8px 22px 42px; padding:16px 10px; background:#f6f7f8; border-radius:20px; }.menu-shortcuts button { flex:1; font-weight:700; font-size:.95em; }.menu-section { padding:0 24px 26px; border-bottom:12px solid #f4f5f6; }.section-heading { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; font-size:1.1em; }.section-heading button { color:#858b92; }.chip-row { display:flex; gap:10px; }.chip-row button,.outline-pill { padding:10px 18px; border:1px solid #d7dce1; border-radius:24px; background:#fff; }.product-section h2,.inquiry-section h2 { font-size:1.1em; margin:0 0 16px; }.product-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }.product-grid button { min-height:60px; border-radius:11px; background:#f6f7f8; }.inquiry-section>button { display:block; width:100%; padding:13px 0; text-align:left; font-size:1.08em; }.inquiry-section small { display:block; color:#899097; margin-top:5px; }.round-icon { color:#1db19f; font-size:1.4em; }.menu-transfer { width:100%; padding:20px 25px; text-align:left; font-weight:700; font-size:1.1em; }
.kb-header { display:flex; align-items:center; min-height:68px; padding:0 22px; border-bottom:1px solid #e7eaec; background:#fff; }.kb-header h1 { flex:1; margin:0 14px; font-size:1.18em; font-weight:500; }.header-back { font-size:2.2em; line-height:1; }.header-cancel { color:#707780; font-size:1.05em; }.header-tools { display:flex; gap:15px; font-size:1.5em; }.settings-list { padding-bottom:40px; }.settings-label { margin:0; padding:28px 26px 20px; color:#454b52; border-bottom:1px solid #e2e5e7; }.settings-list>button { display:flex; align-items:center; gap:10px; min-height:74px; width:100%; padding:15px 26px; border-bottom:1px solid #e4e7e9; text-align:left; }.settings-list strong { font-size:1.08em; }.settings-list span { margin-left:auto; color:#949ba3; }.settings-list .blue-text { color:#3e91ec; }.settings-list small { display:block; flex:1; color:#777e85; margin-top:7px; }.settings-list b { margin-left:auto; color:#9aa1a8; font-size:1.5em; font-weight:400; }.detail-list { padding-top:8px; }
.easy-page { min-height:100vh; }.easy-setting-block { display:flex; align-items:flex-start; justify-content:space-between; padding:42px 26px 32px; }.easy-setting-block strong { font-size:1.45em; }.easy-setting-block p { margin:11px 0 0; font-size:1.08em; line-height:1.45; }.easy-divider { height:1px; background:#e9ebed; margin:0 24px; }.easy-visual { display:grid; place-items:center; height:245px; background:linear-gradient(#fff,#fafafa); }.mini-phone { display:block; width:150px; height:210px; padding:20px 12px; border:5px solid #e7ebf0; border-radius:25px; text-align:center; line-height:1.8; box-shadow:0 3px 10px #5552; }.mini-phone strong { display:block; background:#ffd23e; padding:5px; border-radius:4px; }.text-size-preview { display:flex; align-items:center; justify-content:center; gap:18px; padding:24px; }.text-size-preview span { color:#9ea4aa; font-size:1.5em; }.text-size-preview i { color:#b8bdc2; letter-spacing:4px; }.text-size-preview strong { display:grid; place-items:center; width:50px; height:50px; border-radius:50%; background:#5b5147; color:#ffd12e; font-size:1.8em; }
.wide-yellow { width:100%; min-height:64px; padding:12px 24px; font-size:1.08em; }.transfer-page { background:#fff; }.transfer-intro { display:flex; justify-content:space-between; align-items:center; padding:42px 30px 22px; font-size:1.5em; }.transfer-intro button { color:#747b82; text-decoration:underline; font-size:.65em; }.account-input-line,.bank-select-line { display:flex; align-items:center; justify-content:space-between; width:calc(100% - 56px); margin:0 28px; padding:22px 5px; border-bottom:3px solid #b6a479; text-align:left; font-size:1.45em; color:#92969a; font-weight:700; }.bank-select-line { color:#25282c; }.recent-empty { min-height:360px; padding:90px 25px; text-align:center; }.recent-empty button { padding:12px 22px; border:1px solid #bcc2c8; border-radius:24px; }.recent-empty p { margin-top:110px; color:#5e6368; }.transfer-shortcuts { display:flex; justify-content:flex-end; gap:12px; padding:18px 34px; color:#505860; }.transfer-shortcuts span { color:#d5d8db; }.number-keypad { display:grid; grid-template-columns:repeat(3,1fr); gap:0; padding:25px 28px 0; }.number-keypad button { min-height:75px; font-size:1.7em; }.number-keypad .backspace { grid-column:3; }.bottom-confirm { width:100%; min-height:70px; margin-top:10px; background:var(--kb-yellow); font-weight:800; font-size:1.15em; }.bottom-confirm:disabled { background:#dfe3e6; color:#a7adb2; }
.source-account-bar { display:flex; align-items:center; width:100%; padding:22px 28px; background:#f5f6f7; text-align:left; font-size:1.08em; }.source-account-bar span { color:#5b626b; }.source-account-bar b { margin-left:auto; font-size:1.5em; color:#777f87; }.amount-page { text-align:center; }.amount-recipient { margin:34px 28px 70px; text-align:left; font-size:1.15em; color:#555d65; }.amount-value { display:block; font-size:2.7em; }.available { margin:10px 0 30px; color:#555d63; }.quick-amounts { display:flex; gap:6px; padding:0 26px; }.quick-amounts button { flex:1; min-height:46px; border:1px solid #d8dde1; font-size:.9em; }.amount-keypad { padding-top:16px; }.amount-keypad button { min-height:65px; }.amount-keypad .backspace { grid-column:3; }
.recipient-card { padding:26px 28px 32px; position:relative; text-align:center; }.recipient-account-row { display:grid; grid-template-columns:1fr auto; width:100%; text-align:left; }.recipient-account-row strong { font-size:1.45em; }.recipient-account-row span { grid-column:1; margin-top:5px; color:#59616a; font-size:1.05em; }.recipient-account-row b { grid-column:2; grid-row:1 / span 2; align-self:center; color:#616971; text-decoration:underline; font-weight:400; }.multi-transfer { position:absolute; top:24px; right:25px; transform:translateY(-2px); }.recipient-amount { display:block; margin-top:95px; font-size:2.7em; }.recipient-card small { display:block; margin-top:12px; color:#5d646b; }.recipient-page .select-line { display:flex; align-items:center; justify-content:space-between; width:calc(100% - 56px); margin:0 28px; padding:20px 4px; border-bottom:3px solid #b6a479; text-align:left; }.select-line span { display:flex; flex-direction:column; gap:8px; }.select-line label { font-size:.95em; color:#4b525a; }.select-line strong { font-size:1.25em; }.select-line>b { font-size:1.5em; color:#81888f; }.add-info { display:block; margin:25px 30px 18px auto; color:#555d65; font-size:1.1em; }.recipient-page>.wide-yellow { margin-top:8px; }
.modal-layer { position:fixed; inset:0; z-index:30; display:grid; align-items:end; background:#0006; }.dim { background:#0006; }.bank-sheet,.choice-sheet,.display-sheet { width:min(100%,520px); max-height:92vh; overflow:auto; border-radius:26px 26px 0 0; background:#fff; }.sheet-header { display:flex; align-items:center; justify-content:space-between; padding:30px 26px 22px; }.sheet-header h2 { margin:0; font-size:1.55em; }.sheet-header button { font-size:2.4em; line-height:.7; color:#8b949d; }.bank-tabs { display:flex; gap:38px; padding:0 28px; border-bottom:1px solid #e2e4e7; }.bank-tabs button { padding:14px 0 12px; color:#7c838b; font-size:1.1em; }.bank-tabs .active { color:#24262b; border-bottom:4px solid #24262b; font-weight:800; }.bank-grid { display:grid; grid-template-columns:1fr 1fr; gap:0 12px; padding:20px 30px; }.bank-grid button { display:flex; align-items:center; gap:12px; min-height:58px; text-align:left; font-size:1.08em; font-weight:600; }.bank-logo { display:inline-grid; place-items:center; flex:none; width:36px; height:36px; border-radius:50%; background:#66594b; color:#fff; font-size:.68em; font-weight:800; }.bank-grid h3 { margin:0 30px; }.tax-grid { padding-top:4px; padding-bottom:28px; }.bank-logo.tax { background:#eef1f2; color:#2f74b7; }.choice-row { display:flex; align-items:center; gap:14px; width:calc(100% - 52px); margin:0 26px; padding:19px 0; border-bottom:1px solid #e4e7e9; text-align:left; }.choice-row>span:nth-child(2) { display:flex; flex:1; flex-direction:column; gap:5px; }.choice-row small { color:#68717a; }.choice-row>b { color:#727b84; font-weight:400; }.display-sheet { padding-bottom:0; }.display-sheet>p,.display-sheet>h3 { margin:0 28px 13px; color:#6d757d; }.display-sheet>h3 { margin-top:34px; color:#24262b; font-size:1.15em; }.display-sheet>h3 button { float:right; font-weight:400; text-decoration:underline; color:#555d65; }.display-input-wrap { display:flex; align-items:center; margin:0 28px; padding:10px 0; border-bottom:3px solid #b6a479; }.display-input-wrap input { flex:1; border:0; outline:0; font:inherit; font-weight:700; background:transparent; }.display-input-wrap button { color:#7e8790; font-size:1.35em; }.privacy-note { color:#767e86 !important; margin-top:13px !important; }.display-chips { display:flex; flex-wrap:wrap; gap:10px; padding:0 28px 30px; }.display-chips button { min-width:96px; padding:11px 20px; border:1px solid #d3d8dc; border-radius:23px; }.display-chips .plus-chip { min-width:48px; padding:0; font-size:1.5em; }.display-sheet>.wide-yellow { position:sticky; bottom:0; }
.confirm-modal { width:min(100%,520px); padding:54px 25px 25px; border-radius:25px 25px 0 0; background:#fff; text-align:center; position:relative; }.modal-close { position:absolute; right:22px; top:14px; font-size:2.3em; color:#8b939b; }.transfer-symbol { display:flex; justify-content:center; align-items:center; gap:26px; margin-bottom:22px; }.transfer-symbol span { display:grid; place-items:center; width:42px; height:42px; border-radius:50%; background:#5b5147; color:#ffd12e; font-size:.7em; }.transfer-symbol b { color:#b8bdc2; }.confirm-modal h2 { font-size:1.55em; line-height:1.45; }.confirm-modal h2 strong { font-size:1.35em; }.confirm-modal p { color:#656d76; }.modal-transfer { width:100%; min-height:65px; background:var(--kb-yellow); font-size:1.15em; font-weight:800; margin-top:20px; }
.done-page { text-align:center; padding-bottom:30px; }.done-visual { display:flex; align-items:center; justify-content:center; gap:12px; padding-top:55px; }.done-visual span { color:#77b54a; font-size:4em; }.done-visual b { display:grid; place-items:center; width:65px; height:65px; border-radius:50%; background:#ffc400; color:#fff; font-size:2.2em; }.done-page h2 { font-size:1.7em; line-height:1.35; margin:35px 0 28px; }.done-page h2 span { font-weight:400; }.done-account { width:max-content; max-width:90%; margin:0 auto; border:1px solid #d8dde1; border-radius:24px; padding:11px 22px; color:#606973; }.done-links { display:flex; justify-content:center; gap:22px; margin:35px 0 30px; }.done-links button { font-size:1.1em; }.detail-link { border-top:1px solid #e6e8ea; padding:24px; text-align:right; color:#858d95; }.done-actions { display:flex; gap:10px; padding:0 28px 40px; }.done-actions button { flex:1; min-height:54px; border:1px solid #9da5ad; }
.history-page { background:#fff; }.history-account { padding:24px 28px 26px; }.history-account p { margin:0 0 9px; color:#59616a; font-size:1.05em; }.history-account>button { display:block; font-size:1.5em; font-weight:700; }.history-account>button span { color:#6e7780; }.history-account>b { display:block; margin:76px 0 0; text-align:right; font-size:2.8em; }.history-account>b small { font-size:.45em; font-weight:400; }.history-account>small { display:block; text-align:right; color:#68717b; }.history-account>div { display:flex; gap:12px; margin-top:36px; }.history-account>div button { flex:1; min-height:56px; background:#e9edf0; font-size:1.05em; }.history-filter { display:flex; align-items:center; justify-content:space-between; padding:19px 28px; background:#f6f7f8; border-top:1px solid #dfe3e6; border-bottom:1px solid #dfe3e6; }.history-filter>span:first-child { font-size:2em; color:#646d76; }.history-filter strong { font-size:1.02em; }.history-body { padding:25px 28px; }.history-range { padding:0 0 22px; border-bottom:3px solid #747c84; }.history-range>span { float:right; display:flex; align-items:center; gap:6px; }.history-range .switch { transform:scale(.8); }.history-body h3 { margin:24px 0 14px; padding-bottom:22px; border-bottom:1px solid #e4e7e9; }.history-body h3 span { float:right; }.transaction-item { position:relative; min-height:116px; padding:18px 0; border-bottom:1px solid #e4e7e9; }.transaction-item p { margin:0 0 16px; color:#737c85; }.transaction-item p i { margin:0 10px; color:#c1c5c9; }.transaction-item>strong { font-size:1.2em; }.transaction-item>b { position:absolute; right:0; top:82px; font-size:1.2em; }.transaction-item>b.negative { color:#25282c; }.transaction-item>b small { display:block; margin-top:6px; color:#777f87; font-size:.75em; font-weight:400; }
.transfer-progress{display:flex;padding:12px 22px;background:#f5f6f8}.transfer-progress span{position:relative;flex:1;color:#8a9199;text-align:center;font-size:.78em}.transfer-progress span+span:before{content:'';position:absolute;left:-12px;top:50%;width:24px;height:1px;background:#ccd1d6}.transfer-progress .active{color:#5a4e3e;font-weight:800}.transfer-progress .done{color:#25785c}.recent-area{padding:18px 26px 90px}.recent-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.recent-heading button{color:#536a96;text-decoration:underline}.recent-recipient{display:flex;align-items:center;gap:13px;width:100%;padding:16px 0;border-bottom:1px solid #e3e6e9;text-align:left}.recent-recipient>span:nth-child(2),.recipient-summary>span:nth-child(2){display:flex;flex:1;flex-direction:column;gap:5px}.recent-recipient small,.recipient-summary small{color:#69717a}.practice-account-hint{display:flex;align-items:center;gap:8px;margin:18px 26px 0;padding:12px 14px;border:1px solid #f0d16f;border-radius:12px;background:#fff8dc;font-size:.86em}.practice-account-hint span{flex:1}.practice-account-hint button{color:#22468c;font-weight:800;text-decoration:underline}.transfer-shortcuts button{display:flex;align-items:center;gap:5px}.field-error{display:flex;align-items:center;gap:6px;margin:10px 28px;color:#c83a36;font-size:.9em}.recipient-summary{display:flex;align-items:center;gap:12px;margin:24px 28px 42px;padding:14px;border:1px solid #e0e4e8;border-radius:14px;text-align:left}.recipient-summary button{color:#596f9c;text-decoration:underline}.korean-amount{min-height:22px;margin:7px 0;color:#6b727a}.quick-amounts{flex-wrap:wrap}.quick-amounts .reset-amount{flex-basis:100%;border:0;color:#606a74;text-decoration:underline}.transfer-limit{display:grid;grid-template-columns:1fr auto;gap:8px;margin:10px 28px 14px;padding:13px 0;border-top:1px solid #e2e5e8;color:#666e76;font-size:.84em}.transfer-limit strong{color:#2b2e33}.safety-check{display:flex;gap:12px;margin:16px 28px;padding:14px;border-radius:12px;background:#eef6f3;color:#28644f;text-align:left}.safety-check span{display:flex;flex-direction:column;gap:4px}.safety-check small{line-height:1.4}.done-links button{display:flex;align-items:center;gap:6px}.detail-link{display:flex;align-items:center;justify-content:flex-end;gap:5px;width:100%;border:0;border-top:1px solid #e6e8ea;background:transparent}.transfer-detail{margin:0 28px 26px;padding:14px;border-radius:12px;background:#f5f6f7;text-align:left}.transfer-detail div{display:flex;justify-content:space-between;padding:7px 0}.transfer-detail dt{color:#6d747c}.transfer-detail dd{margin:0;font-weight:700}.kb-toast{position:fixed;left:50%;bottom:86px;z-index:70;transform:translateX(-50%);width:min(410px,calc(100% - 36px));padding:13px 16px;border-radius:12px;background:#24262bee;color:#fff;text-align:center}.modal-layer{justify-items:center}.bank-sheet,.choice-sheet,.display-sheet,.confirm-modal{width:min(100%,480px)}.dark-mode,.dark-mode .kb-page,.dark-mode .menu-page,.dark-mode .settings-page,.dark-mode .easy-page,.dark-mode .transfer-page,.dark-mode .history-page{background:#17191d;color:#f4f5f6}.dark-mode .status-bar,.dark-mode .account-card,.dark-mode .home-service-card,.dark-mode .ars-card,.dark-mode .bottom-nav,.dark-mode .bank-sheet,.dark-mode .choice-sheet,.dark-mode .display-sheet,.dark-mode .confirm-modal{background:#25282e;color:#f4f5f6}.dark-mode .source-account-bar,.dark-mode .transfer-progress,.dark-mode .transfer-detail,.dark-mode .history-filter{background:#30343a}.dark-mode .settings-list>button,.dark-mode .recent-recipient,.dark-mode .choice-row{border-color:#454a52}.dark-mode .practice-account-hint{background:#40391e;color:#fff5c2}.dark-mode .account-input-line,.dark-mode .bank-select-line,.dark-mode .settings-label{color:#f4f5f6}.dark-mode .display-input-wrap input{color:#fff}
.account-card { position: relative; }
.account-switch-controls { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.account-switch {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid #d6dce1;
  border-radius: 50%;
  background: #fff;
  color: #46515c;
  transform: translateY(-50%);
  pointer-events: auto;
}
.account-switch:disabled { color: #c5cbd0; opacity: .65; }
.account-switch--prev { left: 8px; }
.account-switch--next { right: 8px; }
.account-switch__position {
  position: absolute;
  right: 50%;
  bottom: 8px;
  color: #7a838c;
  font-size: .78em;
  transform: translateX(50%);
}
.safety-consent-layer { z-index: 100; padding: 18px; background: rgba(17, 27, 39, .52); }
.safety-consent {
  width: min(100%, 390px);
  padding: 26px 22px 20px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 16px 45px rgba(17, 27, 39, .26);
}
.safety-consent__icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin-bottom: 14px;
  border-radius: 50%;
  background: #eaf1ff;
  color: var(--color-primary);
}
.safety-consent h2 { margin: 0; color: #172b4d; font-size: 1.4em; }
.safety-consent > p { margin: 8px 0 16px; color: #5f6b76; line-height: 1.5; }
.safety-consent__notice {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 15px;
  border: 1px solid #f0d16f;
  border-radius: 12px;
  background: #fff8dc;
  color: #4b4b42;
  line-height: 1.45;
}
.safety-consent__notice strong { color: #8a6500; }
.safety-consent__check { display: flex; align-items: flex-start; gap: 9px; margin: 18px 0; color: #23384d; line-height: 1.45; }
.safety-consent__check input { width: 20px; height: 20px; flex: none; accent-color: var(--color-primary); }
.safety-consent .wide-yellow { width: 100%; }
.safety-consent .wide-yellow:disabled { background: #dfe3e6; color: #8b939a; }
.dark-mode .safety-consent { background: #25282e; color: #f4f5f6; }
.dark-mode .safety-consent h2,.dark-mode .safety-consent__check { color: #f4f5f6; }

@media (max-width:380px) { .home-links{gap:8px}.account-card{margin-left:14px;margin-right:14px}.home-service-card,.ars-card{margin-left:14px;margin-right:14px}.product-grid{gap:5px}.product-grid button{font-size:.8em}.bank-grid{padding-left:20px;padding-right:20px}.bank-grid button{font-size:.95em}.source-account-bar,.account-input-line,.bank-select-line{font-size:1.15em} }
.account-input-line-wrap { display:flex; align-items:center; width:calc(100% - 56px); margin:0 28px; border-bottom:3px solid #b6a479; }
.account-input-editable { min-width:0; flex:1; padding:22px 5px; border:0; outline:0; background:transparent; font:inherit; font-size:1.45em; color:#92969a; font-weight:700; }
.account-input-editable::placeholder { color:#92969a; }
.account-input-line-wrap>button { flex:none; padding:18px 5px; color:#92969a; }
</style>
