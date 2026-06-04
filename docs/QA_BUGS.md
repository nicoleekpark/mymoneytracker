# QA Bug Tracking - v1.0.0

QA 테스트 중 발견한 버그를 트래킹합니다.
릴리즈 후에는 GitHub Issues로 이동합니다.

---

## Status Legend

| Status | Meaning                            |
| ------ | ---------------------------------- |
| `[ ]`  | Open - 수정 필요                   |
| `[~]`  | In Progress - 수정 중              |
| `[x]`  | Fixed - 수정 완료                  |
| `[-]`  | Won't Fix - 수정 안 함 (사유 기록) |

## Priority

| Priority | Meaning                                         |
| -------- | ----------------------------------------------- |
| `P0`     | Blocker - 출시 불가, 즉시 수정                  |
| `P1`     | Critical - 주요 기능 문제, 출시 전 수정 필수    |
| `P2`     | Major - 불편하지만 우회 가능, 출시 전 수정 권장 |
| `P3`     | Minor - 사소한 문제, 다음 버전에 수정 가능      |

---

## Open Bugs

### P0 - Blocker

(없음)

### P1 - Critical

(없음)

---

### P2 - Major

#### [x] #7 - Category modal should show subcategories when chip is selected → Fixed

- **수정 내용:** CategorySelectionModal에 `initialCategory` prop 추가
  - Category chip(subcategory 없이)을 선택한 상태에서 modal 열면 해당 category의 subcategory 목록 표시
  - Back 버튼으로 다른 category 선택 가능

---

#### [x] #8 - Category chip reorder should use drag-and-drop → Fixed

- **수정 내용:** DraggableChipList 컴포넌트 구현
  - react-native-gesture-handler + react-native-reanimated 사용
  - Long press (200ms) → 칩이 떠오름 (scale, shadow)
  - 드래그하면 다른 칩들이 자동으로 이동
  - Drop 시 새 위치로 저장
  - Up/Down 버튼 제거, drag handle 아이콘 추가

---

#### [x] #9 - Drafts notification shows wrong message → Fixed

- **수정 내용:** Drafts 탭이 이제 실제 drafts를 표시 (draft reminder notifications 대신)

---

#### [x] #10 - Drafts page needs redesign with time-based grouping → Fixed

- **수정 내용:** Drafts 탭 리디자인 완료
  - 실제 drafts를 기간별로 그룹핑 (Today, This Week, Older)
  - 최신순 정렬
  - 클릭 시 draft 편집 화면으로 이동

---

### P3 - Minor

(없음)

---

## Fixed Bugs

| #   | Priority | Description                                            | Fix                                                                                                                                                                    | Date       |
| --- | -------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | P1       | Monthly budget not reflecting user settings            | `useBudgetSummary` now reads from `useSettingsStore().monthlyBudget` instead of hardcoded `APP_CONFIG`                                                                 | 2026-06-02 |
| 2   | P1       | Dashboard not refreshing after adding transaction      | Created `useDataRefreshStore` with `transactionVersion` counter. All dashboard hooks subscribe to it. `AddTransactionScreen` calls `invalidateTransactions()` on save. | 2026-06-02 |
| 3   | P2       | Visual glitch on Transactions page initial load        | Month header now always renders (reserves space) even when loading, preventing layout shift                                                                            | 2026-06-02 |
| 4   | P2       | FAB (+) button tap area too small                      | Increased hitSlop to 12px each side and added 44x44pt container for Apple HIG compliance                                                                               | 2026-06-02 |
| 5   | P2       | No way to add new account from "Paid with" picker      | Added "Add Account" ListFooterComponent to AccountSelectionModal (shows "Coming Soon" alert for now)                                                                   | 2026-06-02 |
| 6   | P2       | Items input should support continuous multi-line entry | Added `onSubmitEditing` handler - pressing Enter commits item and keeps focus for next item                                                                            | 2026-06-02 |
| 9   | P2       | Drafts notification shows wrong message                | Drafts tab now shows actual drafts (from drafts store) instead of draft reminder notifications                                                                         | 2026-06-02 |
| 10  | P2       | Drafts page needs redesign with time-based grouping    | Redesigned Drafts tab: groups by Today/This Week/Older, shows actual drafts with amount, navigates to edit on tap                                                      | 2026-06-02 |
| 7   | P2       | Category modal should show subcategories when chip is selected | Added `initialCategory` prop to CategorySelectionModal - when parent category is selected, modal opens to subcategory view with back button | 2026-06-02 |
| 8   | P2       | Category chip reorder should use drag-and-drop | Implemented DraggableChipList with react-native-gesture-handler + reanimated. Long press to lift, drag to reorder, drop to save. | 2026-06-02 |

---

## Bug Template

```
### [ ] P? - Bug Title

- **발견 위치:** (화면/기능)
- **재현 방법:**
1. Step 1
2. Step 2
3. Step 3

- **예상 동작:**
- **실제 동작:**
- **스크린샷:** (있으면)

- **수정 내용:** (수정 후 기록)
- **수정 일자:**
```

---

## Notes

- QA 완료 후 이 파일에서 Fixed 버그들을 CHANGELOG.md의 Fixed 섹션으로 옮기기
- v1.0.0 출시 후에는 GitHub Issues 사용
