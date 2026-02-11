import type { CategoryMeta, SubCategoryMeta } from '@/config/categories.types'
import type { CategoryType } from '@/domain/category'

// ===============================================================
// 1. CATEGORY META
// ===============================================================

// ===============================================================
// Neon Palette for Pitch Black Theme
// Bright, saturated colors optimized for dark backgrounds
// ===============================================================

const CATEGORY_META = {
  // -------------------------
  // EXPENSE (Neon hues)
  // -------------------------
  housing: {
    name: 'Housing',
    icon: 'home',
    color: '#ff9f43',  // neon orange
    type: 'expense' as const satisfies CategoryType,
    isFixed: true  // rent, mortgage, HOA
  },
  food: {
    name: 'Food',
    icon: 'cutlery',
    color: '#feca57',  // neon yellow
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  lifestyle: {
    name: 'Lifestyle',
    icon: 'star',
    color: '#ff6b6b',  // neon coral
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  health: {
    name: 'Health',
    icon: 'heartbeat',
    color: '#ff9ff3',  // neon pink
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  family: {
    name: 'Family & Children',
    icon: 'child',
    color: '#ffeaa7',  // soft neon yellow
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  pets: {
    name: 'Pets',
    icon: 'paw',
    color: '#55efc4',  // neon mint green
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  social: {
    name: 'Social & Entertainment',
    icon: 'users',
    color: '#a29bfe',  // neon lavender
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  gifts: {
    name: 'Gifts & Occasions',
    icon: 'gift',
    color: '#fd79a8',  // neon magenta
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  transport: {
    name: 'Transportation',
    icon: 'car',
    color: '#00d2d3',  // neon teal
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  communication: {
    name: 'Communication',
    icon: 'mobile',
    color: '#00d4ff',  // neon cyan
    type: 'expense' as const satisfies CategoryType,
    isFixed: true  // internet, mobile plans
  },
  subscriptions: {
    name: 'Subscriptions',
    icon: 'television',
    color: '#74b9ff',  // neon sky blue
    type: 'expense' as const satisfies CategoryType,
    isFixed: true  // recurring subscriptions
  },
  travel: {
    name: 'Travel',
    icon: 'plane',
    color: '#0984e3',  // neon blue
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  insurance: {
    name: 'Insurance',
    icon: 'shield',
    color: '#b2bec3',  // soft gray
    type: 'expense' as const satisfies CategoryType,
    isFixed: true  // insurance premiums
  },
  donations: {
    name: 'Donations',
    icon: 'heart',
    color: '#ff7675',  // neon red
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  taxes: {
    name: 'Taxes',
    icon: 'calculator',
    color: '#636e72',  // neutral gray
    type: 'expense' as const satisfies CategoryType,
    isFixed: true  // tax payments
  },
  debt: {
    name: 'Debt & Loans',
    icon: 'file-text',
    color: '#dfe6e9',  // light gray
    type: 'expense' as const satisfies CategoryType,
    isFixed: true  // loan payments
  },
  fees: {
    name: 'Fees & Charges',
    icon: 'bank',
    color: '#81ecec',  // light cyan
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  education: {
    name: 'Education',
    icon: 'graduation-cap',
    color: '#fdcb6e',  // neon gold
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  business: {
    name: 'Business & Work',
    icon: 'briefcase',
    color: '#6c5ce7',  // neon purple
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },

  // -------------------------
  // INCOME (Neon mint)
  // -------------------------
  income: {
    name: 'Income',
    icon: 'dollar',
    color: '#00ffa3',  // neon mint
    type: 'income' as const satisfies CategoryType,
    isFixed: false
  },

  // -------------------------
  // TRANSFER (Cyan tones)
  // -------------------------
  transfers: {
    name: 'Transfers',
    icon: 'exchange',
    color: '#00cec9',  // neon teal
    type: 'transfer' as const satisfies CategoryType,
    isFixed: false
  },
  savings: {
    name: 'Savings & Investment',
    icon: 'money',
    color: '#00b894',  // neon green
    type: 'transfer' as const satisfies CategoryType,
    isFixed: false
  }
} as const

// ===============================================================
// 2. SUBCATEGORIES
// ===============================================================

const SUBCATEGORIES: Record<string, SubCategoryMeta[]> = {
  // ---------------------------------------------------------------
  // Housing (neon orange family)
  // ---------------------------------------------------------------
  housing: [
    { key: 'utilities', name: 'Utilities', icon: 'lightbulb-o', color: '#ffb347' },
    { key: 'hoa', name: 'HOA / Maintenance', icon: 'building', color: '#ffc980' },
    { key: 'repairs', name: 'Repairs & Updates', icon: 'wrench', color: '#ff8533' },
    { key: 'home_insurance', name: 'Home Insurance', icon: 'shield', color: '#ff9f43' }
  ],

  // ---------------------------------------------------------------
  // Food (neon yellow family)
  // ---------------------------------------------------------------
  food: [
    { key: 'groceries', name: 'Groceries', icon: 'shopping-cart', color: '#ffe066' },
    { key: 'restaurants', name: 'Restaurants', icon: 'cutlery', color: '#feca57' },
    { key: 'coffee_snacks', name: 'Coffee / Snacks', icon: 'coffee', color: '#ffdd47' }
  ],

  // ---------------------------------------------------------------
  // Lifestyle (neon coral family)
  // ---------------------------------------------------------------
  lifestyle: [
    { key: 'home_items', name: 'Home Items', icon: 'shopping-bag', color: '#ff8585' },
    { key: 'clothes', name: 'Clothes & Accessories', icon: 'shopping-bag', color: '#ff6b6b' },
    { key: 'beauty', name: 'Beauty / Hair / Nails', icon: 'star', color: '#ff5252' },
    { key: 'electronics', name: 'Electronics / Furniture', icon: 'laptop', color: '#ff4757' },
    { key: 'laundry', name: 'Laundry / Dry Cleaning', icon: 'tint', color: '#ff9999' },
    { key: 'misc', name: 'Miscellaneous', icon: 'cube', color: '#ff7878' }
  ],

  // ---------------------------------------------------------------
  // Health (neon pink family)
  // ---------------------------------------------------------------
  health: [
    { key: 'doctor', name: 'Doctor Visit', icon: 'user-md', color: '#ffb8f0' },
    { key: 'pharmacy', name: 'Pharmacy', icon: 'medkit', color: '#ff9ff3' },
    { key: 'fitness', name: 'Fitness / Gym', icon: 'heartbeat', color: '#ff85e8' },
    { key: 'supplements', name: 'Supplements', icon: 'plus-square', color: '#ffc8f8' },
    { key: 'therapy', name: 'Therapy / Mental Health', icon: 'comments', color: '#ff8ce8' }
  ],

  // ---------------------------------------------------------------
  // Family & Children (soft neon yellow family)
  // ---------------------------------------------------------------
  family: [
    { key: 'childcare', name: 'Childcare / Nanny', icon: 'child', color: '#fff3b0' },
    { key: 'kids_food', name: 'Kids Food & Drinks', icon: 'spoon', color: '#ffeaa7' },
    { key: 'necessities', name: 'Necessities', icon: 'shopping-basket', color: '#ffe090' },
    { key: 'education', name: 'Books / Education', icon: 'book', color: '#ffd87a' },
    { key: 'kids_clothes', name: 'Kids Clothes', icon: 'shopping-bag', color: '#ffecb8' },
    { key: 'toys', name: 'Toys / Misc', icon: 'gamepad', color: '#fff5c8' }
  ],

  // ---------------------------------------------------------------
  // Pets (neon mint green family)
  // ---------------------------------------------------------------
  pets: [
    { key: 'pet_food', name: 'Pet Food', icon: 'cutlery', color: '#6ff5d8' },
    { key: 'vet', name: 'Vet Visit', icon: 'paw', color: '#55efc4' },
    { key: 'pet_supplies', name: 'Supplies (Clothes / Toys)', icon: 'paw', color: '#7fffd4' },
    { key: 'grooming', name: 'Grooming', icon: 'scissors', color: '#88ffe0' },
    { key: 'pet_insurance', name: 'Pet Insurance', icon: 'shield', color: '#45e0b0' }
  ],

  // ---------------------------------------------------------------
  // Social & Entertainment (neon lavender family)
  // ---------------------------------------------------------------
  social: [
    { key: 'friends', name: 'Friends Hangout', icon: 'users', color: '#b8b0ff' },
    { key: 'date', name: 'Date / Fun', icon: 'heart', color: '#a29bfe' },
    { key: 'classes', name: 'Classes / Hobbies', icon: 'paint-brush', color: '#9085f0' },
    { key: 'events', name: 'Events / Concerts', icon: 'ticket', color: '#8070e8' }
  ],

  // ---------------------------------------------------------------
  // Gifts & Occasions (neon magenta family)
  // ---------------------------------------------------------------
  gifts: [
    { key: 'wedding', name: 'Wedding Gifts', icon: 'diamond', color: '#ff90b8' },
    { key: 'baby', name: 'Baby Gifts', icon: 'child', color: '#ffa0c0' },
    { key: 'birthday', name: 'Birthday / Holiday Gifts', icon: 'birthday-cake', color: '#fd79a8' },
    { key: 'cash_gift', name: 'Cash Gifts', icon: 'money', color: '#f060a0' }
  ],

  // ---------------------------------------------------------------
  // Transportation (neon teal family)
  // ---------------------------------------------------------------
  transport: [
    { key: 'public_transit', name: 'Public Transit', icon: 'subway', color: '#20e8e8' },
    { key: 'taxi', name: 'Taxi / Rideshare', icon: 'taxi', color: '#00d2d3' },
    { key: 'parking', name: 'Parking', icon: 'product-hunt', color: '#40f0f0' },
    { key: 'gas', name: 'Gas', icon: 'tint', color: '#00c0c0' },
    { key: 'car_maintenance', name: 'Car Maintenance', icon: 'wrench', color: '#10d8d8' }
  ],

  // ---------------------------------------------------------------
  // Communication (neon cyan family)
  // ---------------------------------------------------------------
  communication: [
    { key: 'internet', name: 'Internet', icon: 'wifi', color: '#40e0ff' },
    { key: 'mobile', name: 'Mobile', icon: 'mobile', color: '#00d4ff' }
  ],

  // ---------------------------------------------------------------
  // Subscriptions (neon sky blue family)
  // ---------------------------------------------------------------
  subscriptions: [
    { key: 'streaming_video', name: 'Streaming Video', icon: 'television', color: '#90c8ff' },
    { key: 'music_audio', name: 'Music / Audio', icon: 'headphones', color: '#74b9ff' },
    { key: 'cloud_storage', name: 'Cloud Storage', icon: 'cloud', color: '#a0d0ff' },
    { key: 'apps_tools', name: 'Apps / Tools', icon: 'wrench', color: '#60a8ff' },
    { key: 'other_subscriptions', name: 'Other Subscriptions', icon: 'cube', color: '#b0d8ff' }
  ],

  // ---------------------------------------------------------------
  // Travel (neon blue family)
  // ---------------------------------------------------------------
  travel: [
    { key: 'flights', name: 'Flights', icon: 'plane', color: '#0984e3' },
    { key: 'lodging', name: 'Lodging / Hotel', icon: 'bed', color: '#3a9ff0' },
    { key: 'activities', name: 'Activities', icon: 'map', color: '#60b0ff' },
    { key: 'travel_transport', name: 'Local Transport', icon: 'bus', color: '#0070d0' }
  ],

  // ---------------------------------------------------------------
  // Insurance (soft gray family)
  // ---------------------------------------------------------------
  insurance: [
    { key: 'home_insurance', name: 'Home Insurance', icon: 'home', color: '#c0c8d0' },
    { key: 'health_insurance', name: 'Health Insurance', icon: 'heartbeat', color: '#b2bec3' },
    { key: 'life_insurance', name: 'Life Insurance', icon: 'heart', color: '#a0acb8' },
    { key: 'pet_insurance', name: 'Pet Insurance', icon: 'paw', color: '#d0d8e0' },
    { key: 'auto_insurance', name: 'Auto Insurance', icon: 'car', color: '#b8c4d0' }
  ],

  // ---------------------------------------------------------------
  // Donations (neon red family)
  // ---------------------------------------------------------------
  donations: [
    { key: 'general', name: 'General Donations', icon: 'heart', color: '#ff8888' },
    { key: 'religious', name: 'Religious / Nonprofit', icon: 'university', color: '#ff7675' },
    { key: 'fundraiser', name: 'Fundraisers', icon: 'flag', color: '#ff6060' }
  ],

  // ---------------------------------------------------------------
  // Taxes (neutral gray family)
  // ---------------------------------------------------------------
  taxes: [
    { key: 'federal', name: 'Federal Tax', icon: 'flag', color: '#707880' },
    { key: 'state_local', name: 'State / Local Tax', icon: 'university', color: '#636e72' },
    { key: 'property_tax', name: 'Property Tax', icon: 'home', color: '#808890' },
    { key: 'estimated', name: 'Estimated Tax', icon: 'file-text', color: '#9098a0' }
  ],

  // ---------------------------------------------------------------
  // Debt & Loans (light gray family)
  // ---------------------------------------------------------------
  debt: [
    { key: 'loan_interest', name: 'Loan Interest', icon: 'file-text', color: '#e8f0f0' },
    { key: 'credit_card_interest', name: 'Credit Card Interest', icon: 'credit-card', color: '#dfe6e9' },
    { key: 'student_loan_interest', name: 'Student Loan Interest', icon: 'graduation-cap', color: '#f0f5f5' }
  ],

  // ---------------------------------------------------------------
  // Fees & Charges (light cyan family)
  // ---------------------------------------------------------------
  fees: [
    { key: 'bank_fees', name: 'Bank Fees', icon: 'bank', color: '#98f0f0' },
    { key: 'atm_fees', name: 'ATM Fees', icon: 'credit-card', color: '#81ecec' },
    { key: 'late_fees', name: 'Late Fees', icon: 'clock-o', color: '#70e0e0' },
    { key: 'brokerage_fees', name: 'Brokerage Fees', icon: 'line-chart', color: '#a8f8f8' }
  ],

  // ---------------------------------------------------------------
  // Education (neon gold family)
  // ---------------------------------------------------------------
  education: [
    { key: 'tuition', name: 'Tuition', icon: 'university', color: '#ffe080' },
    { key: 'courses', name: 'Courses / Certifications', icon: 'laptop', color: '#fdcb6e' },
    { key: 'books', name: 'Books', icon: 'book', color: '#ffb860' }
  ],

  // ---------------------------------------------------------------
  // Business & Work (neon purple family)
  // ---------------------------------------------------------------
  business: [
    { key: 'work_meals', name: 'Work Meals', icon: 'cutlery', color: '#8070f0' },
    { key: 'work_travel', name: 'Work Travel', icon: 'suitcase', color: '#6c5ce7' },
    { key: 'software_tools', name: 'Software / Tools', icon: 'wrench', color: '#9080ff' },
    { key: 'office_supplies', name: 'Office Supplies', icon: 'paperclip', color: '#5848d0' }
  ],

  // ---------------------------------------------------------------
  // Income (neon mint family)
  // ---------------------------------------------------------------
  income: [
    { key: 'salary', name: 'Salary / Wages', icon: 'file-text', color: '#00ffa3' },
    { key: 'bonus', name: 'Bonus', icon: 'bullseye', color: '#20ffb0' },
    { key: 'cash_gift', name: 'Cash Gift', icon: 'gift', color: '#40ffc0' },
    { key: 'equity_vesting', name: 'Equity Vesting (RSU/Stock)', icon: 'cube', color: '#00e890' },
    { key: 'capital_gains', name: 'Capital Gains (Stock Sale)', icon: 'line-chart', color: '#00d080' },
    { key: 'dividends', name: 'Dividends', icon: 'money', color: '#00ffa3' },
    { key: 'interest', name: 'Interest', icon: 'bank', color: '#20ffb0' },
    { key: 'rental_income', name: 'Rental Income', icon: 'home', color: '#00e890' },
    { key: 'side_hustle', name: 'Side Hustle / Freelance', icon: 'briefcase', color: '#00d080' },
    { key: 'reimbursement', name: 'Reimbursement / Refund', icon: 'refresh', color: '#40ffc0' },
    { key: 'tax_refund', name: 'Tax Refund', icon: 'envelope', color: '#20ffb0' },
    { key: 'other_income', name: 'Other Income', icon: 'inbox', color: '#60ffd0' }
  ],

  // ---------------------------------------------------------------
  // Transfers (neon teal family)
  // ---------------------------------------------------------------
  transfers: [
    { key: 'between_accounts', name: 'Between Accounts', icon: 'exchange', color: '#20e0e0' },
    { key: 'credit_card_payment', name: 'Credit Card Payment', icon: 'credit-card', color: '#00cec9' },
    { key: 'cash_withdrawal', name: 'Cash Withdrawal', icon: 'credit-card', color: '#00b8b8' },
    { key: 'cash_deposit', name: 'Cash Deposit', icon: 'dollar', color: '#40f0f0' }
  ],

  // ---------------------------------------------------------------
  // Savings & Investment (neon green family)
  // ---------------------------------------------------------------
  savings: [
    { key: 'monthly_savings', name: 'Monthly Savings', icon: 'money', color: '#10d0a0' },
    { key: 'emergency', name: 'Emergency Fund', icon: 'exclamation-triangle', color: '#20e0b0' },
    { key: 'brokerage_transfer', name: 'Brokerage Transfer', icon: 'line-chart', color: '#00b894' },
    { key: 'retirement_401k', name: '401K Contribution', icon: 'bank', color: '#00a080' },
    { key: 'retirement_ira', name: 'IRA Contribution', icon: 'university', color: '#009070' },
    { key: 'hsa', name: 'HSA Contribution', icon: 'heartbeat', color: '#10d0a0' },
    { key: 'college_529', name: '529 / Education Savings', icon: 'graduation-cap', color: '#20e0b0' },
    { key: 'crypto_transfer', name: 'Crypto Transfer', icon: 'bitcoin', color: '#00b894' },
    { key: 'real_estate_invest', name: 'Real Estate Investing', icon: 'home', color: '#00a080' }
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
  isFixed: meta.isFixed,
  subCategories: SUBCATEGORIES[key] ?? []
}))

// Helper: Get fixed category keys for queries
export const FIXED_CATEGORY_KEYS = CATEGORIES
  .filter(c => c.isFixed && c.type === 'expense')
  .map(c => c.key)

// Example category object:
// {
//   key: 'housing',
//   name: 'Housing',
//   icon: '🏡',
//   color: '#F59E0B',
//   type: 'expense',
//   subCategories: ['property_tax', 'utilities', 'hoa', 'repairs', 'home_insurance']
// }