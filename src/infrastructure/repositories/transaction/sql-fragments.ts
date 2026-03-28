/**
 * Reusable SQL fragments for transaction queries.
 * Centralizes common query patterns to reduce duplication.
 */

/**
 * Base SELECT columns for transaction queries with tags.
 * Uses LEFT JOIN with GROUP_CONCAT to get all tags in one query.
 */
export const SELECT_WITH_TAGS = `
  SELECT
    t.id, t.key, t.occurred_at, t.type, t.item, t.amount_cents, t.currency,
    t.account_id, t.category_id, t.merchant, t.note,
    t.from_account_id, t.to_account_id, t.member_id, t.is_estimated,
    GROUP_CONCAT(tags.name) as tag_names
  FROM transactions t
  LEFT JOIN transaction_tags tt ON t.id = tt.transaction_id
  LEFT JOIN tags ON tt.tag_id = tags.id
`

/**
 * Insert statement for new transactions.
 */
export const INSERT_TRANSACTION = `
  INSERT INTO transactions (
    id, key, occurred_at, type, item,
    amount_cents, currency,
    account_id, from_account_id, to_account_id,
    category_id, merchant, note, is_estimated,
    created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`

/**
 * Update statement for existing transactions.
 */
export const UPDATE_TRANSACTION = `
  UPDATE transactions SET
    occurred_at = ?,
    type = ?,
    item = ?,
    amount_cents = ?,
    currency = ?,
    account_id = ?,
    from_account_id = ?,
    to_account_id = ?,
    category_id = ?,
    merchant = ?,
    note = ?,
    is_estimated = ?,
    updated_at = ?
  WHERE id = ?
`

/**
 * Account activity aggregation query.
 * Groups transactions by account and calculates totals.
 */
export const ACCOUNT_ACTIVITY_SELECT = `
  SELECT
    account_id,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END), 0) AS expense_cents,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END), 0) AS income_cents,
    COALESCE(SUM(CASE WHEN type = 'transfer' AND from_account_id = account_id THEN amount_cents ELSE 0 END), 0) AS transfer_out_cents,
    COALESCE(SUM(CASE WHEN type = 'transfer' AND to_account_id = account_id THEN amount_cents ELSE 0 END), 0) AS transfer_in_cents,
    COUNT(*) AS tx_count
  FROM transactions
  WHERE account_id IS NOT NULL
`

/**
 * Account balance calculation query.
 * Returns income, expense, and transfer totals for balance calculation.
 */
export const accountBalanceQuery = (accountId: string, dateCondition: string) => `
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END), 0) AS income_cents,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END), 0) AS expense_cents,
    COALESCE(SUM(CASE WHEN type = 'transfer' AND to_account_id = ? THEN amount_cents ELSE 0 END), 0) AS transfer_in_cents,
    COALESCE(SUM(CASE WHEN type = 'transfer' AND from_account_id = ? THEN amount_cents ELSE 0 END), 0) AS transfer_out_cents
  FROM transactions
  WHERE account_id = ?
    AND ${dateCondition};
`
