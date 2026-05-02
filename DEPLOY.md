# Deploy SplitPay Store on Render

This is a **separate** Render service from the SplitPay **dashboard**. Deploy the dashboard first and note its public URL.

## Prerequisites

- Dashboard deployed and URL known (e.g. `https://splitpay-dashboard.onrender.com`).
- Repo pushed to Git provider Render can access.

## Option A: Blueprint (`render.yaml`)

1. Render: **New** → **Blueprint** → select this store repo/branch.
2. Confirm the web service `splitpay-store` is created.
3. Set `SPLITPAY_API_URL` and `NEXT_PUBLIC_SPLITPAY_API_URL` to your dashboard URL (see `ENVIRONMENT.md`).
4. Deploy.

## Option B: Manual Web Service

1. **New** → **Web Service** → root = store project root.
2. **Build:** `npm install && npm run build`
3. **Start:** `npm start`
4. Add env vars from `ENVIRONMENT.md`.

## After deploy

1. Copy the store URL (e.g. `https://splitpay-store.onrender.com`).
2. On the **dashboard** Render service, set `STORE_URL` to that store URL and redeploy the dashboard (CORS for verify-code / split-payment).
3. On the **dashboard**, ensure `NEXTAUTH_URL` is the dashboard URL only (not the store).

## Local vs production

Locally, `splitpay-api.ts` defaults to `http://localhost:3000` when env vars are unset. Production must set both `SPLITPAY_*` variables.

## Troubleshooting

- **Verify code fails:** Dashboard must have `STORE_URL` matching this store; both services HTTPS.
- **Checkout simulation only:** Set `SPLITPAY_MERCHANT_API_KEY` if calling real split-payment API.
