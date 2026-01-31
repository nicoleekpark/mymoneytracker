import type { CategoryMeta, SubCategoryMeta } from '@/config/categories.types'
import type { CategoryType } from '@/domain/category'
// Colors now use hex values from editorial palette

// ===============================================================
// 1. CATEGORY META
// ===============================================================

// ===============================================================
// Muted Editorial Category Colors
// Harmonized with V1: Warm Gray + Forest + Terracotta
// ===============================================================

const CATEGORY_META = {
  // -------------------------
  // EXPENSE (Muted, warm tones)
  // -------------------------
  housing: {
    name: 'Housing',
    icon: 'home',
    color: '#8b7355',  // warm brown
    type: 'expense' as const satisfies CategoryType
  },
  food: {
    name: 'Food',
    icon: 'cutlery',
    color: '#c9a227',  // muted gold (editorial.gold)
    type: 'expense' as const satisfies CategoryType
  },
  lifestyle: {
    name: 'Lifestyle',
    icon: 'star',
    color: '#b07d8e',  // dusty mauve
    type: 'expense' as const satisfies CategoryType
  },
  health: {
    name: 'Health',
    icon: 'heartbeat',
    color: '#c9828e',  // dusty rose
    type: 'expense' as const satisfies CategoryType
  },
  family: {
    name: 'Family & Children',
    icon: 'child',
    color: '#d4a574',  // warm sand
    type: 'expense' as const satisfies CategoryType
  },
  pets: {
    name: 'Pets',
    icon: 'paw',
    color: '#6b8f71',  // sage green
    type: 'expense' as const satisfies CategoryType
  },
  social: {
    name: 'Social & Entertainment',
    icon: 'users',
    color: '#9a8c98',  // muted purple
    type: 'expense' as const satisfies CategoryType
  },
  gifts: {
    name: 'Gifts & Occasions',
    icon: 'gift',
    color: '#c9828e',  // dusty rose
    type: 'expense' as const satisfies CategoryType
  },
  transport: {
    name: 'Transportation',
    icon: 'car',
    color: '#7ca6b0',  // muted teal
    type: 'expense' as const satisfies CategoryType
  },
  communication: {
    name: 'Communication',
    icon: 'mobile',
    color: '#5b9a8b',  // muted teal
    type: 'expense' as const satisfies CategoryType
  },
  subscriptions: {
    name: 'Subscriptions',
    icon: 'television',
    color: '#8b9dc3',  // muted blue
    type: 'expense' as const satisfies CategoryType
  },
  travel: {
    name: 'Travel',
    icon: 'plane',
    color: '#6b8fad',  // slate blue
    type: 'expense' as const satisfies CategoryType
  },
  insurance: {
    name: 'Insurance',
    icon: 'shield',
    color: '#a08060',  // warm taupe
    type: 'expense' as const satisfies CategoryType
  },
  donations: {
    name: 'Donations',
    icon: 'heart',
    color: '#c9828e',  // dusty rose
    type: 'expense' as const satisfies CategoryType
  },
  taxes: {
    name: 'Taxes',
    icon: 'calculator',
    color: '#78716c',
    type: 'expense' as const satisfies CategoryType
  },
  debt: {
    name: 'Debt & Loans',
    icon: 'file-text',
    color: '#a8a29e',
    type: 'expense' as const satisfies CategoryType
  },
  fees: {
    name: 'Fees & Charges',
    icon: 'bank',
    color: '#a8a29e',
    type: 'expense' as const satisfies CategoryType
  },
  education: {
    name: 'Education',
    icon: 'graduation-cap',
    color: '#c4a35a',  // muted gold
    type: 'expense' as const satisfies CategoryType
  },
  business: {
    name: 'Business & Work',
    icon: 'briefcase',
    color: '#857670',  // warm gray (editorial.primary)
    type: 'expense' as const satisfies CategoryType
  },

  // -------------------------
  // INCOME (Forest green)
  // -------------------------
  income: {
    name: 'Income',
    icon: 'dollar',
    color: '#4a7c59',  // forest green (editorial.forest)
    type: 'income' as const satisfies CategoryType
  },

  // -------------------------
  // TRANSFER (Neutral)
  // -------------------------
  transfers: {
    name: 'Transfers',
    icon: 'exchange',
    color: '#6b8fad',  // slate blue
    type: 'transfer' as const satisfies CategoryType
  },
  savings: {
    name: 'Savings & Investment',
    icon: 'money',
    color: '#4a7c59',  // forest green
    type: 'transfer' as const satisfies CategoryType
  }
} as const

// ===============================================================
// 2. SUBCATEGORIES
// ===============================================================

const SUBCATEGORIES: Record<string, SubCategoryMeta[]> = {
  // ---------------------------------------------------------------
  // Housing (warm browns)
  // ---------------------------------------------------------------
  housing: [
    { key: 'utilities', name: 'Utilities', icon: 'lightbulb-o', color: '#a08060' },
    { key: 'hoa', name: 'HOA / Maintenance', icon: 'building', color: '#b8956c' },
    { key: 'repairs', name: 'Repairs & Updates', icon: 'wrench', color: '#7a6248' },
    { key: 'home_insurance', name: 'Home Insurance', icon: 'shield', color: '#8b7355' }
  ],

  // ---------------------------------------------------------------
  // Food (muted gold/amber)
  // ---------------------------------------------------------------
  food: [
    { key: 'groceries', name: 'Groceries', icon: 'shopping-cart', color: '#d4a574' },
    { key: 'restaurants', name: 'Restaurants', icon: 'cutlery', color: '#c9a227' },
    { key: 'coffee_snacks', name: 'Coffee / Snacks', icon: 'coffee', color: '#c4a35a' }
  ],

  // ---------------------------------------------------------------
  // Lifestyle (dusty mauve)
  // ---------------------------------------------------------------
  lifestyle: [
    { key: 'home_items', name: 'Home Items', icon: 'shopping-bag', color: '#c4a3b3' },
    { key: 'clothes', name: 'Clothes & Accessories', icon: 'shopping-bag', color: '#b07d8e' },
    { key: 'beauty', name: 'Beauty / Hair / Nails', icon: 'star', color: '#a8738a' },
    { key: 'electronics', name: 'Electronics / Furniture', icon: 'laptop', color: '#9a8c98' },
    { key: 'laundry', name: 'Laundry / Dry Cleaning', icon: 'tint', color: '#a898a0' },
    { key: 'misc', name: 'Miscellaneous', icon: 'cube', color: '#b8a8b0' }
  ],

  // ---------------------------------------------------------------
  // Health (dusty rose)
  // ---------------------------------------------------------------
  health: [
    { key: 'doctor', name: 'Doctor Visit', icon: 'user-md', color: '#d4a3ab' },
    { key: 'pharmacy', name: 'Pharmacy', icon: 'medkit', color: '#c9828e' },
    { key: 'fitness', name: 'Fitness / Gym', icon: 'heartbeat', color: '#b8737f' },
    { key: 'supplements', name: 'Supplements', icon: 'plus-square', color: '#d4a3ab' },
    { key: 'therapy', name: 'Therapy / Mental Health', icon: 'comments', color: '#c4939f' }
  ],

  // ---------------------------------------------------------------
  // Family & Children (warm sand)
  // ---------------------------------------------------------------
  family: [
    { key: 'childcare', name: 'Childcare / Nanny', icon: 'child', color: '#d4a574' },
    { key: 'kids_food', name: 'Kids Food & Drinks', icon: 'spoon', color: '#c9a227' },
    { key: 'necessities', name: 'Necessities', icon: 'shopping-basket', color: '#c4a35a' },
    { key: 'education', name: 'Books / Education', icon: 'book', color: '#b8956c' },
    { key: 'kids_clothes', name: 'Kids Clothes', icon: 'shopping-bag', color: '#d4a574' },
    { key: 'toys', name: 'Toys / Misc', icon: 'gamepad', color: '#c4a35a' }
  ],

  // ---------------------------------------------------------------
  // Pets (sage green)
  // ---------------------------------------------------------------
  pets: [
    { key: 'pet_food', name: 'Pet Food', icon: 'cutlery', color: '#8fbf96' },
    { key: 'vet', name: 'Vet Visit', icon: 'paw', color: '#6b8f71' },
    { key: 'pet_supplies', name: 'Supplies (Clothes / Toys)', icon: 'paw', color: '#8cb8a4' },
    { key: 'grooming', name: 'Grooming', icon: 'scissors', color: '#a8c8b0' },
    { key: 'pet_insurance', name: 'Pet Insurance', icon: 'shield', color: '#6b9080' }
  ],

  // ---------------------------------------------------------------
  // Social & Entertainment (muted purple)
  // ---------------------------------------------------------------
  social: [
    { key: 'friends', name: 'Friends Hangout', icon: 'users', color: '#b8a8c0' },
    { key: 'date', name: 'Date / Fun', icon: 'heart', color: '#9a8c98' },
    { key: 'classes', name: 'Classes / Hobbies', icon: 'paint-brush', color: '#a898a0' },
    { key: 'events', name: 'Events / Concerts', icon: 'ticket', color: '#8b7d88' }
  ],

  // ---------------------------------------------------------------
  // Gifts & Occasions (dusty rose)
  // ---------------------------------------------------------------
  gifts: [
    { key: 'wedding', name: 'Wedding Gifts', icon: 'diamond', color: '#c9828e' },
    { key: 'baby', name: 'Baby Gifts', icon: 'child', color: '#d4a3ab' },
    { key: 'birthday', name: 'Birthday / Holiday Gifts', icon: 'birthday-cake', color: '#b8737f' },
    { key: 'cash_gift', name: 'Cash Gifts', icon: 'money', color: '#a8636f' }
  ],

  // ---------------------------------------------------------------
  // Transportation (muted teal/blue)
  // ---------------------------------------------------------------
  transport: [
    { key: 'public_transit', name: 'Public Transit', icon: 'subway', color: '#8bb8c8' },
    { key: 'taxi', name: 'Taxi / Rideshare', icon: 'taxi', color: '#7ca6b0' },
    { key: 'parking', name: 'Parking', icon: 'product-hunt', color: '#a8c8d0' },
    { key: 'gas', name: 'Gas', icon: 'tint', color: '#6b8fad' },
    { key: 'car_maintenance', name: 'Car Maintenance', icon: 'wrench', color: '#9bb8c0' }
  ],

  // ---------------------------------------------------------------
  // Communication (muted teal)
  // ---------------------------------------------------------------
  communication: [
    { key: 'internet', name: 'Internet', icon: 'wifi', color: '#7bc4b5' },
    { key: 'mobile', name: 'Mobile', icon: 'mobile', color: '#5b9a8b' }
  ],

  // ---------------------------------------------------------------
  // Subscriptions (muted blue)
  // ---------------------------------------------------------------
  subscriptions: [
    { key: 'streaming_video', name: 'Streaming Video', icon: 'television', color: '#a8b8d0' },
    { key: 'music_audio', name: 'Music / Audio', icon: 'headphones', color: '#8b9dc3' },
    { key: 'cloud_storage', name: 'Cloud Storage', icon: 'cloud', color: '#9badc0' },
    { key: 'apps_tools', name: 'Apps / Tools', icon: 'wrench', color: '#8b9dc3' },
    { key: 'other_subscriptions', name: 'Other Subscriptions', icon: 'cube', color: '#b8c8d8' }
  ],

  // ---------------------------------------------------------------
  // Travel (slate blue)
  // ---------------------------------------------------------------
  travel: [
    { key: 'flights', name: 'Flights', icon: 'plane', color: '#6b8fad' },
    { key: 'lodging', name: 'Lodging / Hotel', icon: 'bed', color: '#7ca6b0' },
    { key: 'activities', name: 'Activities', icon: 'map', color: '#8bb8c8' },
    { key: 'travel_transport', name: 'Local Transport', icon: 'bus', color: '#9bb8c0' }
  ],

  // ---------------------------------------------------------------
  // Insurance (warm taupe)
  // ---------------------------------------------------------------
  insurance: [
    { key: 'home_insurance', name: 'Home Insurance', icon: 'home', color: '#a08060' },
    { key: 'health_insurance', name: 'Health Insurance', icon: 'heartbeat', color: '#c9828e' },
    { key: 'life_insurance', name: 'Life Insurance', icon: 'heart', color: '#b8737f' },
    { key: 'pet_insurance', name: 'Pet Insurance', icon: 'paw', color: '#6b8f71' },
    { key: 'auto_insurance', name: 'Auto Insurance', icon: 'car', color: '#7ca6b0' }
  ],

  // ---------------------------------------------------------------
  // Donations (dusty rose)
  // ---------------------------------------------------------------
  donations: [
    { key: 'general', name: 'General Donations', icon: 'heart', color: '#d4a3ab' },
    { key: 'religious', name: 'Religious / Nonprofit', icon: 'university', color: '#c9828e' },
    { key: 'fundraiser', name: 'Fundraisers', icon: 'flag', color: '#b8737f' }
  ],

  // ---------------------------------------------------------------
  // Taxes (stone neutrals)
  // ---------------------------------------------------------------
  taxes: [
    { key: 'federal', name: 'Federal Tax', icon: 'flag', color: '#78716c' },
    { key: 'state_local', name: 'State / Local Tax', icon: 'university', color: '#a8a29e' },
    { key: 'property_tax', name: 'Property Tax', icon: 'home', color: '#d6d3d1' },
    { key: 'estimated', name: 'Estimated Tax', icon: 'file-text', color: '#a8a29e' }
  ],

  // ---------------------------------------------------------------
  // Debt & Loans (stone neutrals)
  // ---------------------------------------------------------------
  debt: [
    { key: 'loan_interest', name: 'Loan Interest', icon: 'file-text', color: '#a8a29e' },
    { key: 'credit_card_interest', name: 'Credit Card Interest', icon: 'credit-card', color: '#78716c' },
    { key: 'student_loan_interest', name: 'Student Loan Interest', icon: 'graduation-cap', color: '#d6d3d1' }
  ],

  // ---------------------------------------------------------------
  // Fees & Charges (stone neutrals)
  // ---------------------------------------------------------------
  fees: [
    { key: 'bank_fees', name: 'Bank Fees', icon: 'bank', color: '#d6d3d1' },
    { key: 'atm_fees', name: 'ATM Fees', icon: 'credit-card', color: '#a8a29e' },
    { key: 'late_fees', name: 'Late Fees', icon: 'clock-o', color: '#78716c' },
    { key: 'brokerage_fees', name: 'Brokerage Fees', icon: 'line-chart', color: '#d6d3d1' }
  ],

  // ---------------------------------------------------------------
  // Education (muted gold)
  // ---------------------------------------------------------------
  education: [
    { key: 'tuition', name: 'Tuition', icon: 'university', color: '#c9a227' },
    { key: 'courses', name: 'Courses / Certifications', icon: 'laptop', color: '#c4a35a' },
    { key: 'books', name: 'Books', icon: 'book', color: '#d4a574' }
  ],

  // ---------------------------------------------------------------
  // Business & Work (warm gray)
  // ---------------------------------------------------------------
  business: [
    { key: 'work_meals', name: 'Work Meals', icon: 'cutlery', color: '#a8a29e' },
    { key: 'work_travel', name: 'Work Travel', icon: 'suitcase', color: '#857670' },
    { key: 'software_tools', name: 'Software / Tools', icon: 'wrench', color: '#d6d3d1' },
    { key: 'office_supplies', name: 'Office Supplies', icon: 'paperclip', color: '#b8b0a8' }
  ],

  // ---------------------------------------------------------------
  // Income (forest green shades)
  // ---------------------------------------------------------------
  income: [
    { key: 'salary', name: 'Salary / Wages', icon: 'file-text', color: '#4a7c59' },
    { key: 'bonus', name: 'Bonus', icon: 'bullseye', color: '#5a8c69' },
    { key: 'cash_gift', name: 'Cash Gift', icon: 'gift', color: '#6b8f71' },
    { key: 'equity_vesting', name: 'Equity Vesting (RSU/Stock)', icon: 'cube', color: '#5a8c69' },
    { key: 'capital_gains', name: 'Capital Gains (Stock Sale)', icon: 'line-chart', color: '#4a7c59' },
    { key: 'dividends', name: 'Dividends', icon: 'money', color: '#5a8c69' },
    { key: 'interest', name: 'Interest', icon: 'bank', color: '#6b8f71' },
    { key: 'rental_income', name: 'Rental Income', icon: 'home', color: '#4a7c59' },
    { key: 'side_hustle', name: 'Side Hustle / Freelance', icon: 'briefcase', color: '#5a8c69' },
    { key: 'reimbursement', name: 'Reimbursement / Refund', icon: 'refresh', color: '#6b9080' },
    { key: 'tax_refund', name: 'Tax Refund', icon: 'envelope', color: '#6b8f71' },
    { key: 'other_income', name: 'Other Income', icon: 'inbox', color: '#8fbf96' }
  ],

  // ---------------------------------------------------------------
  // Transfers (slate blue)
  // ---------------------------------------------------------------
  transfers: [
    { key: 'between_accounts', name: 'Between Accounts', icon: 'exchange', color: '#5c7a8a' },
    { key: 'credit_card_payment', name: 'Credit Card Payment', icon: 'credit-card', color: '#6b8fad' },
    { key: 'cash_withdrawal', name: 'Cash Withdrawal', icon: 'credit-card', color: '#7ca6b0' },
    { key: 'cash_deposit', name: 'Cash Deposit', icon: 'dollar', color: '#8bb8c8' }
  ],

  // ---------------------------------------------------------------
  // Savings & Investment (forest green)
  // ---------------------------------------------------------------
  savings: [
    { key: 'monthly_savings', name: 'Monthly Savings', icon: 'money', color: '#5a8c69' },
    { key: 'emergency', name: 'Emergency Fund', icon: 'exclamation-triangle', color: '#8fbf96' },
    { key: 'brokerage_transfer', name: 'Brokerage Transfer', icon: 'line-chart', color: '#4a7c59' },
    { key: 'retirement_401k', name: '401K Contribution', icon: 'bank', color: '#6b8f71' },
    { key: 'retirement_ira', name: 'IRA Contribution', icon: 'university', color: '#6b9080' },
    { key: 'hsa', name: 'HSA Contribution', icon: 'heartbeat', color: '#8cb8a4' },
    { key: 'college_529', name: '529 / Education Savings', icon: 'graduation-cap', color: '#8fbf96' },
    { key: 'crypto_transfer', name: 'Crypto Transfer', icon: 'bitcoin', color: '#5a8c69' },
    { key: 'real_estate_invest', name: 'Real Estate Investing', icon: 'home', color: '#4a7c59' }
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