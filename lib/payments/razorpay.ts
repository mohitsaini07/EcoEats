import { createHmac, timingSafeEqual } from "node:crypto";

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string | null;
};

type RazorpayErrorResponse = {
  error?: {
    description?: string;
  };
};

function requiredEnvironment(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

export function amountToPaise(amount: string | number): number {
  const normalized = String(amount);
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(normalized);

  if (!match) {
    throw new Error("Payment amount must have at most two decimal places");
  }

  const [, whole, fraction = ""] = match;
  const paise = BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));

  if (paise < BigInt(100) || paise > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Payment amount is outside Razorpay's supported range");
  }

  return Number(paise);
}

export async function createRazorpayOrder(input: {
  amount: number;
  receipt: string;
  ecoeatsOrderId: string;
}): Promise<RazorpayOrder> {
  const keyId = requiredEnvironment("RAZORPAY_KEY_ID");
  const keySecret = requiredEnvironment("RAZORPAY_KEY_SECRET");
  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: "INR",
      receipt: input.receipt,
      notes: { ecoeats_order_id: input.ecoeatsOrderId },
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as RazorpayErrorResponse | null;
    throw new Error(payload?.error?.description ?? "Razorpay could not create an order");
  }

  return (await response.json()) as RazorpayOrder;
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = requiredEnvironment("RAZORPAY_WEBHOOK_SECRET");
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = Buffer.from(signature, "utf8");
  const computed = Buffer.from(expected, "utf8");

  return received.length === computed.length && timingSafeEqual(received, computed);
}
