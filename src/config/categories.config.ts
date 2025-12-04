import { PALETTE } from '@/theme'
import type { Category, SubCategory } from '@/types'

// ===============================================================
// 1. CATEGORY META
// ===============================================================

const CATEGORY_META = {
  housing: {
    name: 'Housing',
    icon: '🏡',
    color: PALETTE.orange[500],
    type: 'expense' as const
  },
  food: {
    name: 'Food',
    icon: '🍽️',
    color: PALETTE.amber[400],
    type: 'expense' as const
  },
  lifestyle: {
    name: 'Lifestyle',
    icon: '💅',
    color: PALETTE.pink[300],
    type: 'expense' as const
  },
  health: {
    name: 'Health',
    icon: '🩺',
    color: PALETTE.red[400],
    type: 'expense' as const
  },
  family: {
    name: 'Family & Children',
    icon: '🧸',
    color: PALETTE.yellow[400],
    type: 'expense' as const
  },
  pets: {
    name: 'Pets',
    icon: '🐶',
    color: PALETTE.green[300],
    type: 'expense' as const
  },
  social: {
    name: 'Social & Entertainment',
    icon: '🎉',
    color: PALETTE.purple[300],
    type: 'expense' as const
  },
  gifts: {
    name: 'Gifts & Occasions',
    icon: '🎁',
    color: PALETTE.fuchsia[300],
    type: 'expense' as const
  },
  transport: {
    name: 'Transportation',
    icon: '🚗',
    color: PALETTE.blue[400],
    type: 'expense' as const
  },
  communication: {
    name: 'Communication',
    icon: '📱',
    color: PALETTE.teal[400],
    type: 'expense' as const
  },
  subscriptions: {
    name: 'Subscriptions',
    icon: '📺',
    color: PALETTE.indigo[400],
    type: 'expense' as const
  },
  travel: {
    name: 'Travel',
    icon: '🌍',
    color: PALETTE.blue[500],
    type: 'expense' as const
  },
  insurance: {
    name: 'Insurance',
    icon: '🛡️',
    color: PALETTE.orange[400],
    type: 'expense' as const
  },
  donations: {
    name: 'Donations',
    icon: '🙏',
    color: PALETTE.rose[400],
    type: 'expense' as const
  },
  savings: {
    name: 'Savings & Investment',
    icon: '💰',
    color: PALETTE.green[500],
    type: 'transfer' as const
  }
} as const

// ===============================================================
// 2. SUBCATEGORIES
// ===============================================================

const SUBCATEGORIES: Record<string, SubCategory[]> = {
  // ---------------------------------------------------------------
  // 1) Housing
  // ---------------------------------------------------------------
  housing: [
    { id: 'property_tax', name: 'Property Tax', icon: '🧾', color: PALETTE.orange[500] },
    { id: 'utilities', name: 'Utilities', icon: '💡', color: PALETTE.orange[400] },
    { id: 'hoa', name: 'HOA / Maintenance', icon: '🏢', color: PALETTE.orange[300] },
    { id: 'repairs', name: 'Repairs & Updates', icon: '🛠️', color: PALETTE.orange[600] },
    { id: 'home_insurance', name: 'Home Insurance', icon: '🛡️', color: PALETTE.orange[500] }
  ],

  // ---------------------------------------------------------------
  // 2) Food
  // ---------------------------------------------------------------
  food: [
    { id: 'groceries', name: 'Groceries', icon: '🛒', color: PALETTE.amber[300] },
    { id: 'eating_out', name: 'Eating Out', icon: '🍽️', color: PALETTE.amber[400] }
  ],

  // ---------------------------------------------------------------
  // 3) Lifestyle
  // ---------------------------------------------------------------
  lifestyle: [
    { id: 'home_items', name: 'Home Items', icon: '🧻', color: PALETTE.pink[200] },
    { id: 'clothes', name: 'Clothes & Accessories', icon: '👗', color: PALETTE.pink[300] },
    { id: 'beauty', name: 'Beauty / Hair / Nails', icon: '💅', color: PALETTE.pink[400] },
    { id: 'electronics', name: 'Electronics / Furniture', icon: '🛋️', color: PALETTE.pink[200] },
    { id: 'misc', name: 'Miscellaneous', icon: '📦', color: PALETTE.pink[100] }
  ],

  // ---------------------------------------------------------------
  // 4) Health
  // ---------------------------------------------------------------
  health: [
    { id: 'doctor', name: 'Doctor Visit', icon: '🩺', color: PALETTE.red[300] },
    { id: 'pharmacy', name: 'Pharmacy', icon: '💊', color: PALETTE.red[400] },
    { id: 'fitness', name: 'Fitness / Gym', icon: '🏋️‍♀️', color: PALETTE.red[300] },
    { id: 'supplements', name: 'Supplements', icon: '⚕️', color: PALETTE.red[200] }
  ],

  // ---------------------------------------------------------------
  // 5) Family & Children
  // ---------------------------------------------------------------
  family: [
    { id: 'kids_food', name: 'Kids Food & Drinks', icon: '🍲', color: PALETTE.yellow[400] },
    { id: 'necessities', name: 'Necessities', icon: '🧴', color: PALETTE.yellow[300] },
    { id: 'education', name: 'Books / Education', icon: '📚', color: PALETTE.yellow[500] },
    { id: 'kids_clothes', name: 'Kids Clothes', icon: '🧦', color: PALETTE.yellow[400] },
    { id: 'toys', name: 'Toys / Misc', icon: '🧸', color: PALETTE.yellow[300] }
  ],

  // ---------------------------------------------------------------
  // 6) Pets
  // ---------------------------------------------------------------
  pets: [
    { id: 'pet_food', name: 'Pet Food', icon: '🍖', color: PALETTE.green[300] },
    { id: 'vet', name: 'Vet Visit', icon: '🐾', color: PALETTE.green[400] },
    { id: 'pet_supplies', name: 'Supplies (Clothes / Toys)', icon: '🦴', color: PALETTE.green[200] },
    { id: 'pet_insurance', name: 'Pet Insurance', icon: '🛡️', color: PALETTE.green[300] }
  ],

  // ---------------------------------------------------------------
  // 7) Social & Entertainment
  // ---------------------------------------------------------------
  social: [
    { id: 'friends', name: 'Friends Hangout', icon: '🫶', color: PALETTE.purple[200] },
    { id: 'date', name: 'Date / Fun', icon: '💑', color: PALETTE.purple[300] },
    { id: 'classes', name: 'Classes / Hobbies', icon: '🎨', color: PALETTE.purple[300] },
    { id: 'events', name: 'Events / Concerts', icon: '🎫', color: PALETTE.purple[400] }
  ],

  // ---------------------------------------------------------------
  // 8) Gifts & Occasions
  // ---------------------------------------------------------------
  gifts: [
    { id: 'wedding', name: 'Wedding Gifts', icon: '💍', color: PALETTE.fuchsia[300] },
    { id: 'baby', name: 'Baby Gifts', icon: '🍼', color: PALETTE.fuchsia[200] },
    { id: 'birthday', name: 'Birthday / Holiday Gifts', icon: '🎉', color: PALETTE.fuchsia[400] },
    { id: 'cash_gift', name: 'Cash Gifts (축의금 등)', icon: '💸', color: PALETTE.fuchsia[500] }
  ],

  // ---------------------------------------------------------------
  // 9) Transportation
  // ---------------------------------------------------------------
  transport: [
    { id: 'public_transit', name: 'Public Transit', icon: '🚇', color: PALETTE.blue[300] },
    { id: 'taxi', name: 'Taxi / Rideshare', icon: '🚕', color: PALETTE.blue[400] },
    { id: 'parking', name: 'Parking', icon: '🅿️', color: PALETTE.blue[300] },
    { id: 'gas', name: 'Gas', icon: '⛽', color: PALETTE.blue[500] }
  ],

  // ---------------------------------------------------------------
  // 10) Communication
  // ---------------------------------------------------------------
  communication: [
    { id: 'internet', name: 'Internet', icon: '🌐', color: PALETTE.teal[300] },
    { id: 'mobile', name: 'Mobile', icon: '📱', color: PALETTE.teal[400] }
  ],

  // ---------------------------------------------------------------
  // 11) Subscriptions
  // ---------------------------------------------------------------
  subscriptions: [
    { id: 'streaming_video', name: 'Streaming Video', icon: '📺', color: PALETTE.indigo[300] },
    { id: 'music_audio', name: 'Music / Audio', icon: '🎧', color: PALETTE.indigo[400] },
    { id: 'cloud_storage', name: 'Cloud Storage', icon: '☁️', color: PALETTE.indigo[300] },
    { id: 'apps_tools', name: 'Apps / Tools', icon: '🛠️', color: PALETTE.indigo[400] },
    { id: 'other_subscriptions', name: 'Other Subscriptions', icon: '📦', color: PALETTE.indigo[200] }
  ],

  // ---------------------------------------------------------------
  // 12) Travel
  // ---------------------------------------------------------------
  travel: [
    { id: 'flights', name: 'Flights', icon: '✈️', color: PALETTE.blue[500] },
    { id: 'lodging', name: 'Lodging / Hotel', icon: '🏨', color: PALETTE.blue[400] },
    { id: 'activities', name: 'Activities', icon: '🎒', color: PALETTE.blue[300] },
    { id: 'travel_transport', name: 'Local Transport', icon: '🚌', color: PALETTE.blue[300] }
  ],

  // ---------------------------------------------------------------
  // 13) Insurance
  // ---------------------------------------------------------------
  insurance: [
    { id: 'home_insurance', name: 'Home Insurance', icon: '🏠', color: PALETTE.orange[400] },
    { id: 'health_insurance', name: 'Health Insurance', icon: '🩺', color: PALETTE.red[300] },
    { id: 'life_insurance', name: 'Life Insurance', icon: '❤️', color: PALETTE.red[400] },
    { id: 'pet_insurance', name: 'Pet Insurance', icon: '🐾', color: PALETTE.green[400] }
  ],

  // ---------------------------------------------------------------
  // 14) Donations
  // ---------------------------------------------------------------
  donations: [
    { id: 'general', name: 'General Donations', icon: '🙏', color: PALETTE.rose[300] },
    { id: 'religious', name: 'Religious / Nonprofit', icon: '⛪', color: PALETTE.rose[400] },
    { id: 'fundraiser', name: 'Fundraisers', icon: '🎗️', color: PALETTE.rose[500] }
  ],

  // ---------------------------------------------------------------
  // 15) Savings & Investment
  // ---------------------------------------------------------------
  savings: [
    { id: 'monthly_savings', name: 'Monthly Savings', icon: '💰', color: PALETTE.green[500] },
    { id: 'emergency', name: 'Emergency Fund', icon: '🚨', color: PALETTE.green[300] },
    { id: 'investing', name: 'Investing Contribution', icon: '📈', color: PALETTE.green[600] },
    { id: 'retirement', name: 'Retirement (IRA / 401K)', icon: '🏦', color: PALETTE.green[400] }
  ]
} as const

// ===============================================================
// 3. EXPORT
// ===============================================================

export const CATEGORIES: Category[] = Object.entries(CATEGORY_META).map(
  ([id, meta]) => ({
    id,
    name: meta.name,
    icon: meta.icon,
    color: meta.color,
    type: meta.type,
    subCategories: SUBCATEGORIES[id] ?? []
  })
)
