import type { CategoryRef } from '@/domain/category'
import type { UUID } from '@/domain/common/uuid'

export type TransactionType = 'income' | 'expense' | 'transfer'

export type Money = Readonly<{
  amount: number
  currency: string
}>

type TransactionBase = Readonly<{
  id: UUID
  key: string
  occurredAt: Date
  type: TransactionType

  item?: string
  money: Money

  category?: CategoryRef
  merchant?: string
  note?: string
  tags?: string[] // tag names
  memberId?: UUID // null = shared/household
  isEstimated?: boolean // true = user marked amount as approximate
}>

export type IncomeExpenseTransaction = TransactionBase &
  Readonly<{
    type: 'income' | 'expense'
    accountId: UUID
    fromAccountId?: never
    toAccountId?: never
  }>

export type TransferTransaction = TransactionBase &
  Readonly<{
    type: 'transfer'
    accountId?: never
    fromAccountId: UUID
    toAccountId: UUID
  }>

export type Transaction = IncomeExpenseTransaction | TransferTransaction

export type AddTransactionInput =
  | {
      key?: string
      occurredAt?: Date
      type: 'income' | 'expense'
      item?: string
      amount: number
      accountId: UUID
      category?: CategoryRef
      merchant?: string
      note?: string
      tags?: string[]
      memberId?: UUID // null = shared/household
      isEstimated?: boolean
    }
  | {
      key?: string
      occurredAt?: Date
      type: 'transfer'
      item?: string
      amount: number
      fromAccountId: UUID
      toAccountId: UUID
      note?: string
      merchant?: string
      category?: CategoryRef
      tags?: string[]
      memberId?: UUID // null = shared/household
      isEstimated?: boolean
    }