import { computed, unref } from 'vue'

/**
 * 은행별 화면 템플릿(기능명세 4.40) 적용용 컴포저블
 * bankRef: BANKS 배열의 은행 객체(ref 또는 값)
 * 반환된 style 객체를 화면 최상위 요소에 :style로 바인딩하면
 * 버튼/헤더/선택카드 등 공통 컴포넌트가 자동으로 해당 은행 색감을 따라갑니다.
 */
export function useBankTheme(bankRef) {
  const themeStyle = computed(() => {
    const bank = unref(bankRef)
    const t = bank?.theme
    if (!t) return {}
    return {
      '--color-primary': t.primary,
      '--color-primary-dark': t.primaryDark,
      '--color-primary-light': t.primaryLight,
      '--color-on-primary': t.onPrimary,
      '--bank-header-bg': t.headerBg,
      '--bank-header-text': t.headerText
    }
  })

  // 'default'가 아닌 모든 은행(가은행=KB 스타일, 나은행=NH 스타일 등)은
  // 실제 앱처럼 워드마크 헤더 + 퀵메뉴 레이아웃을 사용합니다.
  const isKbStyle = computed(() => {
    const variant = unref(bankRef)?.theme?.variant
    return !!variant && variant !== 'default'
  })

  return { themeStyle, isKbStyle }
}
