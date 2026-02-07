import type { CategoryMeta, SubCategoryMeta } from '@/config/categories.types'
import type { CategoryType } from '@/domain/category'

// ===============================================================
// 1. CATEGORY META
// ===============================================================

// ===============================================================
// Distinct Categorical Palette (Option B)
// Maximum differentiation with distinct hues per category
// ===============================================================

const CATEGORY_META = {
  // -------------------------
  // EXPENSE (Distinct hues)
  // -------------------------
  housing: {
    name: 'Housing',
    icon: 'home',
    color: '#d4a373',  // terracotta
    type: 'expense' as const satisfies CategoryType
  },
  food: {
    name: 'Food',
    icon: 'cutlery',
    color: '#e9c46a',  // honey gold
    type: 'expense' as const satisfies CategoryType
  },
  lifestyle: {
    name: 'Lifestyle',
    icon: 'star',
    color: '#e76f51',  // burnt sienna
    type: 'expense' as const satisfies CategoryType
  },
  health: {
    name: 'Health',
    icon: 'heartbeat',
    color: '#f4a261',  // apricot
    type: 'expense' as const satisfies CategoryType
  },
  family: {
    name: 'Family & Children',
    icon: 'child',
    color: '#dda15e',  // amber
    type: 'expense' as const satisfies CategoryType
  },
  pets: {
    name: 'Pets',
    icon: 'paw',
    color: '#606c38',  // olive green
    type: 'expense' as const satisfies CategoryType
  },
  social: {
    name: 'Social & Entertainment',
    icon: 'users',
    color: '#9b5de5',  // violet
    type: 'expense' as const satisfies CategoryType
  },
  gifts: {
    name: 'Gifts & Occasions',
    icon: 'gift',
    color: '#f72585',  // magenta pink
    type: 'expense' as const satisfies CategoryType
  },
  transport: {
    name: 'Transportation',
    icon: 'car',
    color: '#2a9d8f',  // teal
    type: 'expense' as const satisfies CategoryType
  },
  communication: {
    name: 'Communication',
    icon: 'mobile',
    color: '#00b4d8',  // cyan
    type: 'expense' as const satisfies CategoryType
  },
  subscriptions: {
    name: 'Subscriptions',
    icon: 'television',
    color: '#457b9d',  // steel blue
    type: 'expense' as const satisfies CategoryType
  },
  travel: {
    name: 'Travel',
    icon: 'plane',
    color: '#3a86ff',  // bright blue
    type: 'expense' as const satisfies CategoryType
  },
  insurance: {
    name: 'Insurance',
    icon: 'shield',
    color: '#8d99ae',  // cool gray
    type: 'expense' as const satisfies CategoryType
  },
  donations: {
    name: 'Donations',
    icon: 'heart',
    color: '#e63946',  // coral red
    type: 'expense' as const satisfies CategoryType
  },
  taxes: {
    name: 'Taxes',
    icon: 'calculator',
    color: '#6c757d',  // neutral gray
    type: 'expense' as const satisfies CategoryType
  },
  debt: {
    name: 'Debt & Loans',
    icon: 'file-text',
    color: '#adb5bd',  // light gray
    type: 'expense' as const satisfies CategoryType
  },
  fees: {
    name: 'Fees & Charges',
    icon: 'bank',
    color: '#868e96',  // medium gray
    type: 'expense' as const satisfies CategoryType
  },
  education: {
    name: 'Education',
    icon: 'graduation-cap',
    color: '#ffd166',  // bright yellow
    type: 'expense' as const satisfies CategoryType
  },
  business: {
    name: 'Business & Work',
    icon: 'briefcase',
    color: '#495057',  // dark gray
    type: 'expense' as const satisfies CategoryType
  },

  // -------------------------
  // INCOME (Emerald green)
  // -------------------------
  income: {
    name: 'Income',
    icon: 'dollar',
    color: '#52b788',  // emerald
    type: 'income' as const satisfies CategoryType
  },

  // -------------------------
  // TRANSFER (Blue tones)
  // -------------------------
  transfers: {
    name: 'Transfers',
    icon: 'exchange',
    color: '#4895ef',  // sky blue
    type: 'transfer' as const satisfies CategoryType
  },
  savings: {
    name: 'Savings & Investment',
    icon: 'money',
    color: '#40916c',  // forest green
    type: 'transfer' as const satisfies CategoryType
  }
} as const

// ===============================================================
// 2. SUBCATEGORIES
// ===============================================================

const SUBCATEGORIES: Record<string, SubCategoryMeta[]> = {
  // ---------------------------------------------------------------
  // Housing (terracotta family)
  // ---------------------------------------------------------------
  housing: [
    { key: 'utilities', name: 'Utilities', icon: 'lightbulb-o', color: '#c9956a' },
    { key: 'hoa', name: 'HOA / Maintenance', icon: 'building', color: '#deb68a' },
    { key: 'repairs', name: 'Repairs & Updates', icon: 'wrench', color: '#bf8a5c' },
    { key: 'home_insurance', name: 'Home Insurance', icon: 'shield', color: '#d4a373' }
  ],

  // ---------------------------------------------------------------
  // Food (honey gold family)
  // ---------------------------------------------------------------
  food: [
    { key: 'groceries', name: 'Groceries', icon: 'shopping-cart', color: '#f0d080' },
    { key: 'restaurants', name: 'Restaurants', icon: 'cutlery', color: '#e9c46a' },
    { key: 'coffee_snacks', name: 'Coffee / Snacks', icon: 'coffee', color: '#d4b35a' }
  ],

  // ---------------------------------------------------------------
  // Lifestyle (burnt sienna family)
  // ---------------------------------------------------------------
  lifestyle: [
    { key: 'home_items', name: 'Home Items', icon: 'shopping-bag', color: '#ed8a70' },
    { key: 'clothes', name: 'Clothes & Accessories', icon: 'shopping-bag', color: '#e76f51' },
    { key: 'beauty', name: 'Beauty / Hair / Nails', icon: 'star', color: '#d4604a' },
    { key: 'electronics', name: 'Electronics / Furniture', icon: 'laptop', color: '#c75540' },
    { key: 'laundry', name: 'Laundry / Dry Cleaning', icon: 'tint', color: '#f09580' },
    { key: 'misc', name: 'Miscellaneous', icon: 'cube', color: '#e07a60' }
  ],

  // ---------------------------------------------------------------
  // Health (apricot family)
  // ---------------------------------------------------------------
  health: [
    { key: 'doctor', name: 'Doctor Visit', icon: 'user-md', color: '#f7b580' },
    { key: 'pharmacy', name: 'Pharmacy', icon: 'medkit', color: '#f4a261' },
    { key: 'fitness', name: 'Fitness / Gym', icon: 'heartbeat', color: '#e08f50' },
    { key: 'supplements', name: 'Supplements', icon: 'plus-square', color: '#f9c090' },
    { key: 'therapy', name: 'Therapy / Mental Health', icon: 'comments', color: '#e69860' }
  ],

  // ---------------------------------------------------------------
  // Family & Children (amber family)
  // ---------------------------------------------------------------
  family: [
    { key: 'childcare', name: 'Childcare / Nanny', icon: 'child', color: '#e8b070' },
    { key: 'kids_food', name: 'Kids Food & Drinks', icon: 'spoon', color: '#dda15e' },
    { key: 'necessities', name: 'Necessities', icon: 'shopping-basket', color: '#c99050' },
    { key: 'education', name: 'Books / Education', icon: 'book', color: '#d09858' },
    { key: 'kids_clothes', name: 'Kids Clothes', icon: 'shopping-bag', color: '#e5a868' },
    { key: 'toys', name: 'Toys / Misc', icon: 'gamepad', color: '#f0c080' }
  ],

  // ---------------------------------------------------------------
  // Pets (olive green family)
  // ---------------------------------------------------------------
  pets: [
    { key: 'pet_food', name: 'Pet Food', icon: 'cutlery', color: '#7a8548' },
    { key: 'vet', name: 'Vet Visit', icon: 'paw', color: '#606c38' },
    { key: 'pet_supplies', name: 'Supplies (Clothes / Toys)', icon: 'paw', color: '#8a9a50' },
    { key: 'grooming', name: 'Grooming', icon: 'scissors', color: '#9aaa60' },
    { key: 'pet_insurance', name: 'Pet Insurance', icon: 'shield', color: '#707a40' }
  ],

  // ---------------------------------------------------------------
  // Social & Entertainment (violet family)
  // ---------------------------------------------------------------
  social: [
    { key: 'friends', name: 'Friends Hangout', icon: 'users', color: '#b080f0' },
    { key: 'date', name: 'Date / Fun', icon: 'heart', color: '#9b5de5' },
    { key: 'classes', name: 'Classes / Hobbies', icon: 'paint-brush', color: '#8a4dd5' },
    { key: 'events', name: 'Events / Concerts', icon: 'ticket', color: '#7a3dc5' }
  ],

  // ---------------------------------------------------------------
  // Gifts & Occasions (magenta pink family)
  // ---------------------------------------------------------------
  gifts: [
    { key: 'wedding', name: 'Wedding Gifts', icon: 'diamond', color: '#f85090' },
    { key: 'baby', name: 'Baby Gifts', icon: 'child', color: '#fa70a0' },
    { key: 'birthday', name: 'Birthday / Holiday Gifts', icon: 'birthday-cake', color: '#f72585' },
    { key: 'cash_gift', name: 'Cash Gifts', icon: 'money', color: '#e01575' }
  ],

  // ---------------------------------------------------------------
  // Transportation (teal family)
  // ---------------------------------------------------------------
  transport: [
    { key: 'public_transit', name: 'Public Transit', icon: 'subway', color: '#40b0a0' },
    { key: 'taxi', name: 'Taxi / Rideshare', icon: 'taxi', color: '#2a9d8f' },
    { key: 'parking', name: 'Parking', icon: 'product-hunt', color: '#50c0b0' },
    { key: 'gas', name: 'Gas', icon: 'tint', color: '#208878' },
    { key: 'car_maintenance', name: 'Car Maintenance', icon: 'wrench', color: '#35a595' }
  ],

  // ---------------------------------------------------------------
  // Communication (cyan family)
  // ---------------------------------------------------------------
  communication: [
    { key: 'internet', name: 'Internet', icon: 'wifi', color: '#20c8e8' },
    { key: 'mobile', name: 'Mobile', icon: 'mobile', color: '#00b4d8' }
  ],

  // ---------------------------------------------------------------
  // Subscriptions (steel blue family)
  // ---------------------------------------------------------------
  subscriptions: [
    { key: 'streaming_video', name: 'Streaming Video', icon: 'television', color: '#5890b0' },
    { key: 'music_audio', name: 'Music / Audio', icon: 'headphones', color: '#457b9d' },
    { key: 'cloud_storage', name: 'Cloud Storage', icon: 'cloud', color: '#68a0c0' },
    { key: 'apps_tools', name: 'Apps / Tools', icon: 'wrench', color: '#3a6a8a' },
    { key: 'other_subscriptions', name: 'Other Subscriptions', icon: 'cube', color: '#78b0d0' }
  ],

  // ---------------------------------------------------------------
  // Travel (bright blue family)
  // ---------------------------------------------------------------
  travel: [
    { key: 'flights', name: 'Flights', icon: 'plane', color: '#3a86ff' },
    { key: 'lodging', name: 'Lodging / Hotel', icon: 'bed', color: '#5a9aff' },
    { key: 'activities', name: 'Activities', icon: 'map', color: '#7ab0ff' },
    { key: 'travel_transport', name: 'Local Transport', icon: 'bus', color: '#2070e0' }
  ],

  // ---------------------------------------------------------------
  // Insurance (cool gray family)
  // ---------------------------------------------------------------
  insurance: [
    { key: 'home_insurance', name: 'Home Insurance', icon: 'home', color: '#9aa5b5' },
    { key: 'health_insurance', name: 'Health Insurance', icon: 'heartbeat', color: '#8d99ae' },
    { key: 'life_insurance', name: 'Life Insurance', icon: 'heart', color: '#7a8595' },
    { key: 'pet_insurance', name: 'Pet Insurance', icon: 'paw', color: '#a0abbe' },
    { key: 'auto_insurance', name: 'Auto Insurance', icon: 'car', color: '#808a9a' }
  ],

  // ---------------------------------------------------------------
  // Donations (coral red family)
  // ---------------------------------------------------------------
  donations: [
    { key: 'general', name: 'General Donations', icon: 'heart', color: '#f05060' },
    { key: 'religious', name: 'Religious / Nonprofit', icon: 'university', color: '#e63946' },
    { key: 'fundraiser', name: 'Fundraisers', icon: 'flag', color: '#d02838' }
  ],

  // ---------------------------------------------------------------
  // Taxes (neutral gray family)
  // ---------------------------------------------------------------
  taxes: [
    { key: 'federal', name: 'Federal Tax', icon: 'flag', color: '#5c636a' },
    { key: 'state_local', name: 'State / Local Tax', icon: 'university', color: '#6c757d' },
    { key: 'property_tax', name: 'Property Tax', icon: 'home', color: '#7c858d' },
    { key: 'estimated', name: 'Estimated Tax', icon: 'file-text', color: '#8c959d' }
  ],

  // ---------------------------------------------------------------
  // Debt & Loans (light gray family)
  // ---------------------------------------------------------------
  debt: [
    { key: 'loan_interest', name: 'Loan Interest', icon: 'file-text', color: '#bdc5cd' },
    { key: 'credit_card_interest', name: 'Credit Card Interest', icon: 'credit-card', color: '#adb5bd' },
    { key: 'student_loan_interest', name: 'Student Loan Interest', icon: 'graduation-cap', color: '#cdd5dd' }
  ],

  // ---------------------------------------------------------------
  // Fees & Charges (medium gray family)
  // ---------------------------------------------------------------
  fees: [
    { key: 'bank_fees', name: 'Bank Fees', icon: 'bank', color: '#969ea6' },
    { key: 'atm_fees', name: 'ATM Fees', icon: 'credit-card', color: '#868e96' },
    { key: 'late_fees', name: 'Late Fees', icon: 'clock-o', color: '#767e86' },
    { key: 'brokerage_fees', name: 'Brokerage Fees', icon: 'line-chart', color: '#a6aeb6' }
  ],

  // ---------------------------------------------------------------
  // Education (bright yellow family)
  // ---------------------------------------------------------------
  education: [
    { key: 'tuition', name: 'Tuition', icon: 'university', color: '#ffe080' },
    { key: 'courses', name: 'Courses / Certifications', icon: 'laptop', color: '#ffd166' },
    { key: 'books', name: 'Books', icon: 'book', color: '#eec050' }
  ],

  // ---------------------------------------------------------------
  // Business & Work (dark gray family)
  // ---------------------------------------------------------------
  business: [
    { key: 'work_meals', name: 'Work Meals', icon: 'cutlery', color: '#5a6268' },
    { key: 'work_travel', name: 'Work Travel', icon: 'suitcase', color: '#495057' },
    { key: 'software_tools', name: 'Software / Tools', icon: 'wrench', color: '#6a7078' },
    { key: 'office_supplies', name: 'Office Supplies', icon: 'paperclip', color: '#3a4048' }
  ],

  // ---------------------------------------------------------------
  // Income (emerald green family)
  // ---------------------------------------------------------------
  income: [
    { key: 'salary', name: 'Salary / Wages', icon: 'file-text', color: '#52b788' },
    { key: 'bonus', name: 'Bonus', icon: 'bullseye', color: '#62c798' },
    { key: 'cash_gift', name: 'Cash Gift', icon: 'gift', color: '#72d7a8' },
    { key: 'equity_vesting', name: 'Equity Vesting (RSU/Stock)', icon: 'cube', color: '#42a778' },
    { key: 'capital_gains', name: 'Capital Gains (Stock Sale)', icon: 'line-chart', color: '#329768' },
    { key: 'dividends', name: 'Dividends', icon: 'money', color: '#52b788' },
    { key: 'interest', name: 'Interest', icon: 'bank', color: '#62c798' },
    { key: 'rental_income', name: 'Rental Income', icon: 'home', color: '#42a778' },
    { key: 'side_hustle', name: 'Side Hustle / Freelance', icon: 'briefcase', color: '#329768' },
    { key: 'reimbursement', name: 'Reimbursement / Refund', icon: 'refresh', color: '#72d7a8' },
    { key: 'tax_refund', name: 'Tax Refund', icon: 'envelope', color: '#62c798' },
    { key: 'other_income', name: 'Other Income', icon: 'inbox', color: '#82e7b8' }
  ],

  // ---------------------------------------------------------------
  // Transfers (sky blue family)
  // ---------------------------------------------------------------
  transfers: [
    { key: 'between_accounts', name: 'Between Accounts', icon: 'exchange', color: '#58a5f0' },
    { key: 'credit_card_payment', name: 'Credit Card Payment', icon: 'credit-card', color: '#4895ef' },
    { key: 'cash_withdrawal', name: 'Cash Withdrawal', icon: 'credit-card', color: '#3885df' },
    { key: 'cash_deposit', name: 'Cash Deposit', icon: 'dollar', color: '#68b5ff' }
  ],

  // ---------------------------------------------------------------
  // Savings & Investment (forest green family)
  // ---------------------------------------------------------------
  savings: [
    { key: 'monthly_savings', name: 'Monthly Savings', icon: 'money', color: '#50a17c' },
    { key: 'emergency', name: 'Emergency Fund', icon: 'exclamation-triangle', color: '#60b18c' },
    { key: 'brokerage_transfer', name: 'Brokerage Transfer', icon: 'line-chart', color: '#40916c' },
    { key: 'retirement_401k', name: '401K Contribution', icon: 'bank', color: '#30815c' },
    { key: 'retirement_ira', name: 'IRA Contribution', icon: 'university', color: '#20714c' },
    { key: 'hsa', name: 'HSA Contribution', icon: 'heartbeat', color: '#50a17c' },
    { key: 'college_529', name: '529 / Education Savings', icon: 'graduation-cap', color: '#60b18c' },
    { key: 'crypto_transfer', name: 'Crypto Transfer', icon: 'bitcoin', color: '#40916c' },
    { key: 'real_estate_invest', name: 'Real Estate Investing', icon: 'home', color: '#30815c' }
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