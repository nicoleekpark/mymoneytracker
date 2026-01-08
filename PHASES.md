## Table of Contents
- [PHASE 1](#phase-1)
  - [PAGES](#pages)
    - [Manual Transaction](#manual-transaction)
    - [Transactions](#transactions)
    - [Dashboard](#dashboard)
    - [Insight](#insight)
  - [FEATURES](#features)
    - [Tag](#tag)
- [PHASE 2](#phase-2)
  - [PAGES](#pages-1)
    - [Manual Transaction](#manual-transaction-1)
    - [Transactions](#transactions-1)
    - [Dashboard](#dashboard-1)
    - [Insight](#insight-1)
  - [FEATURES](#features-1)
    - [Family Share](#family-share)
    - [Input](#input)

# PHASE 1

## PAGES

### Manual Transaction
- date, amount, item, note, category, type


### Transactions
  - list of transactions


### Dashboard
- Month (wip month view, week view, day view)



### Insight
- Yearly view
- Assets page
- Stock portfolio
- Liabilities

## FEATURES
### Tag

-----------------------------------------------------------

# PHASE 2

## PAGES

### Manual Transaction
- add +/-/*//
### Transactions
- Receipt 메타를 DB에 저장 
  - receipts 테이블 따로 만들기 (정석, 확장에 좋음)
  - receipts(id, transaction_id, uri, filename, created_at)
  - 나중에 한 transaction에 영수증 여러 장 가능
- Bulk add
  - add guest (멤버들)
  - Filter search

### Dashboard

### Insight
- Spending in calendar view


## FEATURES

### Family Share
- 가족 공유
  - 아이들이 자기만의 버젯 관리 할 수 있도록
  - 부모님 view only
  - 각 user마다 aggregated/individual 통계 등 가능
  - visibility

### Input
- type하면 apple calendar처럼 historically 있는 내용 auto rec
