# Backlog

This will serve as my guide throughout the development, deployment, & monitoring of the app.

### Icon Legend:

- ✅completed items
- ⚙️work in-progress items
- 📝to-do items

## High Priority

- [✅] Implement user table
- [✅] Implement user registration functionality
   - Creates new user & its store
- [✅] Add login page & implement login functionality
- [⚙️] Implement store dashboard
- [✅] Implement product page and list all products
- [✅] Implement add product
- [✅] Implement update product
- [📝] Implement delete product
- [📝] Implement search product

Infra side

- [📝] Continue with the CI/CD pipeline setup
   - Finalize the app (sessioning, product list caching, product list searching, proper filterings)

## Medium Priority

## Low Priority

## Done Items

## Server side pending works

- [📝] Middleware non-authenticated user redirection
- [📝] Clean other controllers with service-action architecture like dashboard
- [📝] Create customre quests
- [📝] Implement dashboard data filter weekly, monthly, and soon yearly

sales
-id
-uuid
-store_id
-user_id
-total_amount
-payment_method (cash, card, gcash) -> default(cash)
-payment_amount
-change_amount
-status (completed, failed)
-notes (optional)
-created_at
-updated_at

sale_items
-id
-uuid
-sale_id
-product_id
-quantity
-unit_price
-total_price
-created_at
-updated_at

debts
-id
-uuid
-store_id
-user_id
-total_amount (initially same value)
-balance_due (initially same value)
-due_date (optional)
-status (open, paid, partial, overdue)
-created_at
-updated_at

debt_items
-id
-uuid
-debt_id
-product_id
-quantity
-unit_price
-total_price
-created_at
-updated_at

debt_payments
-id
-uuid
-debt_id
-amount
-paid_at
-payment_method (cash, card, gcash) -> default(cash)

subscriptions

- id
- uuid

- user_id
- plan (trial, premium)
- status
   - trialing (trial phase)
   - active (subscribe to premium)
   - past_due (didn't renew the subscribed premium plan with the given grace period like 3 -5days)
   - canceled (canceled the premium plan)
   - expired (after the grace period from past_due state, if no payment renewal was made - mark as expired)
- billing_cycle (monthly, yearly)
- trial_start_at
- trial_end_at
- current_period_start_at
- current_period_end_at
- next_billing_at
- cancel_at_period_end
- canceled_at
- created_at
- updated_at

payments
// payment gateway related fields

- id
- uuid

- subscription_id
- amount
- currency (peso)
- status -- pending, paid, failed

- payment_provider
- provider_payment_id
- provider_customer_id
- provider_subscription_id

- paid_at
- created_at

### To take note on environment setup in production (Hostinger)

- make sure APP_NAME=set
- make sure APP_KEY=generated
- make sure APP_ENV=production
- make sure APP_URL=properly set
- make sure SESSION_DRIVER=file
