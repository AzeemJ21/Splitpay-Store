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

  const base = SPLITPAY_API_BASE_URL;
  const merchantKey = process.env.SPLITPAY_MERCHANT_API_KEY;

  if (base && merchantKey) {
    const totalAmount = body.orderTotal;
    try {
      const res = await fetch(`${base}/api/split-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${merchantKey}`,
        },
        body: JSON.stringify({
          splitCode: sp.splitCode,
          totalAmount,
          card1: {
            number: sp.card1.number.replace(/\s/g, ""),
            expiry: sp.card1.expiry,
            cvv: sp.card1.cvv,
            amount: sp.card1.amount,
          },
          card2: {
            number: sp.card2.number.replace(/\s/g, ""),
            expiry: sp.card2.expiry,
            cvv: sp.card2.cvv,
            amount: sp.card2.amount,
          },
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as { data?: { success?: boolean } };
        if (json?.data?.success) {
          return NextResponse.json({ success: true, orderId, source: "splitpay-api" });
        }
      }
    } catch {
      // fall through to simulation
    }
  }

  await delay(1500);
  const sim = simulateSplitPayOutcome();
  if (!sim.success) {
    return NextResponse.json({ success: false, error: sim.error });
  }
  return NextResponse.json({ success: true, orderId, source: "simulated" });
}
