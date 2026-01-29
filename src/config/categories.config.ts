import type { CategoryMeta, SubCategoryMeta } from '@/config/categories.types'
import type { CategoryType } from '@/domain/category'
import { PALETTE } from '@/theme'

// ===============================================================
// 1. CATEGORY META
// ===============================================================

const CATEGORY_META = {
  // -------------------------
  // EXPENSE
  // -------------------------
  housing: {
    name: 'Housing',
    icon: '🏡',
    color: PALETTE.orange[500],
    type: 'expense' as const satisfies CategoryType
  },
  food: {
    name: 'Food',
    icon: '🍽️',
    color: PALETTE.amber[400],
    type: 'expense' as const satisfies CategoryType
  },
  lifestyle: {
    name: 'Lifestyle',
    icon: '💅',
    color: PALETTE.pink[300],
    type: 'expense' as const satisfies CategoryType
  },
  health: {
    name: 'Health',
    icon: '🩺',
    color: PALETTE.red[400],
    type: 'expense' as const satisfies CategoryType
  },
  family: {
    name: 'Family & Children',
    icon: '🧸',
    color: PALETTE.yellow[400],
    type: 'expense' as const satisfies CategoryType
  },
  pets: {
    name: 'Pets',
    icon: '🐶',
    color: PALETTE.green[300],
    type: 'expense' as const satisfies CategoryType
  },
  social: {
    name: 'Social & Entertainment',
    icon: '🎉',
    color: PALETTE.purple[300],
    type: 'expense' as const satisfies CategoryType
  },
  gifts: {
    name: 'Gifts & Occasions',
    icon: '🎁',
    color: PALETTE.fuchsia[300],
    type: 'expense' as const satisfies CategoryType
  },
  transport: {
    name: 'Transportation',
    icon: '🚗',
    color: PALETTE.blue[400],
    type: 'expense' as const satisfies CategoryType
  },
  communication: {
    name: 'Communication',
    icon: '📱',
    color: PALETTE.teal[400],
    type: 'expense' as const satisfies CategoryType
  },
  subscriptions: {
    name: 'Subscriptions',
    icon: '📺',
    color: PALETTE.indigo[400],
    type: 'expense' as const satisfies CategoryType
  },
  travel: {
    name: 'Travel',
    icon: '🌍',
    color: PALETTE.blue[500],
    type: 'expense' as const satisfies CategoryType
  },
  insurance: {
    name: 'Insurance',
    icon: '🛡️',
    color: PALETTE.orange[400],
    type: 'expense' as const satisfies CategoryType
  },
  donations: {
    name: 'Donations',
    icon: '🙏',
    color: PALETTE.rose[400],
    type: 'expense' as const satisfies CategoryType
  },
  taxes: {
    name: 'Taxes',
    icon: '🧮',
    color: PALETTE.stone[500],
    type: 'expense' as const satisfies CategoryType
  },
  debt: {
    name: 'Debt & Loans',
    icon: '🧾',
    color: PALETTE.stone[400],
    type: 'expense' as const satisfies CategoryType
  },
  fees: {
    name: 'Fees & Charges',
    icon: '🏦',
    color: PALETTE.stone[300],
    type: 'expense' as const satisfies CategoryType
  },
  education: {
    name: 'Education',
    icon: '🎓',
    color: PALETTE.yellow[500],
    type: 'expense' as const satisfies CategoryType
  },
  business: {
    name: 'Business & Work',
    icon: '💼',
    color: PALETTE.slate[500],
    type: 'expense' as const satisfies CategoryType
  },

  // -------------------------
  // INCOME
  // -------------------------
  income: {
    name: 'Income',
    icon: '💵',
    color: PALETTE.green[600],
    type: 'income' as const satisfies CategoryType
  },

  // -------------------------
  // TRANSFER
  // -------------------------
  transfers: {
    name: 'Transfers',
    icon: '🔁',
    color: PALETTE.blue[600],
    type: 'transfer' as const satisfies CategoryType
  },
  savings: {
    name: 'Savings & Investment',
    icon: '💰',
    color: PALETTE.green[500],
    type: 'transfer' as const satisfies CategoryType
  }
} as const

// ===============================================================
// 2. SUBCATEGORIES
// ===============================================================

const SUBCATEGORIES: Record<string, SubCategoryMeta[]> = {
  // ---------------------------------------------------------------
  // Housing
  // ---------------------------------------------------------------
  housing: [
    { key: 'utilities', name: 'Utilities', icon: '💡', color: PALETTE.orange[400] },
    { key: 'hoa', name: 'HOA / Maintenance', icon: '🏢', color: PALETTE.orange[300] },
    { key: 'repairs', name: 'Repairs & Updates', icon: '🛠️', color: PALETTE.orange[600] },
    { key: 'home_insurance', name: 'Home Insurance', icon: '🛡️', color: PALETTE.orange[500] }
  ],

  // ---------------------------------------------------------------
  // Food
  // ---------------------------------------------------------------
  food: [
    { key: 'groceries', name: 'Groceries', icon: '🛒', color: PALETTE.amber[300] },
    { key: 'restaurants', name: 'Restaurants', icon: '🍽️', color: PALETTE.amber[400] },
    { key: 'coffee_snacks', name: 'Coffee / Snacks', icon: '☕', color: PALETTE.amber[200] }
  ],

  // ---------------------------------------------------------------
  // Lifestyle
  // ---------------------------------------------------------------
  lifestyle: [
    { key: 'home_items', name: 'Home Items', icon: '🧻', color: PALETTE.pink[200] },
    { key: 'clothes', name: 'Clothes & Accessories', icon: '👗', color: PALETTE.pink[300] },
    { key: 'beauty', name: 'Beauty / Hair / Nails', icon: '💅', color: PALETTE.pink[400] },
    { key: 'electronics', name: 'Electronics / Furniture', icon: '🛋️', color: PALETTE.pink[200] },
    { key: 'laundry', name: 'Laundry / Dry Cleaning', icon: '🧺', color: PALETTE.pink[200] },
    { key: 'misc', name: 'Miscellaneous', icon: '📦', color: PALETTE.pink[100] }
  ],

  // ---------------------------------------------------------------
  // Health
  // ---------------------------------------------------------------
  health: [
    { key: 'doctor', name: 'Doctor Visit', icon: '🩺', color: PALETTE.red[300] },
    { key: 'pharmacy', name: 'Pharmacy', icon: '💊', color: PALETTE.red[400] },
    { key: 'fitness', name: 'Fitness / Gym', icon: '🏋️‍♀️', color: PALETTE.red[300] },
    { key: 'supplements', name: 'Supplements', icon: '⚕️', color: PALETTE.red[200] },
    { key: 'therapy', name: 'Therapy / Mental Health', icon: '🧠', color: PALETTE.red[200] }
  ],

  // ---------------------------------------------------------------
  // Family & Children
  // ---------------------------------------------------------------
  family: [
    { key: 'childcare', name: 'Childcare / Nanny', icon: '🍼', color: PALETTE.yellow[400] },
    { key: 'kids_food', name: 'Kids Food & Drinks', icon: '🍲', color: PALETTE.yellow[400] },
    { key: 'necessities', name: 'Necessities', icon: '🧴', color: PALETTE.yellow[300] },
    { key: 'education', name: 'Books / Education', icon: '📚', color: PALETTE.yellow[500] },
    { key: 'kids_clothes', name: 'Kids Clothes', icon: '🧦', color: PALETTE.yellow[400] },
    { key: 'toys', name: 'Toys / Misc', icon: '🧸', color: PALETTE.yellow[300] }
  ],

  // ---------------------------------------------------------------
  // Pets
  // ---------------------------------------------------------------
  pets: [
    { key: 'pet_food', name: 'Pet Food', icon: '🍖', color: PALETTE.green[300] },
    { key: 'vet', name: 'Vet Visit', icon: '🐾', color: PALETTE.green[400] },
    { key: 'pet_supplies', name: 'Supplies (Clothes / Toys)', icon: '🦴', color: PALETTE.green[200] },
    { key: 'grooming', name: 'Grooming', icon: '✂️', color: PALETTE.green[200] },
    { key: 'pet_insurance', name: 'Pet Insurance', icon: '🛡️', color: PALETTE.green[300] }
  ],

  // ---------------------------------------------------------------
  // Social & Entertainment
  // ---------------------------------------------------------------
  social: [
    { key: 'friends', name: 'Friends Hangout', icon: '🫶', color: PALETTE.purple[200] },
    { key: 'date', name: 'Date / Fun', icon: '💑', color: PALETTE.purple[300] },
    { key: 'classes', name: 'Classes / Hobbies', icon: '🎨', color: PALETTE.purple[300] },
    { key: 'events', name: 'Events / Concerts', icon: '🎫', color: PALETTE.purple[400] }
  ],

  // ---------------------------------------------------------------
  // Gifts & Occasions
  // ---------------------------------------------------------------
  gifts: [
    { key: 'wedding', name: 'Wedding Gifts', icon: '💍', color: PALETTE.fuchsia[300] },
    { key: 'baby', name: 'Baby Gifts', icon: '🍼', color: PALETTE.fuchsia[200] },
    { key: 'birthday', name: 'Birthday / Holiday Gifts', icon: '🎉', color: PALETTE.fuchsia[400] },
    { key: 'cash_gift', name: 'Cash Gifts', icon: '💸', color: PALETTE.fuchsia[500] }
  ],

  // ---------------------------------------------------------------
  // Transportation
  // ---------------------------------------------------------------
  transport: [
    { key: 'public_transit', name: 'Public Transit', icon: '🚇', color: PALETTE.blue[300] },
    { key: 'taxi', name: 'Taxi / Rideshare', icon: '🚕', color: PALETTE.blue[400] },
    { key: 'parking', name: 'Parking', icon: '🅿️', color: PALETTE.blue[300] },
    { key: 'gas', name: 'Gas', icon: '⛽', color: PALETTE.blue[500] },
    { key: 'car_maintenance', name: 'Car Maintenance', icon: '🛠️', color: PALETTE.blue[200] }
  ],

  // ---------------------------------------------------------------
  // Communication
  // ---------------------------------------------------------------
  communication: [
    { key: 'internet', name: 'Internet', icon: '🌐', color: PALETTE.teal[300] },
    { key: 'mobile', name: 'Mobile', icon: '📱', color: PALETTE.teal[400] }
  ],

  // ---------------------------------------------------------------
  // Subscriptions
  // ---------------------------------------------------------------
  subscriptions: [
    { key: 'streaming_video', name: 'Streaming Video', icon: '📺', color: PALETTE.indigo[300] },
    { key: 'music_audio', name: 'Music / Audio', icon: '🎧', color: PALETTE.indigo[400] },
    { key: 'cloud_storage', name: 'Cloud Storage', icon: '☁️', color: PALETTE.indigo[300] },
    { key: 'apps_tools', name: 'Apps / Tools', icon: '🛠️', color: PALETTE.indigo[400] },
    { key: 'other_subscriptions', name: 'Other Subscriptions', icon: '📦', color: PALETTE.indigo[200] }
  ],

  // ---------------------------------------------------------------
  // Travel
  // ---------------------------------------------------------------
  travel: [
    { key: 'flights', name: 'Flights', icon: '✈️', color: PALETTE.blue[500] },
    { key: 'lodging', name: 'Lodging / Hotel', icon: '🏨', color: PALETTE.blue[400] },
    { key: 'activities', name: 'Activities', icon: '🎒', color: PALETTE.blue[300] },
    { key: 'travel_transport', name: 'Local Transport', icon: '🚌', color: PALETTE.blue[300] }
  ],

  // ---------------------------------------------------------------
  // Insurance
  // ---------------------------------------------------------------
  insurance: [
    { key: 'home_insurance', name: 'Home Insurance', icon: '🏠', color: PALETTE.orange[400] },
    { key: 'health_insurance', name: 'Health Insurance', icon: '🩺', color: PALETTE.red[300] },
    { key: 'life_insurance', name: 'Life Insurance', icon: '❤️', color: PALETTE.red[400] },
    { key: 'pet_insurance', name: 'Pet Insurance', icon: '🐾', color: PALETTE.green[400] },
    { key: 'auto_insurance', name: 'Auto Insurance', icon: '🚘', color: PALETTE.blue[300] }
  ],

  // ---------------------------------------------------------------
  // Donations
  // ---------------------------------------------------------------
  donations: [
    { key: 'general', name: 'General Donations', icon: '🙏', color: PALETTE.rose[300] },
    { key: 'religious', name: 'Religious / Nonprofit', icon: '⛪', color: PALETTE.rose[400] },
    { key: 'fundraiser', name: 'Fundraisers', icon: '🎗️', color: PALETTE.rose[500] }
  ],

  // ---------------------------------------------------------------
  // Taxes (canonical home for property_tax)
  // ---------------------------------------------------------------
  taxes: [
    { key: 'federal', name: 'Federal Tax', icon: '🇺🇸', color: PALETTE.stone?.[500] ?? PALETTE.indigo[500] },
    { key: 'state_local', name: 'State / Local Tax', icon: '🏛️', color: PALETTE.stone?.[400] ?? PALETTE.indigo[400] },
    { key: 'property_tax', name: 'Property Tax', icon: '🏠', color: PALETTE.stone?.[300] ?? PALETTE.indigo[300] },
    { key: 'estimated', name: 'Estimated Tax', icon: '🧾', color: PALETTE.stone?.[400] ?? PALETTE.indigo[400] }
  ],

  // ---------------------------------------------------------------
  // Debt & Loans
  // Notes for your liabilities tracking
  // - Interest is expense
  // - Principal payments should be transfer between asset and liability accounts
  // ---------------------------------------------------------------
  debt: [
    { key: 'loan_interest', name: 'Loan Interest', icon: '🧾', color: PALETTE.stone?.[400] ?? PALETTE.indigo[400] },
    { key: 'credit_card_interest', name: 'Credit Card Interest', icon: '💳', color: PALETTE.stone?.[400] ?? PALETTE.indigo[400] },
    { key: 'student_loan_interest', name: 'Student Loan Interest', icon: '🎓', color: PALETTE.stone?.[300] ?? PALETTE.indigo[300] }
  ],

  // ---------------------------------------------------------------
  // Fees & Charges
  // ---------------------------------------------------------------
  fees: [
    { key: 'bank_fees', name: 'Bank Fees', icon: '🏦', color: PALETTE.stone?.[300] ?? PALETTE.indigo[300] },
    { key: 'atm_fees', name: 'ATM Fees', icon: '🏧', color: PALETTE.stone?.[300] ?? PALETTE.indigo[300] },
    { key: 'late_fees', name: 'Late Fees', icon: '⏰', color: PALETTE.stone?.[400] ?? PALETTE.indigo[400] },
    { key: 'brokerage_fees', name: 'Brokerage Fees', icon: '📊', color: PALETTE.stone?.[300] ?? PALETTE.indigo[300] }
  ],

  // ---------------------------------------------------------------
  // Education
  // ---------------------------------------------------------------
  education: [
    { key: 'tuition', name: 'Tuition', icon: '🏫', color: PALETTE.yellow[500] },
    { key: 'courses', name: 'Courses / Certifications', icon: '🧑‍💻', color: PALETTE.yellow[400] },
    { key: 'books', name: 'Books', icon: '📚', color: PALETTE.yellow[300] }
  ],

  // ---------------------------------------------------------------
  // Business & Work
  // ---------------------------------------------------------------
  business: [
    { key: 'work_meals', name: 'Work Meals', icon: '🥗', color: PALETTE.slate?.[400] ?? PALETTE.indigo[400] },
    { key: 'work_travel', name: 'Work Travel', icon: '🧳', color: PALETTE.slate?.[500] ?? PALETTE.indigo[500] },
    { key: 'software_tools', name: 'Software / Tools', icon: '🧰', color: PALETTE.slate?.[300] ?? PALETTE.indigo[300] },
    { key: 'office_supplies', name: 'Office Supplies', icon: '📎', color: PALETTE.slate?.[300] ?? PALETTE.indigo[300] }
  ],

  // ---------------------------------------------------------------
  // Income (two earners + stocks + rentals)
  // ---------------------------------------------------------------
  income: [
    { key: 'salary', name: 'Salary / Wages', icon: '🧾', color: PALETTE.green[600] },
    { key: 'bonus', name: 'Bonus', icon: '🎯', color: PALETTE.green[500] },
    { key: 'cash_gift', name: 'Cash Gift', icon: '🎁', color: PALETTE.green[400] },
    { key: 'equity_vesting', name: 'Equity Vesting (RSU/Stock)', icon: '📦', color: PALETTE.green[500] },
    { key: 'capital_gains', name: 'Capital Gains (Stock Sale)', icon: '📈', color: PALETTE.green[600] },
    { key: 'dividends', name: 'Dividends', icon: '🪙', color: PALETTE.green[500] },
    { key: 'interest', name: 'Interest', icon: '🏦', color: PALETTE.green[400] },
    { key: 'rental_income', name: 'Rental Income', icon: '🏠', color: PALETTE.green[600] },
    { key: 'side_hustle', name: 'Side Hustle / Freelance', icon: '🧑‍🍳', color: PALETTE.green[500] },
    { key: 'reimbursement', name: 'Reimbursement / Refund', icon: '🔄', color: PALETTE.green[400] },
    { key: 'tax_refund', name: 'Tax Refund', icon: '📬', color: PALETTE.green[400] },
    { key: 'other_income', name: 'Other Income', icon: '📥', color: PALETTE.green[300] }
  ],

  // ---------------------------------------------------------------
  // Transfers (required base set)
  // For balances + liabilities tracking
  // - between_accounts: asset -> asset
  // - credit_card_payment: asset -> liability (reduces liability)
  // - cash_withdrawal: asset -> cash account
  // - cash_deposit: cash account -> asset
  // ---------------------------------------------------------------
  transfers: [
    { key: 'between_accounts', name: 'Between Accounts', icon: '🔁', color: PALETTE.blue[600] },
    { key: 'credit_card_payment', name: 'Credit Card Payment', icon: '💳', color: PALETTE.blue[500] },
    { key: 'cash_withdrawal', name: 'Cash Withdrawal', icon: '🏧', color: PALETTE.blue[400] },
    { key: 'cash_deposit', name: 'Cash Deposit', icon: '💵', color: PALETTE.blue[400] }
  ],

  // ---------------------------------------------------------------
  // Savings & Investment (transfer)
  // Keep as transfer if you are not tracking lots/positions in-app
  // If you later track holdings, you can evolve into an investment ledger
  // ---------------------------------------------------------------
  savings: [
    { key: 'monthly_savings', name: 'Monthly Savings', icon: '💰', color: PALETTE.green[500] },
    { key: 'emergency', name: 'Emergency Fund', icon: '🚨', color: PALETTE.green[300] },
    { key: 'brokerage_transfer', name: 'Brokerage Transfer', icon: '📈', color: PALETTE.green[600] },
    { key: 'retirement_401k', name: '401K Contribution', icon: '🏦', color: PALETTE.green[400] },
    { key: 'retirement_ira', name: 'IRA Contribution', icon: '🏛️', color: PALETTE.green[400] },
    { key: 'hsa', name: 'HSA Contribution', icon: '🩺', color: PALETTE.green[300] },
    { key: 'college_529', name: '529 / Education Savings', icon: '🎓', color: PALETTE.green[300] },
    { key: 'crypto_transfer', name: 'Crypto Transfer', icon: '🪙', color: PALETTE.green[500] },
    { key: 'real_estate_invest', name: 'Real Estate Investing', icon: '🏘️', color: PALETTE.green[500] }
  ]
} as const

// ===============================================================
// 3. EXPORT
// ===============================================================

export const CATEGORIES: CategoryMeta[] = Object.entries(CATEGORY_META).map(([key, meta]) => ({
  key,
  name: meta.name,
  icon: meta.icon,
  color: meta.color,
  type: meta.type,
  subCategories: SUBCATEGORIES[key] ?? []
}))

// Example category object:
// {
//   key: 'housing',
//   name: 'Housing',
//   icon: '🏡',
//   color: '#F59E0B',
//   type: 'expense',
//   subCategories: ['property_tax', 'utilities', 'hoa', 'repairs', 'home_insurance']
// }