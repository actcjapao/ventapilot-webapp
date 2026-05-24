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
