<div align="center">
  <h1>💍 KDT Hackathon 2026 — Frontend</h1>
  <p><b>결혼 준비 커플을 위한 재무 관리 서비스의 프론트엔드 저장소</b></p>
</div>

## 🏆 프로젝트 정보

| 구분 | 내용 |
| --- | --- |
| **팀명** | KDT Hackathon 2026 |
| **팀 주제** | 결혼 준비 커플을 위한 재무 목표·공동 예산·지출 관리 및 카드 전략 추천 서비스 |


## 🛠 기술 스택

| 구분 | 기술 |
| --- | --- |
| **Frontend** | Vue 3, JavaScript, Pinia |
| **Styling** | Tailwind CSS, shadcn-vue |
| **실시간 통신** | SSE (Server-Sent Events) |
| **기타** | PWA |
| **Backend** | 추후 확정 |

## 📦 저장소

| 구분 | 저장소 |
| --- | --- |
| **Frontend** | [kdt-hackathon-2026/front](https://github.com/kdt-hackathon-2026/front) |
| **Backend** | [kdt-hackathon-2026/back](https://github.com/kdt-hackathon-2026/back) |

## 🌿 브랜치 전략

- `main`: 최종 배포 및 안정 버전
- `develop`: 기능 통합 브랜치
- `feat/{이슈번호}-{기능명}`: 기능 개발
- `fix/{이슈번호}-{수정명}`: 버그 수정
- 이슈 브랜치는 `develop`에서 생성하고, 작업 완료 후 `develop`을 대상으로 PR을 생성합니다.
- 배포 준비가 완료되면 `develop → main` PR을 생성합니다.
