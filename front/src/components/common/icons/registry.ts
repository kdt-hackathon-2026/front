// 이모지 대신 쓰는 SVG 아이콘 모음. 전부 24x24 기준, stroke=currentColor 라인 아이콘 스타일입니다.
// Icon.vue 에서 이 registry의 key를 name prop으로 받아 렌더링합니다.
export interface IconDef {
  viewBox: string
  body: string // <path>, <circle> 등 내부 마크업 (stroke/fill은 currentColor 상속)
}

export const ICONS: Record<string, IconDef> = {
  // ---- 내비게이션 / 공통 UI ----
  'chevron-left': { viewBox: '0 0 24 24', body: '<path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' },
  'chevron-right': { viewBox: '0 0 24 24', body: '<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' },
  home: { viewBox: '0 0 24 24', body: '<path d="M4 11.5 12 4l8 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10v9a1 1 0 0 0 1 1h4v-5h2v5h4a1 1 0 0 0 1-1v-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' },
  search: { viewBox: '0 0 24 24', body: '<circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  transfer: { viewBox: '0 0 24 24', body: '<path d="M4 8h13M14 4l3 4-3 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 16H7M10 12l-3 4 3 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' },
  plus: { viewBox: '0 0 24 24', body: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' },
  chart: { viewBox: '0 0 24 24', body: '<path d="M5 19V10M12 19V5M19 19v-7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' },
  menu: { viewBox: '0 0 24 24', body: '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  leaf: { viewBox: '0 0 24 24', body: '<path d="M5 19c8-1 13-6 14-14-8 1-13 6-14 14Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M5 19c2-4 5-7 9-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  settings: { viewBox: '0 0 24 24', body: '<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M19 12a7 7 0 0 0-.1-1.1l2-1.5-2-3.4-2.3.9a7 7 0 0 0-1.9-1.1L14.3 3H9.7l-.4 2.8a7 7 0 0 0-1.9 1.1l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .7.1 1.1l-2 1.5 2 3.4 2.3-.9c.6.5 1.2.8 1.9 1.1l.4 2.8h4.6l.4-2.8c.7-.3 1.3-.6 1.9-1.1l2.3.9 2-3.4-2-1.5c.1-.4.1-.7.1-1.1Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' },
  clipboard: { viewBox: '0 0 24 24', body: '<rect x="6" y="4" width="12" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 11h6M9 15h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' },

  // ---- 액션 아이콘 ----
  mic: { viewBox: '0 0 24 24', body: '<rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  volume: { viewBox: '0 0 24 24', body: '<path d="M4 10v4h4l5 4V6l-5 4H4Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M17 9a5 5 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  play: { viewBox: '0 0 24 24', body: '<path d="M7 4.5v15l13-7.5-13-7.5Z" fill="currentColor"/>' },
  pause: { viewBox: '0 0 24 24', body: '<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>' },
  replay: { viewBox: '0 0 24 24', body: '<path d="M4 12a8 8 0 1 1 2.6 5.9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 17v-5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' },
  speed: { viewBox: '0 0 24 24', body: '<circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 13l4-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 3h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  pencil: { viewBox: '0 0 24 24', body: '<path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 7l3 3" stroke="currentColor" stroke-width="2"/>' },
  backspace: { viewBox: '0 0 24 24', body: '<path d="M9 5h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7 6-7Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' },

  // ---- 상태 / 알림 아이콘 ----
  check: { viewBox: '0 0 24 24', body: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' },
  'check-circle': { viewBox: '0 0 24 24', body: '<circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12.5l2.7 2.7L16.5 9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' },
  info: { viewBox: '0 0 24 24', body: '<circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="7.6" r="1.2" fill="currentColor"/>' },
  'alert-triangle': { viewBox: '0 0 24 24', body: '<path d="M12 3.5 22 20H2L12 3.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17.3" r="1.1" fill="currentColor"/>' },
  lock: { viewBox: '0 0 24 24', body: '<rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/>' },

  // ---- 계좌/시나리오 아이콘 ----
  wallet: { viewBox: '0 0 24 24', body: '<rect x="3" y="6" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 10h18" stroke="currentColor" stroke-width="2"/><circle cx="16.5" cy="14" r="1.2" fill="currentColor"/>' },
  purse: { viewBox: '0 0 24 24', body: '<path d="M5 10c0-3.9 3.1-7 7-7s7 3.1 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="3" y="10" width="18" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="15" r="1.3" fill="currentColor"/>' },
  handshake: { viewBox: '0 0 24 24', body: '<path d="M2 12l5-4 4 3 3-3 5 3-3 5-3-2-3 3-4-2-4-3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' },
  hospital: { viewBox: '0 0 24 24', body: '<rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' },
  'house-heart': { viewBox: '0 0 24 24', body: '<path d="M4 11.5 12 4l8 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 18.5s-2.6-1.6-2.6-3.3a1.5 1.5 0 0 1 2.6-1 1.5 1.5 0 0 1 2.6 1c0 1.7-2.6 3.3-2.6 3.3Z" fill="currentColor"/>' },

  // ---- 은행 테마 모티프 ----
  star: { viewBox: '0 0 24 24', body: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.6L12 17.7l-5.8 3-1.1-6.6L.3 9.4l6.6-.9L12 2.5Z" fill="currentColor"/>' },
  wheat: { viewBox: '0 0 24 24', body: '<path d="M12 21V3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 6 8 4M12 6l4-2M12 11 8 9m4 2 4-2M12 16l-4-2m4 2 4-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' },

  // ---- 기타 ----
  phone: { viewBox: '0 0 24 24', body: '<path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' },
  dice: { viewBox: '0 0 24 24', body: '<rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8.3" cy="8.3" r="1.2" fill="currentColor"/><circle cx="15.7" cy="8.3" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="8.3" cy="15.7" r="1.2" fill="currentColor"/><circle cx="15.7" cy="15.7" r="1.2" fill="currentColor"/>' },
  refresh: { viewBox: '0 0 24 24', body: '<path d="M20 12a8 8 0 1 1-2.6-5.9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20 3v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' },
  sparkle: { viewBox: '0 0 24 24', body: '<path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z" fill="currentColor"/>' },
  bot: { viewBox: '0 0 24 24', body: '<rect x="4" y="8" width="16" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="3" r="1.3" fill="currentColor"/><circle cx="9" cy="13.5" r="1.3" fill="currentColor"/><circle cx="15" cy="13.5" r="1.3" fill="currentColor"/><path d="M9 17h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' },
  document: { viewBox: '0 0 24 24', body: '<path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 3v4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 12h6M9 16h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' }
}

export type IconName = keyof typeof ICONS
