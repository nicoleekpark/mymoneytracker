# Price Tracker

## Context
Price Tracker provides the user to better understand living cost they spend daily without noticing there might be a better option. People are so busy to compare one by one but this feature encourages the user to spend some good time to ultimately build a brain memory of how much things usually are so they can make smarter choice in purchasing things.

### User story
I want to have a centralized place for me to log and compare grocery item price (from different grocery stores) for me to deeply understand living expense and figure out the optimized grocery shopping plan. 

When I log transaction, it's just "grocery" "$ 58.00" and never know how this price was made. 

I want to be in control of comprehension of where and how I spend money so I can plan better.

### Features
- categorize
  - use "tag" system?
  - q: what's the best way to categorize items to track prices? ex. category 1: coffee from starbucks vs bluebottle -> these are coffee category 2: carrots from wholefood vs trader joes...-> these are grocervies
- insert
  - auto insertion
    - user add items in addTransaction page -> extract date, merchant, item, price and insert it in price tracker
  - manual insertion
    - user can manually insert the item directly on price tracker page - item, merchant, price, date are required
  - if the user puts 4lb carrot $ 50, then automatically calculate (price per pound or price per unit too) 
- view
  - chronological view
  - filter
    - multiple filter allowed
    - filter by item, grocery store, date, merchant
  - sort  
    - asc, desc by time
    - most expensive/least expensice
    - most frequently purchased/least frequently purchased
- update
  - no constraints
  - user can update whichever item in price tracker as they wish
- delete
  - no constraints
  - user can delete whichever item in price tracker as they wish
  - quick modal (with optional checkbox of "do not ask me today" when they delete the item)
- search
  - search by keyword matching item,node,price,etc.
  - search filter - refer amazon order history filter system
- analysis
  - user is able to view:
    - grocery price (how much they are spending over a month/year/all) trend
    - each item price trend
    - each grocery store price trend
    - etc
- scan barcode system? 
  - for price tracking? because price differs by weight/size
- note section for each item

### Design
- search bar
- filter 
- list view
- edit/delete button/function
- analytical view (ex. graph of carrot price in 5 different grocery stores over the years)
