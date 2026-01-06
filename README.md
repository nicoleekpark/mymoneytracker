# WIP

## Table of Contents
- [WIP](#wip)
  - [Table of Contents](#table-of-contents)
- [HoH Finance Tracker](#hoh-finance-tracker)
  - [Overview](#overview)
  - [Idea](#idea)
  - [Breakdown](#breakdown)
    - [Tabs](#tabs)
      - [Dashboard](#dashboard)
      - [Cashflow](#cashflow)
      - [Accounts](#accounts)
      - [Transactions](#transactions)
      - [Add Transaction](#add-transaction)
      - [Investments](#investments)
      - [Assets (Net Worth)](#assets-net-worth)
      - [Budget](#budget)
      - [Reports](#reports)
      - [Recurring](#recurring)
      - [Goal](#goal)
      - [Credit Score](#credit-score)
  - [Developer Guide](#developer-guide)
    - [Step 1. Developer Environment Setup](#step-1-developer-environment-setup)
      - [1.1 Install required softwares](#11-install-required-softwares)
      - [1.2 Mobile test](#12-mobile-test)
    - [Step 2. Create a Project](#step-2-create-a-project)
      - [2.1 In terminal](#21-in-terminal)
      - [2.2 Run project](#22-run-project)
      - [2.3 How to test](#23-how-to-test)
    - [Step 3. Update Project Structure](#step-3-update-project-structure)
    - [Step 4. Install TamaGUI](#step-4-install-tamagui)
      - [Step 4. Install sqlite](#step-4-install-sqlite)
      - [Step 5. Install dev client build (iOS)](#step-5-install-dev-client-build-ios)
      - [Step 6. How to run](#step-6-how-to-run)
      - [2.4 Database](#24-database)

# HoH Finance Tracker

## Overview
A cross platform application that provides flexible budget setting and tracking.

## Idea
- manual type in transaction
- every end of the day, it pulls daily cc usage from the bank and compare
- calendar view of how much spent etc
## Breakdown

### Tabs

#### Dashboard
Aggregated view of everything
- Current spend this month
  - graph view
  - compare to last month
  - compare manual input vs. automated (sync with the bank)
- Net worth
  - graph view
  - compare to last month
- Accounts
- Upcoming
#### Cashflow
#### Accounts
#### Transactions
#### Add Transaction
- One click adding transactions
#### Investments
#### Assets (Net Worth)
#### Budget
#### Reports
#### Recurring
#### Goal
#### Credit Score

## Developer Guide

### Step 1. Developer Environment Setup

#### 1.1 Install required softwares
```
$ node --version
v22.14.0

$ npm --version
10.9.2

$ git --version
git version 2.39.5 (Apple Git-154)
```

#### 1.2 Mobile test
- Method1: real phone
    - iOS & Android: Install `Expo Go`
- Method2: simulator
    - iOS: Xcode
    - Android: Android Studio

### Step 2. Create a Project
**npx command executes without installing**

#### 2.1 In terminal
```
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

To run your project, navigate to the directory and run one of the following npm commands.

- cd hoh_finance-tracker
- npm run android
- npm run ios
- npm run web
```

#### 2.2 Run project
1. Method1
```
$ npm start
$ npm run web
$ npm ios
```
As seen in `scripts` in `package.json`

2. Method2
```
$ npx expo
$ npx expo start --clear # clear cache

Starting project at /Users/parkhuynh/0_nicole/projects/hoh_finance-tracker
Starting Metro Bundler

[QR CODE]

› Metro waiting on exp://xxx.xxx.x.xxx:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Web is waiting on http://localhost:8081

› Using Expo Go
› Press s │ switch to development build

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
› shift+m │ more tools
› Press o │ open project code in your editor

› Press ? │ show all commands

Logs for your project will appear below. Press Ctrl+C to exit.
```

#### 2.3 How to test
- Web browser: w key
- iOS simulator: i key (Xcode needed)
- Android emulator: a key (Android Studio needed)
- Real phone: Scan QR code using Expo Go app



### Step 3. Update Project Structure

Based on [Expo dev suggestion](https://expo.dev/blog/expo-app-folder-structure-best-practices):

```
$ mkdir src
$ mv components src/
$ mv constants src/
$ mkdir src/lib src/store src/types src/utils
```

Update config so `@/` route points `src/ `
```
# in tsconfig.json

"compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": [
        "./src/*" # changed from "./*"
      ]
    }
}
```

Update necessary files pointing the right path
```
# in _layout.tsx

../assets/fonts/ -> ../../assets/fonts/

const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
```

Run `npx expo start --clear` and `w` to see if works.

### Step 4. Install TamaGUI

```
$ npm install tamagui @tamagui/config @tamagui/babel-plugin
```


#### Step 4. Install sqlite
```
$ npx expo install expo-sqlite
```

#### Step 5. Install dev client build (iOS)
```
$ eas build -p ios --profile development
```

#### Step 6. How to run
```
# Fastest, UI focus - quick test on simulator with Expo Go
$ npm run start:ios

# SQLite + Native check - test on simulator with dev-client mode
$ npm run start:dev:ios

# Big changes - need to rebuild native (add/update expo-sqlite, plugins change, iOS auth change, prebuild env change)
$ npm run build:ios
$ npm run start:dev:ios

# only server
$ npm run start:dev

# server + simulator
$ npm run start:dev:ios
```

#### 2.4 Database
