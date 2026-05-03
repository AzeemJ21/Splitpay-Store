import { NextResponse } from "next/server";
import { SPLITPAY_API_BASE_URL } from "@/lib/splitpay-api";

export const runtime = "nodejs";

type OrderDetails = {
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type CardDetails = {
  cardNumber: string;
  expiry: string;
  cvv: string;
  nameOnCard: string;
};

type SplitPayDetails = {
  splitCode: string;
  userId?: string;
  card1: { number: string; expiry: string; cvv: string; amount: number };
  card2: { number: string; expiry: string; cvv: string; amount: number };
};

type CheckoutBody = {
  paymentMethod: "card" | "splitpay";
  orderTotal: number;
  orderDetails: OrderDetails;
  cardDetails?: CardDetails;
  splitPayDetails?: SplitPayDetails;
};

function simulateOutcome(): { success: boolean; error?: string } {
  if (Math.random() <= 0.05) {
    return { success: false, error: "Card declined. Please try another card." };
  }
  return { success: true };
}

function simulateSplitPayOutcome(): { success: boolean; error?: string } {
  if (Math.random() <= 0.05) {
    return { success: false, error: "Split payment could not be completed. Please try again." };
  }
  return { success: true };
}

async function delay(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function recordDemoPurchaseOnDashboard(params: {
  base: string;
  secret: string;
  splitCode: string;
  amount: number;
  orderId: string;
  card1Amount: number;
  card2Amount: number;
}): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const { base, secret, splitCode, amount, orderId, card1Amount, card2Amount } = params;
  let res: Response;
  try {
    res = await fetch(`${base}/api/demo/store-purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Demo-Store-Secret": secret,
      },
      body: JSON.stringify({
        splitCode,
        amount,
        orderId,
        card1Amount,
        card2Amount,
      }),
    });
  } catch {
    return { ok: false, status: 502, message: "Could not reach the dashboard. Check SPLITPAY_API_URL." };
  }

  const json = (await res.json().catch(() => ({}))) as { data?: { success?: boolean }; error?: string; message?: string };
  if (res.ok && json?.data?.success) {
    return { ok: true };
  }
  const message =
    (typeof json.message === "string" && json.message) ||
    (typeof json.error === "string" && json.error) ||
    "Dashboard did not record the purchase.";
  return { ok: false, status: res.status >= 400 && res.status < 600 ? res.status : 502, message };
}

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.orderDetails?.email || !body.paymentMethod || typeof body.orderTotal !== "number") {
    return NextResponse.json({ success: false, error: "Missing order details" }, { status: 400 });
  }

  const orderId = `ORD-${Date.now()}`;

  if (body.paymentMethod === "card") {
    await delay(1500);
    const sim = simulateOutcome();
    if (!sim.success) {
      return NextResponse.json({ success: false, error: sim.error });
    }
    return NextResponse.json({ success: true, orderId });
  }

  const sp = body.splitPayDetails;
  if (!sp || !sp.splitCode) {
    return NextResponse.json({ success: false, error: "Missing SplitPay details" }, { status: 400 });
  }

  const sum = sp.card1.amount + sp.card2.amount;
  if (Math.round(sum * 100) !== Math.round(body.orderTotal * 100)) {
    return NextResponse.json(
      { success: false, error: "SplitPay card amounts must match order total" },
      { status: 400 },
    );
  }

  await delay(1500);
  const sim = simulateSplitPayOutcome();
  if (!sim.success) {
    return NextResponse.json({ success: false, error: sim.error });
  }

  const base = SPLITPAY_API_BASE_URL;
  const demoSecret = process.env.DEMO_STORE_SECRET?.trim();

  if (!demoSecret) {
    return NextResponse.json({
      success: true,
      orderId,
      source: "simulated",
      dashboardSynced: false,
      warning: "Set DEMO_STORE_SECRET on the store (and the same value on the dashboard) to show this purchase on the customer dashboard.",
    });
  }

  const recorded = await recordDemoPurchaseOnDashboard({
    base,
    secret: demoSecret,
    splitCode: sp.splitCode.trim(),
    amount: body.orderTotal,
    orderId,
    card1Amount: sp.card1.amount,
    card2Amount: sp.card2.amount,
  });

  if (!recorded.ok) {
    return NextResponse.json(
      {
        success: false,
        error: recorded.message,
        code: "DASHBOARD_DEMO_SYNC_FAILED",
      },
      { status: recorded.status },
    );
  }

  return NextResponse.json({
    success: true,
    orderId,
    source: "simulated",
    dashboardSynced: true,
  });
}
