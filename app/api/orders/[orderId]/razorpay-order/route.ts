import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { sql } from "@/lib/db/client";
import { amountToPaise, createRazorpayOrder } from "@/lib/payments/razorpay";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

function getSupabaseClient(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authorization = request.headers.get("authorization");

  if (!url || !key || !authorization) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const supabase = getSupabaseClient(request);

  if (!supabase) {
    return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  }

  const { orderId } = await context.params;
  let prepared: { id: string; total_amount: string; razorpay_order_id: string | null };

  try {
    prepared = await sql.begin(async (transaction) => {
      const [order] = await transaction<{
        id: string;
        total_amount: string;
        status: string;
      }[]>`
        select id, total_amount, status
        from public.orders
        where id = ${orderId}::uuid
          and user_id = ${data.user.id}::uuid
        for update
      `;

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status !== "PENDING_PAYMENT") {
        throw new Error("Order is not awaiting payment");
      }

      const [{ payable }] = await transaction<{ payable: boolean }[]>`
        select exists (
          select 1
          from public.inventory_reservations
          where order_id = ${order.id}::uuid
            and status = 'ACTIVE'
            and expires_at > now()
        ) as payable
      `;

      if (!payable) {
        throw new Error("Payment reservation has expired");
      }

      const [payment] = await transaction<{
        razorpay_order_id: string | null;
        status: string;
      }[]>`
        select razorpay_order_id, status
        from public.payments
        where order_id = ${order.id}::uuid
        for update
      `;

      if (payment && payment.status !== "PENDING") {
        throw new Error("Payment has already been finalized");
      }

      return {
        id: order.id,
        total_amount: order.total_amount,
        razorpay_order_id: payment?.razorpay_order_id ?? null,
      };
    });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Unable to prepare payment";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  if (prepared.razorpay_order_id) {
    return NextResponse.json({
      key: process.env.RAZORPAY_KEY_ID,
      orderId: prepared.razorpay_order_id,
      amount: amountToPaise(prepared.total_amount),
      currency: "INR",
    });
  }

  try {
    const razorpayOrder = await createRazorpayOrder({
      amount: amountToPaise(prepared.total_amount),
      receipt: `ecoeats_${prepared.id.replaceAll("-", "")}`,
      ecoeatsOrderId: prepared.id,
    });

    await sql.begin(async (transaction) => {
      const [existing] = await transaction<{ razorpay_order_id: string | null }[]>`
        select razorpay_order_id
        from public.payments
        where order_id = ${prepared.id}::uuid
        for update
      `;

      if (existing?.razorpay_order_id) {
        return;
      }

      if (!existing) {
        await transaction`
          insert into public.payments (order_id, amount, status, razorpay_order_id)
          values (${prepared.id}::uuid, ${prepared.total_amount}::numeric, 'PENDING', ${razorpayOrder.id})
        `;
        return;
      }

      await transaction`
        update public.payments
        set razorpay_order_id = ${razorpayOrder.id}
        where order_id = ${prepared.id}::uuid
      `;
    });

    return NextResponse.json({
      key: process.env.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Unable to create Razorpay order";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
