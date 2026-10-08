## Project

EcoEats is a full-stack portfolio project: a **hyperlocal surplus-food marketplace**.

Restaurants/cafes/bakeries list unsold food near closing time at discounted prices. Customers discover, reserve, pay for, and pick up surplus food locally.

Primary goal: demonstrate strong full-stack engineering, especially PostgreSQL, RLS, transactions, concurrency, inventory reservation, payments, and authentication.

Do not overengineer with microservices.

## Stack

* Next.js + TypeScript
* Tailwind CSS + shadcn/ui
* Supabase PostgreSQL
* Supabase Auth
* `postgres.js`
* Server Actions / API routes as appropriate

## Core Rules

* One restaurant has exactly one manager in MVP.
* One manager can manage at most one restaurant.
* Food is sold as individual units.
* A `food_listing` represents a batch of identical food.
* A cart belongs to exactly one restaurant.
* A user can have only one `ACTIVE` cart; historical carts may be `CHECKED_OUT`.
* Checkout creates an order for one restaurant.
* Cart ≠ reservation.
* Inventory is temporarily reserved for **10 minutes** during checkout/payment.
* Successful payment converts the reservation.
* Failed/expired payment releases inventory.
* Historical order prices must never change.

## Database

Core tables:

```text
public.users
public.restaurants
public.food_listings
public.carts
public.cart_items
public.orders
public.order_items
public.inventory_reservations
public.payments
```

Relationships:

```text
users → restaurants
users → carts
users → orders
restaurants → food_listings
restaurants → orders
carts → cart_items
orders → order_items
orders → inventory_reservations
food_listings → cart_items
food_listings → order_items
food_listings → inventory_reservations
orders → payments (0..1)
```

### `public.users`

* `id` = `auth.users.id`
* roles: `CUSTOMER`, `RESTAURANT_MANAGER`, `ADMIN`
* users may manage only their own profile
* client users cannot assign/change privileged roles

### `public.restaurants`

* `manager_id` → `public.users.id`
* statuses: `PENDING`, `ACTIVE`, `SUSPENDED`, `CLOSED`
* manager can manage only their own restaurant
* prefer `CLOSED` over deleting historical restaurants

### `public.food_listings`

* `restaurant_id` → restaurant
* statuses: `DRAFT`, `ACTIVE`, `SOLD_OUT`, `EXPIRED`, `CANCELLED`
* `quantity` = original units
* `available_quantity` = currently available units
* price fields: `original_price`, `discounted_price`
* preserve pickup window with `pickup_start` / `pickup_end`

### `public.carts`

* statuses: `ACTIVE`, `CHECKED_OUT`
* partial unique index ensures one active cart per user:

```sql
CREATE UNIQUE INDEX one_active_cart_per_user
ON public.carts(user_id)
WHERE status = 'ACTIVE';
```

### `public.cart_items`

* `(cart_id, food_listing_id)` is unique
* do not store price here

### `public.orders`

* one order = one restaurant
* statuses:
  `PENDING_PAYMENT`, `CONFIRMED`, `PAYMENT_FAILED`,
  `EXPIRED`, `CANCELLED`, `COMPLETED`
* store `total_amount` as a financial snapshot
* pickup handled with `pickup_code` and `picked_up_at`
* client-side order INSERT is intentionally blocked

### `public.order_items`

* store historical `unit_price`
* `subtotal = quantity * unit_price`
* historical records should not be edited/deleted by clients

### `public.inventory_reservations`

* statuses: `ACTIVE`, `CONVERTED`, `EXPIRED`, `CANCELLED`
* reservation duration = 10 minutes
* client cannot directly create/update/delete reservations

### `public.payments`

* one payment per order in MVP
* statuses: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`
* `transaction_id` identifies the external gateway transaction
* client cannot mark payment successful

## Security / RLS

RLS is enabled on all core tables.

General rules:

```text
Customer:
- own profile
- active restaurants/listings
- own cart/cart items
- own orders/order items
- own reservations/payments

Restaurant Manager:
- own restaurant
- own food listings
- orders/order-items for own restaurant
- relevant reservations/payments
```

Never trust client input for:

* roles
* ownership
* prices
* totals
* inventory
* payment success

Sensitive writes should happen server-side.

## Checkout Architecture

Checkout is implemented through:

```text
public.checkout_cart()
```

The function should atomically:

1. authenticate the user
2. lock the active cart
3. lock relevant food-listing rows
4. validate restaurant/listing ownership
5. validate inventory
6. calculate totals from database prices
7. create `PENDING_PAYMENT` order
8. create `order_items`
9. create 10-minute `ACTIVE` reservations
10. decrement `available_quantity`
11. mark cart `CHECKED_OUT`
12. return `order_id`

Checkout must be atomic. Never rely on frontend inventory checks.

Concurrency example:

```text
available_quantity = 2
A requests 2
B requests 2

Only one may succeed.
```

## Payment Flow

Checkout and payment are separate.

```text
checkout
→ PENDING_PAYMENT order
→ ACTIVE reservation
→ payment gateway
→ verified webhook
→ SUCCESS
→ order CONFIRMED
→ reservation CONVERTED
```

Failure/timeout:

```text
payment failed/expired
→ order failed/expired
→ reservation EXPIRED
→ inventory restored
```

Never trust the browser to confirm payment.

## Existing Database State

Already completed:

* Supabase PostgreSQL setup
* `postgres.js` connection
* 9 core tables
* foreign keys and constraints
* indexes
* RLS policies
* user role protection
* `updated_at` trigger
* `checkout_cart()` RPC
* test manager/customer
* test restaurant
* test food listing
* test cart + cart item

Current test data includes:

```text
Test Cafe
Chocolate Croissant
10 total units
Customer cart contains 3 units
```

## Immediate Next Task

Test `checkout_cart()` through an **authenticated Supabase client session**, not directly from SQL Editor.

Expected result:

```text
order.status = PENDING_PAYMENT
order_item = Chocolate Croissant × 3
reservation.status = ACTIVE
reservation.quantity = 3
food_listing.available_quantity = 7
cart.status = CHECKED_OUT
```

After that:

1. verify checkout transaction
2. audit `SECURITY DEFINER` permissions
3. implement payment gateway/webhook
4. implement reservation expiration
5. build application UI/flows

## Development Principles

* Prefer database-enforced integrity.
* Keep security-sensitive logic server-side.
* Preserve historical transaction data.
* Design for concurrency.
* Keep MVP simple.
* Reuse existing schema unless there is a clear architectural reason to change it.
* Before changing the database model, explain the impact on existing relationships and flows.
* Do not duplicate tables, constraints, indexes, or policies that already exist.
