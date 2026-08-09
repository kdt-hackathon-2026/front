import { computed, unref, type ComputedRef, type Ref } from 'vue'
import type { Bank } from '@/types'
import { getBankThemePreset } from '@/assets/data/bankThemePresets'

/** CSS 커스텀 프로퍼티(--color-primary 등)만 담는 style 객체 - :style 바인딩용 */
export type BankThemeStyle = Record<string, string>

/**
 * 은행별 화면 템플릿(기능명세 4.40) 적용용 컴포저블
 * bankRef: BANKS 배열의 은행 객체(ref, computed 또는 값 - null 가능)
 *
 * 주의: 이 컴포저블은 "이 화면에 테마를 적용할지"는 판단하지 않습니다.
 * 은행을 고른 화면 자체에는 테마를 걸지 말고, 그 다음 화면부터 이 컴포저블을 써서
 * 테마를 적용하세요 (기획: 은행 선택 즉시가 아니라 다음 페이지부터 테마 전환).
 */
export function useBankTheme(bankRef: Bank | null | Ref<Bank | null> | ComputedRef<Bank | null>) {
  const preset = computed(() => getBankThemePreset(unref(bankRef)?.bankCode))

  const themeStyle = computed<BankThemeStyle>(() => {
    const bank = unref(bankRef)
    if (!bank) return {} as BankThemeStyle
    const p = preset.value
    return {
      '--color-primary': bank.themeColor,
      '--color-primary-dark': p.primaryDark,
      '--color-primary-light': p.primaryLight,
      '--color-on-primary': p.onPrimary,
      '--bank-header-bg': '#ffffff',
      '--bank-header-text': '#1b1f27'
    }
  })

  // 브랜드 테마(KB/NH 등)인 은행만 실제 앱처럼 워드마크 헤더 + 퀵메뉴 레이아웃을 씁니다.
  const isBrandedStyle = computed<boolean>(() => preset.value.branded)
  // 이전 버전과의 호환용 별칭
  const isKbStyle = isBrandedStyle

  const quickMenuLabels = computed(() => preset.value.quickMenuLabels ?? [])
  const quickMenuIcons = computed(() => preset.value.quickMenuIcons ?? [])

  return { themeStyle, isBrandedStyle, isKbStyle, quickMenuLabels, quickMenuIcons }
}
