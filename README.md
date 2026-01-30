# Project Overview

HoH Finance Tracker is a cross-platform personal finance app built with Expo/React Native and Tamagui. It supports iOS, Android, and web. The app uses expo-sqlite for local data persistence with a custom migration system.

# Developor Guide

## Step 1. Developer Environment Setup

### Install required softwares
```bash
$ node --version
v22.14.0

$ npm --version
10.9.2

$ git --version
git version 2.39.5 (Apple Git-154)
```

## Step 2. Create a Project and Set Up

```bash
# Create an expo app - npx command executes without installing
$ npx create-expo-app@latest hoh_finance-tracker --template tabs

Need to install the following packages:
create-expo-app@3.5.3
Ok to proceed? (y) y

Creating an Expo project using the tabs template.

✔ Downloaded and extracted project files.
> npm install
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported

added 732 packages, and audited 733 packages in 16s

63 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

✅ Your project is ready!

---
# install Tamagui
$ npm install tamagui @tamagui/config @tamagui/babel-plugin

---
# Install sqlite
$ npx expo install expo-sqlite

# Install dev client build (iOS)
$ eas build -p ios --profile development
```

### Update config so `@/` route points `src/` 
```bash
# In tsconfig.json

"compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": [
        "./src/*" # changed from "./*"
      ]
    }
}
```

### Update necessary files pointing the right path
```bash
# In _layout.tsx

../assets/fonts/ -> ../../assets/fonts/

const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
```


## Commands

```bash
# Run on iOS simulator with Expo Go (fastest, UI-only)
npm run start:ios

# Run on iOS with dev-client (required for SQLite/native features)
npm run start:dev:ios

# Rebuild native iOS (needed when adding/updating native modules)
npm run ios:run && npm run start:dev:ios

# Create a new database migration
npm run db:migration:new <migration_name>

# Regenerate migrations index
npm run db:migration:regen

# Export simulator database for inspection
npm run db:dev:pull

# Delete the app (reset the whole db)
$ xcrun simctl uninstall booted com.houseofhuynh.finance
```