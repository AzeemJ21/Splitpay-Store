/**
 * SplitPay dashboard API base URL (no trailing slash).
 * Server routes prefer `SPLITPAY_API_URL`; fall back to `NEXT_PUBLIC_SPLITPAY_API_URL`, then localhost.
 */
export const SPLITPAY_API_BASE_URL =
  process.env.SPLITPAY_API_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_SPLITPAY_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

/** Client-side / shared public dashboard URL (browser and any `NEXT_PUBLIC_*` context). */
export const SPLITPAY_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_SPLITPAY_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
