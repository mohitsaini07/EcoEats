-- Keep Razorpay's Order ID separate from the captured Payment ID stored in
-- payments.transaction_id. The order ID is the stable key used by webhooks.
alter table public.payments
  add column if not exists razorpay_order_id text;

create unique index if not exists payments_razorpay_order_id_key
  on public.payments (razorpay_order_id)
  where razorpay_order_id is not null;

create or replace function public.confirm_razorpay_payment(
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_payment_method text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_payment_id uuid;
  v_payment_status text;
  v_transaction_id text;
  v_order_status text;
begin
  select p.id, p.status, p.transaction_id, o.id, o.status
    into v_payment_id, v_payment_status, v_transaction_id, v_order_id, v_order_status
  from public.payments p
  join public.orders o on o.id = p.order_id
  where p.razorpay_order_id = p_razorpay_order_id
  for update of p, o;

  if v_payment_id is null then
    raise exception 'Unknown Razorpay order';
  end if;

  -- Razorpay retries webhooks. Replaying the same captured payment is safe.
  if v_payment_status = 'SUCCESS' and v_transaction_id = p_razorpay_payment_id then
    return v_order_id;
  end if;

  if v_payment_status <> 'PENDING' or v_order_status <> 'PENDING_PAYMENT' then
    raise exception 'Order is not awaiting payment';
  end if;

  perform 1
  from public.inventory_reservations
  where order_id = v_order_id
  order by id
  for update;

  if not exists (
    select 1
    from public.inventory_reservations
    where order_id = v_order_id
  ) or exists (
    select 1
    from public.inventory_reservations
    where order_id = v_order_id
      and (status <> 'ACTIVE' or expires_at <= now())
  ) then
    raise exception 'Order reservation is no longer payable';
  end if;

  update public.payments
  set status = 'SUCCESS',
      transaction_id = p_razorpay_payment_id,
      payment_method = nullif(p_payment_method, ''),
      paid_at = now()
  where id = v_payment_id;

  update public.inventory_reservations
  set status = 'CONVERTED',
      converted_at = now()
  where order_id = v_order_id
    and status = 'ACTIVE';

  update public.orders
  set status = 'CONFIRMED'
  where id = v_order_id;

  return v_order_id;
end;
$$;

create or replace function public.fail_razorpay_payment(
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_payment_method text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_payment_id uuid;
  v_payment_status text;
  v_order_status text;
begin
  select p.id, p.status, o.id, o.status
    into v_payment_id, v_payment_status, v_order_id, v_order_status
  from public.payments p
  join public.orders o on o.id = p.order_id
  where p.razorpay_order_id = p_razorpay_order_id
  for update of p, o;

  if v_payment_id is null then
    raise exception 'Unknown Razorpay order';
  end if;

  if v_payment_status = 'FAILED' and v_order_status = 'PAYMENT_FAILED' then
    return v_order_id;
  end if;

  if v_payment_status = 'SUCCESS' or v_order_status = 'CONFIRMED' then
    raise exception 'Cannot fail a confirmed payment';
  end if;

  perform 1
  from public.inventory_reservations
  where order_id = v_order_id
  order by id
  for update;

  update public.food_listings fl
  set available_quantity = fl.available_quantity + reservation.quantity
  from public.inventory_reservations reservation
  where reservation.order_id = v_order_id
    and reservation.status = 'ACTIVE'
    and reservation.food_listing_id = fl.id;

  update public.inventory_reservations
  set status = 'EXPIRED'
  where order_id = v_order_id
    and status = 'ACTIVE';

  update public.payments
  set status = 'FAILED',
      transaction_id = coalesce(p_razorpay_payment_id, transaction_id),
      payment_method = coalesce(nullif(p_payment_method, ''), payment_method)
  where id = v_payment_id;

  update public.orders
  set status = 'PAYMENT_FAILED'
  where id = v_order_id;

  return v_order_id;
end;
$$;

revoke all on function public.confirm_razorpay_payment(text, text, text) from public;
revoke all on function public.fail_razorpay_payment(text, text, text) from public;
revoke all on function public.confirm_razorpay_payment(text, text, text) from anon, authenticated, service_role;
revoke all on function public.fail_razorpay_payment(text, text, text) from anon, authenticated, service_role;
