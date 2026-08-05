# AGENTS.md

## 프로젝트 개요

### 프로젝트 이름

**금융한걸음** — 고령층과 디지털 금융 취약계층을 위한 모의 계좌이체·AI 금융 학습 웹앱

### 기술 스택

| 구분   | 기술                                                  |
| ------ | ----------------------------------------------------- |
| Core   | Vue 3 (Composition API, `<script setup>`), TypeScript |
| 상태   | Pinia                                                 |
| 라우팅 | Vue Router                                            |
| 스타일 | Tailwind CSS                                          |
| 통신   | axios, TTS·STT 음성 API                               |
| 기타   | AI 튜터, AI ARS, 모바일 우선 반응형 웹                |

### 코드 작성 규칙

- 아키텍처는 **MVVM**을 따른다.
  - **Model** — `apis/`, `types/`, `models/`
  - **ViewModel** — `stores/`, `composables/`
  - **View** — `views/`, `components/`, `layouts/`
- `.vue`(View)에는 비즈니스 로직을 두지 않는다. 상태·로직은 store/composable에서 가져와 쓴다.
- 서버 통신은 `apis/`에서만 한다. `.vue`에서 axios 직접 호출 금지.
- DTO → 도메인 변환은 **store의 `.map(toXxx)` 한 곳에서만** 한다.
- 실제 송금, 실제 계좌 조회, 실제 금융기관 인증 기능을 구현하지 않는다.
- 계좌·수취인·잔액·인증번호는 교육용 가상 데이터만 사용한다.
- 색상은 반드시 Tailwind config의 토큰명으로 쓴다.
  - 작업 전 `tailwind.config`의 color 정의를 먼저 확인한다.
  - config에 같은 색이 있으면 무조건 토큰명을 사용한다. `bg-primary` (O) / `bg-[#0068A8]` (X)
  - config에 없는 색만 arbitrary value로 사용하고 옆에 `<!-- TODO: 토큰 등록 검토 -->`를 남긴다.
  - 공용 색상 토큰을 임의로 추가하지 않는다. 토큰 추가가 필요하면 별도 PR로 처리한다.
- Figma·디자인에서 가져온 HEX는 붙여넣기 전에 기존 토큰과 먼저 매칭한다.
- Figma의 빨간 테두리, 번호, 화살표 등 검수용 표시는 실제 UI로 구현하지 않는다.

### 네이밍 규칙

| 대상             | 규칙             | 예시                                       |
| ---------------- | ---------------- | ------------------------------------------ |
| 컴포넌트/뷰 파일 | PascalCase       | `PracticeAmountView.vue`, `VoiceGuide.vue` |
| 뷰 파일 접미사   | `~View`          | `HomeView.vue`                             |
| store            | `useXxxStore`    | `usePracticeStore`                         |
| composable       | `useXxx`         | `useSpeechRecognition`                     |
| DTO 타입         | `~Dto`           | `PracticeResponseDto`                      |
| 도메인 타입      | 접미사 없음      | `Practice`                                 |
| 변환 함수        | `toXxx`          | `toPractice`                               |
| 상수             | UPPER_SNAKE_CASE | `STORAGE_KEYS`, `PRACTICE_STEPS`           |
| 폴더             | 소문자 복수형    | `stores/`, `types/`                        |

### 우선 순위

작성·수정 시 아래 순서로 판단한다.

1. **금융 안전·개인정보 보호** — 실제 송금과 실제 금융정보 처리를 절대 만들지 않는다.
2. **접근성** — 큰 글씨, 큰 버튼, 음성 안내, 키보드 조작과 대체 수단을 보장한다.
3. **타입 안전** — `any` 금지. 타입이 없으면 먼저 정의한다.
4. **MVVM 경계 준수** — 로직이 `.vue`로 새지 않게 한다.
5. **팀 컨벤션 일치** — 기존 파일 패턴을 그대로 따른다.
6. **동작** — 위 규칙을 지킨 뒤 기능을 구현한다.

### 폴더 구조

```text
src/
├── apis/                       # Model - 서버 통신
│   ├── axios.ts                #   인스턴스, 인터셉터
│   ├── homeApi.ts
│   ├── practiceApi.ts
│   ├── tutorApi.ts
│   └── arsApi.ts
├── types/                      # Model - 타입만
│   ├── dto/                    #   서버 스펙
│   │   ├── practice.dto.ts
│   │   ├── tutor.dto.ts
│   │   └── ars.dto.ts
│   ├── practice.ts             #   프론트 도메인 타입
│   ├── accessibility.ts
│   └── common.ts               #   ApiResponse<T> 등 공용
├── models/                     # Model - 변환 (DTO → 도메인)
│   ├── Practice.ts
│   ├── Tutor.ts
│   └── Ars.ts
├── stores/                     # ViewModel - Pinia
│   ├── practiceStore.ts
│   ├── tutorStore.ts
│   └── settingsStore.ts
├── composables/                # ViewModel - 재사용 로직
│   ├── usePracticeFlow.ts
│   ├── useSpeechSynthesis.ts
│   └── useSpeechRecognition.ts
├── views/                      # View - 라우터 연결 페이지
│   ├── HomeView.vue
│   ├── onboarding/
│   ├── practice/
│   ├── tutor/
│   └── ars/
├── components/                 # View - 재사용 UI
│   ├── ui/                     #   버튼·입력·카드 등 기본 UI
│   ├── common/                 #   헤더·하단 네비·진행 표시
│   ├── accessibility/          #   음성 제어·글자 크기
│   ├── practice/               #   모의 계좌이체
│   ├── tutor/                  #   AI 튜터
│   └── ars/                    #   AI ARS
├── layouts/                    # View - slot으로 화면을 감쌈
│   ├── DefaultLayout.vue
│   ├── SetupLayout.vue
│   └── PracticeLayout.vue
├── constants/                  # 고정값
│   └── index.ts
├── utils/                      # 재사용 순수 함수
│   ├── format.ts               #   금액·날짜 포맷
│   ├── mask.ts                 #   계좌번호 등 마스킹
│   └── validate.ts             #   입력값 검증
├── router/index.ts
├── assets/
├── App.vue
└── main.ts
```

---

## 규칙

### 타입 규칙

- **DTO와 도메인 타입을 분리한다.** 서버 응답 원형은 `types/dto/`, 프론트에서 쓰는 형태는 `types/`.
- DTO(`types/dto/`)는 **백엔드 스펙이 진실**이다. 임의로 필드명을 바꾸지 않는다.
- import해서 쓰는 타입은 전부 `.ts`에 작성한다. `.d.ts`는 전역 선언(`env.d.ts`, 라이브러리 보강) 전용이다.
- 타입만 가져올 때는 `import type { Practice }`를 사용한다.
- `any` 사용 금지. 알 수 없는 외부 값은 `unknown`으로 받은 뒤 타입을 좁힌다.
- 상수는 `as const`로 고정한다.
- 타입과 상수를 같은 파일에 섞지 않는다.
- API 응답이 이미 camelCase라면 불필요한 필드 변환을 만들지 않는다.
- 서버 응답이 snake_case인 경우에만 mapper에서 camelCase로 변환한다.

### 컴포넌트 규칙

- `<script setup lang="ts">`를 사용한다.
- `views/`와 `components/`의 기준은 **라우터에 등록되면 view, 아니면 component**다.
- props와 emit은 타입으로 선언한다: `defineProps<{ practice: Practice }>()`.
- 한 화면에서만 쓰는 임시 상태는 `.vue` 안의 `ref`로 둔다. 공유 상태만 store로 관리한다.
- `layouts/`는 `<slot />`으로 화면을 감싸는 껍데기다. 비즈니스 로직을 넣지 않는다.
- 헤더, 하단 네비, 단계 진행 표시를 각 view에 직접 반복해서 그리지 않는다.
- AI 튜터 카드와 음성 제어는 공통 컴포넌트로 재사용한다.
- 한 화면에는 하나의 핵심 행동만 배치한다.
- 필수 입력이나 선택이 완료되지 않으면 다음 단계로 진행하지 않는다.
- 음성 안내가 끝나도 자동으로 다음 화면으로 이동하지 않는다.

### 유틸 규칙

- 재사용 가능한 코드는 `utils/`에 함수로 추가해서 가져다 쓴다. 같은 로직을 여러 곳에 복사하지 않는다.
- `utils/`에는 **상태 없는 순수 함수**만 둔다.
- 상태나 Vue 반응성이 필요하면 `utils/`가 아니라 `composables/`로 이동한다.
- 함수 단위로 export하고 관련 함수는 파일로 묶는다 (`format.ts`, `mask.ts`, `validate.ts` 등).
- 특정 화면에서 한 번만 쓰는 로직은 무리하게 `utils/`로 올리지 않는다.
- 금액 포맷, 한글 금액 변환, 계좌번호 마스킹, 입력값 검증은 순수 함수로 작성한다.
- 클라이언트 검증만 신뢰하지 않고 서버 검증 결과를 다시 확인한다.

### 금지 규칙

- ❌ `.vue`에서 axios 직접 호출
- ❌ `.vue`에서 금액 계산·단계 전이·완료 판정
- ❌ `localStorage.setItem('token')` 등 문자열 하드코딩 → `STORAGE_KEYS` 사용
- ❌ `router.push('/practice/amount')` 문자열 하드코딩 → 라우트 name 상수 사용
- ❌ 컴포넌트에서 DTO 응답을 직접 가공
- ❌ `any`, `@ts-ignore`
- ❌ 공용 파일(`types/dto/`, `constants/`, `layouts/`) 승인 없이 수정
- ❌ 직접 DOM 조작 (`document.querySelector` 등)
- ❌ 실제 송금 또는 실제 금융기관 API 연결
- ❌ 실제 계좌번호·비밀번호·OTP·주민등록번호 수집 및 저장
- ❌ 음성 원본과 민감한 입력값을 로그에 출력
- ❌ 음성 인식 결과만으로 모의 이체 완료
- ❌ 완료·저장 버튼의 중복 클릭과 중복 요청 방지 생략
- ❌ 색상만으로 선택·오류·완료 상태 표시
- ❌ Figma 검수용 표시를 실제 화면에 구현

### 커밋 규칙

`type: 제목` 형식을 사용한다. 한글 제목을 허용한다.

| type       | 용도                    |
| ---------- | ----------------------- |
| `feat`     | 기능 추가               |
| `fix`      | 버그 수정               |
| `style`    | UI·CSS (동작 변화 없음) |
| `refactor` | 리팩터링                |
| `chore`    | 설정·빌드·패키지        |
| `docs`     | 문서                    |

- 예: `feat: 모의 계좌이체 금액 입력 단계 구현`
- 한 커밋에는 한 가지 목적만 포함한다.

### git 규칙

- 브랜치: `type/기능-요약` (예: `feat/practice-transfer`, `fix/duplicate-request`)
- `main`에 직접 push하지 않는다. PR과 리뷰 1명 이상 승인 후 머지한다.
- 공용 파일(`types/dto/`, `constants/index.ts`, `layouts/`)은 **별도 PR로 먼저 머지**하고 기능 작업을 시작한다.
- PR 제목은 커밋 규칙과 동일하게 작성한다.
- 머지 전 로컬에서 `main`을 최신화하고 충돌을 해결한다.

### 작업 분류

| 담당            | 영역                        |
| --------------- | --------------------------- |
| TODO(확인 필요) | 홈·초기 설정·온보딩         |
| TODO(확인 필요) | 모의 계좌이체·반복 학습     |
| TODO(확인 필요) | AI 튜터·AI ARS              |
| TODO(확인 필요) | 접근성·TTS·STT              |
| TODO(확인 필요) | 공통 컴포넌트·API·상태 관리 |

- 담당 화면 밖 파일 수정이 필요하면 해당 담당자에게 먼저 공유한다.
- 담당자가 확정되기 전에는 임의로 팀원 이름을 작성하지 않는다.

### 작업 완료 보고

작업 종료 시 아래 형식으로 보고한다.

```text
[작업] 무엇을 했는지 (한 줄)
[변경 파일] 추가/수정된 파일 목록
[영향 범위] 공용 파일 변경 여부 · 다른 담당 영역 영향 여부
[확인 필요] 리뷰어가 봐야 할 부분 (있으면)
[남은 것] 미완 · TODO (있으면)
```
