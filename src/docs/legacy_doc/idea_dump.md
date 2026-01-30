# Product Ideas & Requirements Dump

## Table of Contents

- [Project Overview](#project-overview)
- [Features for v1](#features-for-v1)
  - [Dashboard Tab](#dashboard-tab)
    - [Overview Mode](#overview-mode)
    - [Cash Flow Mode](#cash-flow-mode)
    - [Accounts Mode](#accounts-mode)
    - [Net Worth Mode](#net-worth-mode)
  - [Add Transaction (+ Button)](#add-transaction--button)
  - [Transactions Tab](#transactions-tab)
- [Features for v2](#features-for-v2)
  - [Family Functionality](#family-functionality)
  - [Co-owner Use Cases](#co-owner-use-cases)

---

## Project Overview

help me create prd(product requirements document). We're building:

A cross-platform personal finance app built with Expo/React Native and Tamagui. It supports iOS, Android, and web. The app uses expo-sqlite for local data persistence with a custom migration system.

features to include for v1:
- all design should be inspired (similar) by google calendar.
- dashboard tab:
  - Big toggle button (renders different data views): Overview, Cash Flow, Accounts, Net Worth.
  - Default view is Overview
    - Overview:
      -  The user can choose Month view (default current month) /Year view (default current year)/ All (the summary of entire year). Also There's a date picker that the user can choose specific month or year depending on which view (month view/year view) they're currently on.
      - Show "Budget" the user set and actual money spent.
      - month view:
        -  daily cash flow: provide a month calendar view of income/expense (each box(=each day)) has something like ($50.12) which is the sum of that day's expense and $0 which is the sum of that day's income. This is to provide the user an easy view of total month's spendings. User can toggle expense/income to display it on the calendar.
        - if the actual money spent >= budget, mark the date of the calendar when they passed the budget (so they can visualize)
      - monthly spending by category: provide a donut graph of spending by category with the total spending number (ex. $5,000) in the middle of the donut differentiated by colors. Below donut, show top 5 subcategory (Ex. Coffee/Snacks from Food category) with the amount spent and the percentage of total spendings
        - each part of the donut (each category) can be clicked which shows top 5 of each subcategories of chosen category. When user clicks total spent (middle of the donut), it comes back to regular donut graph with all categories
    - Cash Flow
      - TDB
    - Accounts
      - The user can view the start and end balance, spent/earned/transferred of each savings/checking accounts and any debt (credit card, loans etc) and cash
      - When they click one of the accounts, they can view the list of transactions related to that account desc order by date. Same view as transactions tab with "account filter"
    - Net Worth
      - Similar view of Robinhood investment app
        - A graph of total asset growth with x-axis of time (~ until today) and the user can click and drag to see the amount of total asset they have (gain/loss of money each day just like robinhood)
      - Below, Total Asset, Total Liability, Net Asset, Liquidifiable Assets section to display
- + button
  - + button is a modal "Add transaction" where user can manually type in transaction (ex. cash usage)
    - This modal benchmarks apple calender
      - the top left has "Cancel" button - Add transaction title - "Save" button
      - below: it has "expense" "income" "transfer" toggles which changes the form
        - expense: item/merchant/amount (when clicked, number pad like a calculator pops up. Saved in cents) / date/ account / category&subcategory / note / receipt image (camera or album. v2)
        - income: item/source/amount/date/account/note
        - transfer: item/amount/transfer from/transfer to/date/note
- transactions tab:
  - search bar with filter button
    - user can search any word and the search results with the highest match to least match show up for click
    - user can filter transactions by year, month, account, amount of money
  - show three sections horizontally: Total inflow of the month, Total outflow of the month, Total net inflow of the current month
    - Right below displays the list of transactions like below:
      - As the user scolls, the correct month changes and fixed on the top and displays total inflow of that month in green ($8,000) and total outflow of that month in red ($1,200)
      - Each transaction show the date of the month, item, total amount. Below is merchant and account
      - When the user clicks each transaction, it displays detailed information on that transaction (v2)

      JANUARY 2025                $ 8,000    $ 1,200
      -----------------------------------------------
      -----------------------------------------------
      15  Paychecks                          $ 8,000
          Employer Payroll       Chase Plus Checking
      ------------------------------------------------
      2   Sofa                               $ 1,200
          Joybird                     Chase Sapphire
      ------------------------------------------------
- v2
  - this app does not need any email or signup to lower the mental wall for users to start using the app
  - the biggest feature of this app is "family" functionality where family with kids can build a habit of logging their financials (under parents' guide)
  - or this can be useful for co-business owners such as co-airbnb owners where they want to see each spendings and aggregated stats
    - benchmark 1password where each user can only see certain things (rbac) set by the organizer
    - once organizer creates the family, up to 6 people can join by a unique link that's given to the organizer that they will share with the members. When they accept, the organizer has to reconfirm and accept the join request
    - each member can just set their username (just like a game)
    - dashboard will have different version for each user (family aggregated dashboard | user specific dashboard)
    - each user will be using this app (log transaction etc) just like any other financial budget app