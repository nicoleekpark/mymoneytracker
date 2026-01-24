export type FixtureAccount = {
  key: string
  name: string
  kind: 'cash' | 'checking' | 'savings' | 'credit_card' | 'loan' | 'investment' | 'other'
  nature: 'asset' | 'liability'
  currency?: string
  sortOrder?: number
}

export type FixtureTransaction = {
  key: string
  occurredAt: string // ISO

  type: 'expense' | 'income' | 'transfer'
  item: string

  amountCents: number
  currency?: string

  // expense/income
  accountKey?: string

  // transfer
  fromAccountKey?: string
  toAccountKey?: string

  // optional
  categoryKey?: string
  merchant?: string
  note?: string
}

export type SeedAccountsFile = {
  accounts: FixtureAccount[]
}

export type SeedTransactionsFile = {
  transactions: FixtureTransaction[]
}
