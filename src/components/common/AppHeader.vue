<template>
  <header class="app-header" :class="{ 'app-header--bank': bank }">
    <button v-if="showBack" class="app-header__icon-btn" aria-label="이전 화면으로" @click="$emit('back')">
      ‹
    </button>
    <div
      v-else
      class="app-header__brand"
      :class="{ 'app-header__brand--bank': bank }"
      aria-hidden="true"
    >
      {{ bank?.theme?.motif || '한' }}
    </div>

    <div class="app-header__title-wrap">
      <h1 class="app-header__title">{{ bank ? bank.name : title }}</h1>
      <span v-if="bank" class="app-header__subtitle">{{ title }} · 가상 연습용 은행</span>
    </div>

    <div class="app-header__right">
      <span v-if="badge" class="app-header__badge">{{ badge }}</span>
      <button
        v-if="showHome"
        class="app-header__icon-btn"
        aria-label="홈으로 이동"
        @click="$emit('home')"
      >
        ⌂
      </button>
    </div>
    <span v-if="bank" class="app-header__accent-line" aria-hidden="true"></span>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  showBack: { type: Boolean, default: false },
  showHome: { type: Boolean, default: false },
  badge: { type: String, default: '' },
  // 은행 객체(assets/data/banks.js)를 전달하면 해당 은행의 테마(예: KB국민은행 스타일)로 헤더를 표시
  bank: { type: Object, default: null }
})
defineEmits(['back', 'home'])
</script>

<style scoped>
.app-header {
  position: sticky; /* sticky는 static이 아니므로 하위 absolute(accent-line)의 기준점이 됨 */
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--bank-header-bg, var(--color-surface));
  border-bottom: 1px solid var(--color-border);
}
.app-header--bank {
  padding-bottom: 12px;
}
.app-header__brand {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 15px;
  flex-shrink: 0;
}
.app-header__brand--bank {
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
.app-header__title-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.app-header__subtitle {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-weight: 600;
}
.app-header__accent-line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
}
.app-header__icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--color-bg);
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.app-header__title {
  font-size: var(--fs-body-lg);
  font-weight: 800;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--bank-header-text, var(--color-text));
}
.app-header__right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.app-header__badge {
  font-size: var(--fs-caption);
  font-weight: 700;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 999px;
  padding: 4px 10px;
  white-space: nowrap;
}
</style>
