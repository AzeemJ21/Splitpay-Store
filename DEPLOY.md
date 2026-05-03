# Deploy SplitPay Store on Render

This is a **separate** Render service from the SplitPay **dashboard**. Deploy the dashboard first and note its public URL.

## Prerequisites

- Dashboard deployed and URL known (e.g. `https://splitpay-dashboard.onrender.com`).
- Repo pushed to Git provider Render can access.

## Option A: Blueprint (`render.yaml`)

1. Render: **New** → **Blueprint** → select this store repo/branch.
2. Confirm the web service `splitpay-store` is created.
3. Set `SPLITPAY_API_URL` and `NEXT_PUBLIC_SPLITPAY_API_URL` to your dashboard URL (see `ENVIRONMENT.md`).
4. Set **`DEMO_STORE_SECRET`** to the **exact same value** as on the dashboard service (demo storefront → customer notification + transaction).
5. Deploy.

## Option B: Manual Web Service

1. **New** → **Web Service** → root = store project root.
2. **Build:** `npm install && npm run build`
3. **Start:** `npm start`
4. Add env vars from `ENVIRONMENT.md`.

## After deploy

1. Copy the store URL (e.g. `https://splitpay-store.onrender.com`).
2. On the **dashboard** Render service, set `STORE_URL` to that store URL and redeploy the dashboard (CORS for verify-code, split-payment, and demo store-purchase).
3. On the **dashboard**, set `DEMO_STORE_SECRET` (match the store) and `NEXTAUTH_URL` to the dashboard URL only (not the store).

## Local vs production

Locally, `splitpay-api.ts` defaults to `http://localhost:3000` when env vars are unset. For a local demo, run the dashboard on `:3000`, the store on `:3001`, set `STORE_URL=http://localhost:3001` on the dashboard, and use the same `DEMO_STORE_SECRET` in both `.env` files.

## Troubleshooting

- **Verify code fails:** Dashboard must have `STORE_URL` matching this store; both services HTTPS.
- **Checkout succeeds but nothing on the dashboard:** Set `DEMO_STORE_SECRET` on **both** services to the same string; redeploy dashboard after `STORE_URL` changes.
