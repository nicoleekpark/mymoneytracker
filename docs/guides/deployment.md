# MyMoneyTracker v1 - App Store Publishing Guide

> Preparing MyMoneyTracker for initial App Store release

---

## Feature Audit Summary

### v1 Ready (Ship as-is)
| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard | Complete | All 6 modes: Monthly, Yearly, All-time, Accounts, Assets, Insights |
| Transactions | Complete | Full CRUD, filtering, search, drafts, undo |
| Add/Edit Transaction | Complete | Modal flow with categories, accounts, tags, itemization |
| Settings | Complete | Theme toggle, budget alerts |
| Drafts FAB | Complete | Global floating button for pending drafts |

### v1 Partial (Hide/Disable features)
| Feature | Issue | Action |
|---------|-------|--------|
| Price Tracker Tab | Missing add/edit/store UI | **Hide entire tab** |
| Notifications | Tap navigation not implemented | Keep display, disable tap actions |
| AppBar buttons | Search/Messages/Sign-out are stubs | Hide or make no-op |
| Goal Settings | Assets view has stub menu | Hide goal settings option |

### v2 Roadmap
- Price Tracker full implementation (add items, manage stores, price recording)
- Notification tap-to-navigate
- AppBar search functionality
- Goal setting and tracking
- Multi-device sync (if planned)

---

## Pre-Publishing Checklist

### 1. Code Cleanup
- [x] Hide Price Tracker tab from navigation (`src/app/(tabs)/_layout.tsx`)
- [x] Disable stub AppBar buttons - Search disabled, Messages disabled, Sign out removed (`src/shared/components/AppBar.tsx`)
- [x] Hide goal settings menu in Assets view (`src/features/dashboard/assets/AssetsBody.tsx`)
- [ ] Remove console.log statements (search: `console.log`)
- [ ] Remove excessive TODO comments from shipping code (or mark as v2)

### 2. App Configuration
- [x] Update `app.json`:
  - [x] `name`: "MyMoneyTracker"
  - [x] `slug`: "hoh-ledger"
  - [x] `version`: "1.0.0"
  - [x] `ios.bundleIdentifier`: "com.houseofhuynh.finance"
  - [x] `ios.buildNumber`: "1"
  - [x] `splash.backgroundColor`: "#121212" (dark mode)
  - [x] Camera/Photo permissions for future receipt capture
- [ ] **Create custom app icon** (1024x1024 PNG, no transparency)
  - Current: Default Expo icon at `assets/images/icon.png`
  - Tool: Use Figma, Sketch, or https://www.appicon.co/
- [ ] **Create custom splash screen** (recommend 1284x2778 for iPhone)
  - Current: Default at `assets/images/splash-icon.png`
- [x] EAS Build configured (`eas.json`)
  - Production: dev tools disabled, auto-increment build number

### 3. Apple Developer Setup
- [ ] Apple Developer Program membership ($99/year)
- [ ] Create App ID in Apple Developer Portal
- [ ] Create provisioning profiles (Distribution)
- [ ] Set up App Store Connect app listing

### 4. Build & Submit
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS Build
eas build:configure

# Create production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### 5. App Store Connect
- [ ] Screenshots (6.7", 6.5", 5.5" sizes minimum)
- [ ] App description
- [ ] Keywords
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Age rating questionnaire
- [ ] App Review information

---

## Feature Disabling Guide

### Hide Price Tracker Tab

**File:** `src/app/(tabs)/_layout.tsx`

```tsx
// Change from:
<Tabs.Screen
  name="price-tracker"
  options={{
    title: 'Prices',
    tabBarIcon: ({ color }) => <TabBarIcon name="tags" color={color} />
  }}
/>

// To:
<Tabs.Screen
  name="price-tracker"
  options={{
    href: null, // Hide from tab bar for v1
  }}
/>
```

### Hide AppBar Stub Buttons

**File:** `src/shared/components/AppBar.tsx`

Comment out or remove search, messages, and sign-out buttons until implemented.

### Hide Goal Settings

**File:** `src/features/dashboard/assets/AssetsBody.tsx`

Remove or hide the goal settings menu option (around line 631).

---

## Testing Checklist

### Core Flows
- [ ] Add expense transaction
- [ ] Add income transaction
- [ ] Add transfer between accounts
- [ ] Edit existing transaction
- [ ] Delete transaction (with undo)
- [ ] Save draft transaction
- [ ] Resume draft from FAB

### Dashboard
- [ ] Monthly view with navigation
- [ ] Yearly view with charts
- [ ] All-time cumulative view
- [ ] Accounts breakdown
- [ ] Assets/Net worth view
- [ ] Insights anomaly detection

### Settings
- [ ] Theme toggle (light/dark/system)
- [ ] Budget alert toggle
- [ ] Budget amount setting
- [ ] Alert threshold setting

### Edge Cases
- [ ] Empty state (no transactions)
- [ ] Large transaction count (100+)
- [ ] App backgrounding/foregrounding
- [ ] Low memory scenarios
- [ ] No network (should work offline)

---

## App Store Assets Needed

### Screenshots
Capture these screens for App Store listing:
1. Dashboard - Monthly overview
2. Dashboard - Insights with anomaly
3. Transactions list with search
4. Add transaction modal
5. Category selection
6. Settings screen

### App Icon
- 1024x1024 PNG, no transparency
- No rounded corners (iOS adds them)

### App Description Template
```
MyMoneyTracker - Your Personal Finance App

Track your spending, income, and transfers with ease. MyMoneyTracker helps you understand where your money goes with beautiful visualizations and smart insights.

Features:
• Dashboard with monthly, yearly, and all-time views
• Transaction tracking with categories and tags
• Multiple account support
• Smart spending insights and anomaly detection
• Budget alerts to stay on track
• Draft transactions for quick entry later
• Dark mode support

All your data stays on your device - no account required.
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | TBD | Initial release - Dashboard, Transactions, Settings |
| 1.1.0 | TBD | Price Tracker, enhanced notifications |

---

## Notes

- Price Tracker is partially complete and will be enabled in v1.1 or v2
- Notifications display works but tap-to-navigate is deferred
- Quick Chips work but persistence is in-memory only (acceptable for v1)
