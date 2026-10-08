# EcoEats

EcoEats is a hyperlocal surplus-food marketplace. The application uses Supabase
for authentication and PostgreSQL, with inventory reserved during checkout and
confirmed only by a verified Razorpay webhook.

## Razorpay payment flow

1. The client checks out its cart through `checkout_cart()` and receives a
   `PENDING_PAYMENT` order with an `ACTIVE` 10-minute reservation.
2. The client calls `POST /api/orders/:orderId/razorpay-order` with its Supabase
   bearer token. The route reads the order amount from PostgreSQL, creates a
   Razorpay Order server-side, and returns only the public Razorpay key and
   checkout configuration.
3. Razorpay sends `payment.captured` or `payment.failed` to
   `POST /api/razorpay/webhook`. The route verifies the raw-body HMAC before it
   changes any data.
4. Private database functions atomically convert a successful reservation or
   release inventory for a failed payment. Browser callbacks never confirm an
   order.

Configure a test Razorpay webhook for:

```text
https://your-domain.example/api/razorpay/webhook
```

Subscribe to `payment.captured` and `payment.failed`. Set the same webhook secret
in Razorpay and `RAZORPAY_WEBHOOK_SECRET`.

Copy `.env.example` to `.env.local` and provide Razorpay test credentials before
calling the payment-order endpoint.

## Getting started

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
