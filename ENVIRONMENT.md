# Store environment variables

Set these on the **splitpay-store** Render Web Service.

| Variable | Example |
|----------|---------|
| `SPLITPAY_API_URL` | `https://your-dashboard.onrender.com` |
| `NEXT_PUBLIC_SPLITPAY_API_URL` | Same as above (HTTPS, **no trailing slash**) |

Server routes (`/api/verify-code`, `/api/checkout`) call the dashboard using `SPLITPAY_API_URL`.

## Demo link to the dashboard (notifications + transactions)

| Variable | Notes |
|----------|--------|
| `DEMO_STORE_SECRET` | **Same string** as `DEMO_STORE_SECRET` on the dashboard. After a simulated SplitPay checkout, the store posts to `/api/demo/store-purchase` so the customer (split code) sees a **bell notification** and a **transaction** on the dashboard. If unset, checkout still succeeds locally but nothing is written to the dashboard. |

Deploy the **dashboard** first, set **`STORE_URL`** on the dashboard to this store’s public origin (CORS), then point both URLs here at the dashboard hostname.
