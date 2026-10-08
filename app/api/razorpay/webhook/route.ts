import { NextRequest, NextResponse } from "next/server";

import { sql } from "@/lib/db/client";
import { amountToPaise, verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";

export const runtime = "nodejs";

type RazorpayWebhook = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        method?: string;
      };
    };
  };
};

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-razorpay-signature");
  const rawBody = await request.text();

  if (!signature || !verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let webhook: RazorpayWebhook;

  try {
    webhook = JSON.parse(rawBody) as RazorpayWebhook;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (webhook.event !== "payment.captured" && webhook.event !== "payment.failed") {
    return NextResponse.json({ received: true, ignored: true });
  }

  const payment = webhook.payload?.payment?.entity;

  if (
    !payment?.id ||
    !payment.order_id ||
    typeof payment.amount !== "number" ||
    !Number.isSafeInteger(payment.amount)
  ) {
    return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
  }

  const [storedPayment] = await sql<{ amount: string }[]>`
    select amount
    from public.payments
    where razorpay_order_id = ${payment.order_id}
  `;

  // An account-wide Razorpay webhook can receive events belonging to other apps.
  if (!storedPayment) {
    return NextResponse.json({ received: true, ignored: true });
  }

  if (amountToPaise(storedPayment.amount) !== payment.amount) {
    return NextResponse.json({ error: "Payment amount does not match the order" }, { status: 400 });
  }

  try {
    if (webhook.event === "payment.captured") {
      await sql`
        select public.confirm_razorpay_payment(
          ${payment.order_id},
          ${payment.id},
          ${payment.method ?? ""}
        )
      `;
    } else {
      await sql`
        select public.fail_razorpay_payment(
          ${payment.order_id},
          ${payment.id},
          ${payment.method ?? ""}
        )
      `;
    }
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Unable to process payment";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  return NextResponse.json({ received: true });
}
