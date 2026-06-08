import type { CategoryMeta, SubCategoryMeta } from '@/shared/config/categories.types'
import type { CategoryType } from '@/core/domain/category'

// ===============================================================
// 1. CATEGORY META
// ===============================================================

// ===============================================================
// Monet Natural Palette
// Inspired by "Woman with a Parasol" 1875
// Garden greens, sky blues, sunlit golds, mist purples, earth tones
// ===============================================================

const CATEGORY_META = {
  // -------------------------
  // EXPENSE
  // -------------------------
  housing: {
    name: 'Housing',
    icon: 'home',
    color: '#3D6F64',  // parasol teal
    type: 'expense' as const satisfies CategoryType,
    isFixed: true
  },
  food: {
    name: 'Food',
    icon: 'cutlery',
    color: '#4A7A5A',  // garden green
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  lifestyle: {
    name: 'Lifestyle',
    icon: 'star',
    color: '#2E5E8E',  // sky blue
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  health: {
    name: 'Health',
    icon: 'heartbeat',
    color: '#3A6A8A',  // lighter sky
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  family: {
    name: 'Family & Children',
    icon: 'child',
    color: '#8A5A14',  // sunlight amber
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  pets: {
    name: 'Pets',
    icon: 'paw',
    color: '#7A6A24',  // golden
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  social: {
    name: 'Social & Entertainment',
    icon: 'users',
    color: '#5A5A7A',  // mist purple
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  gifts: {
    name: 'Gifts & Occasions',
    icon: 'gift',
    color: '#6A5A6A',  // shadow mauve
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  transport: {
    name: 'Transportation',
    icon: 'car',
    color: '#5A6A5A',  // sage
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  communication: {
    name: 'Communication',
    icon: 'mobile',
    color: '#4A6A7A',  // steel
    type: 'expense' as const satisfies CategoryType,
    isFixed: true
  },
  subscriptions: {
    name: 'Subscriptions',
    icon: 'television',
    color: '#5A7A8A',  // pale blue
    type: 'expense' as const satisfies CategoryType,
    isFixed: true
  },
  travel: {
    name: 'Travel',
    icon: 'plane',
    color: '#3D6F64',  // teal
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  insurance: {
    name: 'Insurance',
    icon: 'shield',
    color: '#5A6A6A',  // gray
    type: 'expense' as const satisfies CategoryType,
    isFixed: true
  },
  donations: {
    name: 'Donations',
    icon: 'heart',
    color: '#7A5A5A',  // dusty rose
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  taxes: {
    name: 'Taxes',
    icon: 'calculator',
    color: '#4A5A5A',  // dark gray
    type: 'expense' as const satisfies CategoryType,
    isFixed: true
  },
  debt: {
    name: 'Debt & Loans',
    icon: 'file-text',
    color: '#5A5A5A',  // gray
    type: 'expense' as const satisfies CategoryType,
    isFixed: true
  },
  fees: {
    name: 'Fees & Charges',
    icon: 'bank',
    color: '#5A6A6A',  // gray
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  education: {
    name: 'Education',
    icon: 'graduation-cap',
    color: '#6A7A5A',  // olive green
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },
  business: {
    name: 'Business & Work',
    icon: 'briefcase',
    color: '#5A5A6A',  // slate
    type: 'expense' as const satisfies CategoryType,
    isFixed: false
  },

  // -------------------------
  // INCOME
  // -------------------------
  income: {
    name: 'Income',
    icon: 'dollar',
    color: '#1F6B56',  // income green
    type: 'income' as const satisfies CategoryType,
    isFixed: false
  },

  // -------------------------
  // ADJUSTMENTS (system category)
  // -------------------------
  adjustments: {
    name: 'Adjustments',
    icon: 'sliders',
    color: '#6A6A6A',  // neutral gray
    type: 'income' as const satisfies CategoryType,
    isFixed: false
  },

  // -------------------------
  // TRANSFER
  // -------------------------
  transfers: {
    name: 'Transfers',
    icon: 'exchange',
    color: '#5A6A6A',  // neutral gray
    type: 'transfer' as const satisfies CategoryType,
    isFixed: false
  },
  savings: {
    name: 'Savings & Investment',
    icon: 'money',
    color: '#3D6F64',  // primary teal
    type: 'transfer' as const satisfies CategoryType,
    isFixed: false
  }
} as const

// ===============================================================
// 2. SUBCATEGORIES
// ===============================================================

const SUBCATEGORIES: Record<string, SubCategoryMeta[]> = {
  // ---------------------------------------------------------------
  // Housing (teal family)
  // ---------------------------------------------------------------
  housing: [
    { key: 'utilities', name: 'Utilities', icon: 'lightbulb-o', color: '#4A7F74' },
    { key: 'hoa', name: 'HOA / Maintenance', icon: 'building', color: '#5A8F84' },
    { key: 'repairs', name: 'Repairs & Updates', icon: 'wrench', color: '#2D5F54' },
    { key: 'home_insurance', name: 'Home Insurance', icon: 'shield', color: '#3D6F64' }
  ],

  // ---------------------------------------------------------------
  // Food (garden green family)
  // ---------------------------------------------------------------
  food: [
    { key: 'groceries', name: 'Groceries', icon: 'shopping-cart', color: '#5A8A6A' },
    { key: 'restaurants', name: 'Restaurants', icon: 'cutlery', color: '#4A7A5A' },
    { key: 'coffee_snacks', name: 'Coffee / Snacks', icon: 'coffee', color: '#6A9A7A' }
  ],

  // ---------------------------------------------------------------
  // Lifestyle (sky blue family)
  // ---------------------------------------------------------------
  lifestyle: [
    { key: 'home_items', name: 'Home Items', icon: 'shopping-bag', color: '#3E6E9E' },
    { key: 'clothes', name: 'Clothes & Accessories', icon: 'shopping-bag', color: '#2E5E8E' },
    { key: 'beauty', name: 'Beauty / Hair / Nails', icon: 'star', color: '#4E7EAE' },
    { key: 'electronics', name: 'Electronics / Furniture', icon: 'laptop', color: '#1E4E7E' },
    { key: 'laundry', name: 'Laundry / Dry Cleaning', icon: 'tint', color: '#5E8EBE' },
    { key: 'misc', name: 'Miscellaneous', icon: 'cube', color: '#3E6E9E' }
  ],

  // ---------------------------------------------------------------
  // Health (lighter sky family)
  // ---------------------------------------------------------------
  health: [
    { key: 'doctor', name: 'Doctor Visit', icon: 'user-md', color: '#4A7A9A' },
    { key: 'pharmacy', name: 'Pharmacy', icon: 'medkit', color: '#3A6A8A' },
    { key: 'fitness', name: 'Fitness / Gym', icon: 'heartbeat', color: '#5A8AAA' },
    { key: 'supplements', name: 'Supplements', icon: 'plus-square', color: '#6A9ABA' },
    { key: 'therapy', name: 'Therapy / Mental Health', icon: 'comments', color: '#4A7A9A' }
  ],

  // ---------------------------------------------------------------
  // Family & Children (sunlight amber family)
  // ---------------------------------------------------------------
  family: [
    { key: 'childcare', name: 'Childcare / Nanny', icon: 'child', color: '#9A6A24' },
    { key: 'kids_food', name: 'Kids Food & Drinks', icon: 'spoon', color: '#8A5A14' },
    { key: 'necessities', name: 'Necessities', icon: 'shopping-basket', color: '#AA7A34' },
    { key: 'education', name: 'Books / Education', icon: 'book', color: '#7A4A04' },
    { key: 'kids_clothes', name: 'Kids Clothes', icon: 'shopping-bag', color: '#BA8A44' },
    { key: 'toys', name: 'Toys / Misc', icon: 'gamepad', color: '#CA9A54' }
  ],

  // ---------------------------------------------------------------
  // Pets (golden family)
  // ---------------------------------------------------------------
  pets: [
    { key: 'pet_food', name: 'Pet Food', icon: 'cutlery', color: '#8A7A34' },
    { key: 'vet', name: 'Vet Visit', icon: 'paw', color: '#7A6A24' },
    { key: 'pet_supplies', name: 'Supplies (Clothes / Toys)', icon: 'paw', color: '#9A8A44' },
    { key: 'grooming', name: 'Grooming', icon: 'scissors', color: '#AA9A54' },
    { key: 'pet_insurance', name: 'Pet Insurance', icon: 'shield', color: '#6A5A14' }
  ],

  // ---------------------------------------------------------------
  // Social & Entertainment (mist purple family)
  // ---------------------------------------------------------------
  social: [
    { key: 'friends', name: 'Friends Hangout', icon: 'users', color: '#6A6A8A' },
    { key: 'date', name: 'Date / Fun', icon: 'heart', color: '#5A5A7A' },
    { key: 'classes', name: 'Classes / Hobbies', icon: 'paint-brush', color: '#7A7A9A' },
    { key: 'events', name: 'Events / Concerts', icon: 'ticket', color: '#4A4A6A' }
  ],

  // ---------------------------------------------------------------
  // Gifts & Occasions (shadow mauve family)
  // ---------------------------------------------------------------
  gifts: [
    { key: 'wedding', name: 'Wedding Gifts', icon: 'diamond', color: '#7A6A7A' },
    { key: 'baby', name: 'Baby Gifts', icon: 'child', color: '#8A7A8A' },
    { key: 'birthday', name: 'Birthday / Holiday Gifts', icon: 'birthday-cake', color: '#6A5A6A' },
    { key: 'cash_gift', name: 'Cash Gifts', icon: 'money', color: '#5A4A5A' }
  ],

  // ---------------------------------------------------------------
  // Transportation (sage family)
  // ---------------------------------------------------------------
  transport: [
    { key: 'public_transit', name: 'Public Transit', icon: 'subway', color: '#6A7A6A' },
    { key: 'taxi', name: 'Taxi / Rideshare', icon: 'taxi', color: '#5A6A5A' },
    { key: 'parking', name: 'Parking', icon: 'product-hunt', color: '#7A8A7A' },
    { key: 'gas', name: 'Gas', icon: 'tint', color: '#4A5A4A' },
    { key: 'car_maintenance', name: 'Car Maintenance', icon: 'wrench', color: '#6A7A6A' }
  ],

  // ---------------------------------------------------------------
  // Communication (steel family)
  // ---------------------------------------------------------------
  communication: [
    { key: 'internet', name: 'Internet', icon: 'wifi', color: '#5A7A8A' },
    { key: 'mobile', name: 'Mobile', icon: 'mobile', color: '#4A6A7A' }
  ],

  // ---------------------------------------------------------------
  // Subscriptions (pale blue family)
  // ---------------------------------------------------------------
  subscriptions: [
    { key: 'streaming_video', name: 'Streaming Video', icon: 'television', color: '#6A8A9A' },
    { key: 'music_audio', name: 'Music / Audio', icon: 'headphones', color: '#5A7A8A' },
    { key: 'cloud_storage', name: 'Cloud Storage', icon: 'cloud', color: '#7A9AAA' },
    { key: 'apps_tools', name: 'Apps / Tools', icon: 'wrench', color: '#4A6A7A' },
    { key: 'other_subscriptions', name: 'Other Subscriptions', icon: 'cube', color: '#8AAABA' }
  ],

  // ---------------------------------------------------------------
  // Travel (teal family)
  // ---------------------------------------------------------------
  travel: [
    { key: 'flights', name: 'Flights', icon: 'plane', color: '#3D6F64' },
    { key: 'lodging', name: 'Lodging / Hotel', icon: 'bed', color: '#4D7F74' },
    { key: 'activities', name: 'Activities', icon: 'map', color: '#5D8F84' },
    { key: 'travel_transport', name: 'Local Transport', icon: 'bus', color: '#2D5F54' }
  ],

  // ---------------------------------------------------------------
  // Insurance (gray family)
  // ---------------------------------------------------------------
  insurance: [
    { key: 'home_insurance', name: 'Home Insurance', icon: 'home', color: '#6A7A7A' },
    { key: 'health_insurance', name: 'Health Insurance', icon: 'heartbeat', color: '#5A6A6A' },
    { key: 'life_insurance', name: 'Life Insurance', icon: 'heart', color: '#4A5A5A' },
    { key: 'pet_insurance', name: 'Pet Insurance', icon: 'paw', color: '#7A8A8A' },
    { key: 'auto_insurance', name: 'Auto Insurance', icon: 'car', color: '#6A7A7A' }
  ],

  // ---------------------------------------------------------------
  // Donations (dusty rose family)
  // ---------------------------------------------------------------
  donations: [
    { key: 'general', name: 'General Donations', icon: 'heart', color: '#8A6A6A' },
    { key: 'religious', name: 'Religious / Nonprofit', icon: 'university', color: '#7A5A5A' },
    { key: 'fundraiser', name: 'Fundraisers', icon: 'flag', color: '#6A4A4A' }
  ],

  // ---------------------------------------------------------------
  // Taxes (dark gray family)
  // ---------------------------------------------------------------
  taxes: [
    { key: 'federal', name: 'Federal Tax', icon: 'flag', color: '#5A6A6A' },
    { key: 'state_local', name: 'State / Local Tax', icon: 'university', color: '#4A5A5A' },
    { key: 'property_tax', name: 'Property Tax', icon: 'home', color: '#6A7A7A' },
    { key: 'estimated', name: 'Estimated Tax', icon: 'file-text', color: '#7A8A8A' }
  ],

  // ---------------------------------------------------------------
  // Debt & Loans (gray family)
  // ---------------------------------------------------------------
  debt: [
    { key: 'loan_interest', name: 'Loan Interest', icon: 'file-text', color: '#6A6A6A' },
    { key: 'credit_card_interest', name: 'Credit Card Interest', icon: 'credit-card', color: '#5A5A5A' },
    { key: 'student_loan_interest', name: 'Student Loan Interest', icon: 'graduation-cap', color: '#7A7A7A' }
  ],

  // ---------------------------------------------------------------
  // Fees & Charges (gray family)
  // ---------------------------------------------------------------
  fees: [
    { key: 'bank_fees', name: 'Bank Fees', icon: 'bank', color: '#6A7A7A' },
    { key: 'atm_fees', name: 'ATM Fees', icon: 'credit-card', color: '#5A6A6A' },
    { key: 'late_fees', name: 'Late Fees', icon: 'clock-o', color: '#4A5A5A' },
    { key: 'brokerage_fees', name: 'Brokerage Fees', icon: 'line-chart', color: '#7A8A8A' }
  ],

  // ---------------------------------------------------------------
  // Education (olive green family)
  // ---------------------------------------------------------------
  education: [
    { key: 'tuition', name: 'Tuition', icon: 'university', color: '#7A8A6A' },
    { key: 'courses', name: 'Courses / Certifications', icon: 'laptop', color: '#6A7A5A' },
    { key: 'books', name: 'Books', icon: 'book', color: '#5A6A4A' }
  ],

  // ---------------------------------------------------------------
  // Business & Work (slate family)
  // ---------------------------------------------------------------
  business: [
    { key: 'work_meals', name: 'Work Meals', icon: 'cutlery', color: '#6A6A7A' },
    { key: 'work_travel', name: 'Work Travel', icon: 'suitcase', color: '#5A5A6A' },
    { key: 'software_tools', name: 'Software / Tools', icon: 'wrench', color: '#7A7A8A' },
    { key: 'office_supplies', name: 'Office Supplies', icon: 'paperclip', color: '#4A4A5A' }
  ],

  // ---------------------------------------------------------------
  // Income (income green family)
  // ---------------------------------------------------------------
  income: [
    { key: 'salary', name: 'Salary / Wages', icon: 'file-text', color: '#1F6B56' },
    { key: 'bonus', name: 'Bonus', icon: 'bullseye', color: '#2F7B66' },
    { key: 'cash_gift', name: 'Cash Gift', icon: 'gift', color: '#3F8B76' },
    { key: 'equity_vesting', name: 'Equity Vesting (RSU/Stock)', icon: 'cube', color: '#0F5B46' },
    { key: 'capital_gains', name: 'Capital Gains (Stock Sale)', icon: 'line-chart', color: '#0F4B36' },
    { key: 'dividends', name: 'Dividends', icon: 'money', color: '#1F6B56' },
    { key: 'interest', name: 'Interest', icon: 'bank', color: '#2F7B66' },
    { key: 'rental_income', name: 'Rental Income', icon: 'home', color: '#0F5B46' },
    { key: 'side_hustle', name: 'Side Hustle / Freelance', icon: 'briefcase', color: '#0F4B36' },
    { key: 'reimbursement', name: 'Reimbursement / Refund', icon: 'refresh', color: '#3F8B76' },
    { key: 'tax_refund', name: 'Tax Refund', icon: 'envelope', color: '#2F7B66' },
    { key: 'other_income', name: 'Other Income', icon: 'inbox', color: '#4F9B86' }
  ],

  // ---------------------------------------------------------------
  // Adjustments (neutral gray family)
  // ---------------------------------------------------------------
  adjustments: [
    { key: 'opening_balance', name: 'Opening Balance', icon: 'plus-circle', color: '#6A6A6A' },
    { key: 'balance_correction', name: 'Balance Correction', icon: 'pencil', color: '#5A5A5A' }
  ],

  // ---------------------------------------------------------------
  // Transfers (neutral gray family)
  // ---------------------------------------------------------------
  transfers: [
    { key: 'between_accounts', name: 'Between Accounts', icon: 'exchange', color: '#6A7A7A' },
    { key: 'credit_card_payment', name: 'Credit Card Payment', icon: 'credit-card', color: '#5A6A6A' },
    { key: 'cash_withdrawal', name: 'Cash Withdrawal', icon: 'credit-card', color: '#4A5A5A' },
    { key: 'cash_deposit', name: 'Cash Deposit', icon: 'dollar', color: '#7A8A8A' }
  ],

  // ---------------------------------------------------------------
  // Savings & Investment (primary teal family)
  // ---------------------------------------------------------------
  savings: [
    { key: 'monthly_savings', name: 'Monthly Savings', icon: 'money', color: '#4D7F74' },
    { key: 'emergency', name: 'Emergency Fund', icon: 'exclamation-triangle', color: '#5D8F84' },
    { key: 'brokerage_transfer', name: 'Brokerage Transfer', icon: 'line-chart', color: '#3D6F64' },
    { key: 'retirement_401k', name: '401K Contribution', icon: 'bank', color: '#2D5F54' },
    { key: 'retirement_ira', name: 'IRA Contribution', icon: 'university', color: '#1D4F44' },
    { key: 'hsa', name: 'HSA Contribution', icon: 'heartbeat', color: '#4D7F74' },
    { key: 'college_529', name: '529 / Education Savings', icon: 'graduation-cap', color: '#5D8F84' },
    { key: 'crypto_transfer', name: 'Crypto Transfer', icon: 'bitcoin', color: '#3D6F64' },
    { key: 'real_estate_invest', name: 'Real Estate Investing', icon: 'home', color: '#2D5F54' }
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
