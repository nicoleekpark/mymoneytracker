# Transactions Folder Structure Refactoring
 
## Result

┌──────────────────────────┬─────────┬──────────────────┐                                                                                                                      
│           file           │  before │       after       │                                                                                                                      
├──────────────────────────┼─────────┼──────────────────┤                                                                                                                      
│ AddTransactionScreen.tsx │ 1,211         590
                                │ (51% decrease)   │                    
└──────────────────────────┴─────────┴──────────────────┘                                                                                                    
#### Hooks:                                  
┌──────────────────────┬───────┬────────────────────────────┐                                                                                                                  
│         file         │ lines │            role            │                                                                                                                  
├──────────────────────┼───────┼────────────────────────────┤                                                                                                                  
│ useAmountKeypad.ts   │ 83    │ 금액 입력 상태 + 핸들러    │                                                                                                                  
├──────────────────────┼───────┼────────────────────────────┤                                                                                                                  
│ useAccountPicker.ts  │ 76    │ 계좌 선택 + 검색           │                                                                                                                  
├──────────────────────┼───────┼────────────────────────────┤                                                                                                                  
│ useCategoryPicker.ts │ 231   │ 카테고리/서브카테고리 선택 │                                                                                                                  
└──────────────────────┴───────┴────────────────────────────┘                                                                                                                  
#### Components:                                    
┌───────────────────────────────┬───────┬────────────────────────┐                                                                                                             
│             file              │ lines │          role          │                                                                                                             
├───────────────────────────────┼───────┼────────────────────────┤                                                                                                             
│ AmountKeypadModal.tsx         │ 135   │ 금액 키패드 모달       │                                                                                                             
├───────────────────────────────┼───────┼────────────────────────┤                                                                                                             
│ AccountSelectionModal.tsx     │ 142   │ 계좌 선택 모달         │                                                                                                             
├───────────────────────────────┼───────┼────────────────────────┤                                                                                                             
│ CategorySelectionModal.tsx    │ 149   │ 카테고리 선택 모달     │                                                                                                             
├───────────────────────────────┼───────┼────────────────────────┤                                                                                                             
│ SubCategorySelectionModal.tsx │ 141   │ 서브카테고리 선택 모달 │                                                                                                             
└───────────────────────────────┴───────┴────────────────────────┘                                                                           

#### Improvements

- 관심사 분리: 메인 화면은 폼 레이아웃만, 복잡한 로직은 hooks로
- 재사용성: 추출된 모달/hooks는 다른 화면에서 재사용 가능
- 테스트 용이성: hooks는 독립적으로 테스트 가능
- 유지보수성: 각 file이 한 가지 role만 담당

## Final Structure                      
  features/transactions/                                                                                                                                                         
  ├── AddTransactionScreen.tsx     (590 , main form)
  ├── TransactionsScreen.tsx       (524)   
  ├── components/                                                                                                                                                                
  │   ├── index.ts                      
  │   ├── AmountKeypadModal.tsx          
  │   ├── AccountSelectionModal.tsx      
  │   ├── CategorySelectionModal.tsx     
  │   └── SubCategorySelectionModal.tsx  
  └── hooks/                                                                                                                                                                     
      ├── index.ts                          
      ├── useTransactionsData.ts            
      ├── useAmountKeypad.ts                
      ├── useAccountPicker.ts               
      └── useCategoryPicker.ts      