# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run on iOS Simulator
npm run dev

# Run on Android Emulator
npm run dev:android
```

---

## Development Workflow

```
로컬 개발 ──→ 실기기 테스트 ──→ QA/베타 ──→ 앱스토어
(npm run dev)  (eas:dev)      (eas:staging)  (eas:prod)
```

---

## Commands Reference

### Local Development (Simulator)

| Command               | Description                             |
| --------------------- | --------------------------------------- |
| `npm run dev`         | iOS 시뮬레이터에서 실행 (DevTools 포함) |
| `npm run dev:android` | Android 에뮬레이터에서 실행             |
| `npm run staging`     | 스테이징 모드 (DevTools 없음)           |

### EAS Builds (Real Device)

| Command               | When to Use                    |
| --------------------- | ------------------------------ |
| `npm run eas:dev`     | 실제 기기에서 디버깅 필요할 때 |
| `npm run eas:staging` | QA 테스트, 팀원에게 공유할 때  |
| `npm run eas:prod`    | App Store 제출용 최종 빌드     |

### Native Builds

| Command                 | Description                      |
| ----------------------- | -------------------------------- |
| `npm run build:ios`     | iOS 네이티브 프로젝트 리빌드     |
| `npm run build:android` | Android 네이티브 프로젝트 리빌드 |

### Database

| Command                         | Description                     |
| ------------------------------- | ------------------------------- |
| `npm run db:migrate:new <name>` | 새 마이그레이션 생성            |
| `npm run db:migrate:regen`      | 마이그레이션 인덱스 재생성      |
| `npm run db:pull`               | 시뮬레이터 DB를 로컬로 내보내기 |
| `npm run db:reset`              | DB 리셋 (앱 삭제 후 재설치)     |

---

## When is a Native Build Required?

| 변경 사항                     | 빌드 필요? | 명령어                             |
| ----------------------------- | ---------- | ---------------------------------- |
| JS/TS 코드 변경               | ❌         | `npm run dev` (hot reload)         |
| 네이티브 모듈 추가/업데이트   | ✅         | `npm run build:ios && npm run dev` |
| `app.json` 네이티브 설정 변경 | ✅         | `npm run build:ios && npm run dev` |
| Expo SDK 업그레이드           | ✅         | `npm run build:ios && npm run dev` |
| pod 설치 후                   | ✅         | `npm run build:ios && npm run dev` |

---

## Local vs EAS Builds

|               | Local (`npm run dev`) | EAS (`npm run eas:*`) |
| ------------- | --------------------- | --------------------- |
| **실행 위치** | 내 컴퓨터             | 클라우드 (EAS 서버)   |
| **속도**      | 빠름                  | 느림 (빌드 큐 대기)   |
| **결과물**    | 시뮬레이터 실행       | .ipa/.apk 파일        |
| **용도**      | 개발 중 테스트        | 실기기 테스트, 배포   |

---

## Hot Reload

JS/TS 코드 변경 시 자동으로 앱이 리로드됩니다.

수동 리로드가 필요하면:

- **시뮬레이터**: `Cmd + R`
- **터미널**: Metro 실행 중인 터미널에서 `r` 키

---

## Troubleshooting

### Port Already in Use

```bash
# 기존 Metro 프로세스 종료
lsof -ti:8081 | xargs kill -9

# 다시 시작
npm run dev
```

### Simulator Not Opening

```bash
# iOS 시뮬레이터 수동 실행
open -a Simulator

# 그 후 npm run dev
```

### Native Module Issues

```bash
# 클린 리빌드
cd ios && pod install && cd ..
npm run build:ios && npm run dev
```

### Refactoring

- always use tokens/semantic colors etc/ under theme/ instead of using raw values or setting variables in individual classes
