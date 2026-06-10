# Drafts Spec

> Last updated: 2026-06-10

## Overview

저장하다 만 트랜잭션을 나중에 이어서 작성할 수 있도록 임시 저장하는 기능.

## Entry Points

3가지 진입점:

| Entry Point | Location | Result |
|-------------|----------|--------|
| **Draft 버튼** | Transactions 페이지 header (notification 버튼 옆) | Transactions 페이지 + drafts filter 적용 |
| **Drafts 탭** | Notifications 화면 내부 탭 | 심플한 목록 (시간 역순) |
| **Filter** | Transactions 페이지 filter sheet | Drafts만 보기 |

## Layout

### Entry Point 1: Draft 버튼 (Transactions Header)
- [ ] 아이콘 버튼 (notification 버튼 옆)
- [ ] **Badge로 draft 개수 표시** (숫자: "3")
- [ ] 탭하면 → Transactions 페이지 + drafts filter 자동 적용

### Entry Point 2: Notifications > Drafts 탭
- [ ] 탭: Notifications | Drafts
- [ ] 심플 리스트 (시간 역순)
- [ ] 각 row: Amount, Description/Category, 시간

### Entry Point 3: Transactions Filter
- [ ] Filter sheet에서 "Drafts" 옵션 선택
- [ ] 기존 Transactions 리스트와 동일한 UI

## Draft Row 표시 정보

- [ ] Amount (있으면)
- [ ] Description 또는 Category (있으면)
- [ ] 생성 시간 (relative: "2 hours ago")
- [ ] Draft 표시 badge/indicator

## Interactions

### 현재 동작 (❌ 잘못됨)

| Action | Current (Wrong) |
|--------|-----------------|
| Transactions 페이지에서 draft 탭 | 무응답 |
| 다른 페이지에서 draft 탭 | Transactions 페이지로 이동만 |

### 올바른 동작 (✅ Expected)

| Action | Expected |
|--------|----------|
| **Draft row 탭** | Add Transaction 화면 열림 (draft 데이터 pre-fill) |
| Draft 스와이프 | 없음 (스와이프 삭제 없음) |
| **Draft 삭제** | Add Transaction 화면 내에서만 가능 |

## States

### Empty State
- Draft 0개일 때
- 메시지: "No drafts" 또는 유사
- Draft 버튼 badge 숨김

## Test Checklist

### Visual
- [ ] Draft 버튼에 개수 badge 표시 (숫자)
- [ ] Draft 0개일 때 badge 숨김
- [ ] Draft row에 "Draft" indicator 표시
- [ ] 시간 역순 정렬

### Functional
- [ ] **Draft row 탭 → Add Transaction 화면 열림 (pre-fill)**
- [ ] Pre-fill: amount, category, description, merchant, date 등
- [ ] Add Transaction에서 Save → draft 삭제됨
- [ ] Add Transaction에서 Cancel → draft 유지
- [ ] Add Transaction에서 Delete Draft 옵션
- [ ] Notifications > Drafts 탭 동일하게 동작

### Edge Cases
- [ ] Draft 0개 → Empty state
- [ ] 여러 draft 있을 때 정렬 순서
- [ ] Draft 저장 후 앱 재시작 → 유지됨

## Related Screens

- [Add Transaction](./add-transaction.spec.md)
- [Transactions List](./transactions-list.spec.md)
- [Notifications](./notifications.spec.md)

## Notes

- Drafts는 `useDraftsStore`에 저장됨 (local storage)
- 삭제는 Add Transaction 화면 내에서만 가능 (실수 방지)
- 스와이프 삭제 없음

## 🐛 Known Bugs (Fixed)

| Bug | Issue | Fix |
|-----|-------|-----|
| ~~Draft 버튼 무응답~~ | ~~Transactions 페이지에서 버튼 탭하면 filter 안 바뀜~~ | ✅ `useEffect`로 params 변경 감지 + `router.replace` 사용 |
| Draft row 탭 | Add Transaction으로 이동해야 함 | ✅ 코드 확인 완료 - 정상 동작해야 함 |
