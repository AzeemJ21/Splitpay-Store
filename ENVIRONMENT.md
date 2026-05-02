# Store environment variables

Set these on the **splitpay-store** Render Web Service (same values for server and public URL unless you split internal vs public hosts).

| Variable | Example |
|----------|---------|
| `SPLITPAY_API_URL` | `https://splitpay-dashboard.onrender.com` |
| `NEXT_PUBLIC_SPLITPAY_API_URL` | `https://splitpay-dashboard.onrender.com` |

Use the **exact** dashboard URL (HTTPS, no trailing slash). Server routes (`/api/verify-code`, `/api/checkout`) call the dashboard using `SPLITPAY_API_URL`; `NEXT_PUBLIC_SPLITPAY_API_URL` is the same base for any **client-side** calls (see `src/lib/splitpay-api.ts`).

Optional:

| Variable | Notes |
|----------|--------|
| `SPLITPAY_MERCHANT_API_KEY` | Dashboard user `apiKey` if you want real `/api/split-payment` calls; otherwise checkout simulates. |

Deploy the **dashboard** first, then point both URLs at its production hostname.
