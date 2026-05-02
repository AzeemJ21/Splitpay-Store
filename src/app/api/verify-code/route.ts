import { NextResponse } from "next/server";
import { SPLITPAY_API_BASE_URL } from "@/lib/splitpay-api";

/**
 * Proxies to the dashboard SplitPay API so the browser does not need SPLITPAY_API_URL exposed.
 */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim();
  if (!code || !/^\d{4}$/.test(code)) {
    return NextResponse.json({ valid: false });
  }

  const base = SPLITPAY_API_BASE_URL;

  try {
    const url = `${base}/api/users/verify-code?code=${encodeURIComponent(code)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const data = (await res.json()) as unknown;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ valid: false });
  }
}
