"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { useCart } from "@/store/useCart";
import { COUNTRIES } from "@/lib/countries";
import { formatCardNumberDigits, formatExpiryMmYy, parseAmountInput } from "@/lib/format-card";
import { cn } from "@/lib/utils";
import { PaymentProcessingModal } from "./PaymentProcessingModal";

function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function CheckoutClient() {
  const items = useCart((s) => s.items);
  const getTotal = useCart((s) => s.total);
  const clearCart = useCart((s) => s.clearCart);

  const orderTotal = getTotal();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("US");

  const [paymentMethod, setPaymentMethod] = useState<"card" | "splitpay">("card");

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");

  const [splitCode, setSplitCode] = useState("");
  const [splitConnectLoading, setSplitConnectLoading] = useState(false);
  const [splitUserName, setSplitUserName] = useState<string | null>(null);
  const [splitUserId, setSplitUserId] = useState<string | null>(null);
  const [splitCodeError, setSplitCodeError] = useState<string | null>(null);

  const [spC1Number, setSpC1Number] = useState("");
  const [spC1Exp, setSpC1Exp] = useState("");
  const [spC1Cvv, setSpC1Cvv] = useState("");
  const [spC1Amount, setSpC1Amount] = useState("");

  const [spC2Number, setSpC2Number] = useState("");
  const [spC2Exp, setSpC2Exp] = useState("");
  const [spC2Cvv, setSpC2Cvv] = useState("");
  const [spC2Amount, setSpC2Amount] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"card" | "splitpay" | null>(null);
  const [cardProcessing, setCardProcessing] = useState(false);
  const [splitStep, setSplitStep] = useState(0);
  const [result, setResult] = useState<"idle" | "success" | "failure">("idle");
  const [orderId, setOrderId] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  /** True when SplitPay checkout recorded a demo row on the dashboard. */
  const [liveSplitpayRecorded, setLiveSplitpayRecorded] = useState(false);
  const [successHint, setSuccessHint] = useState<string | undefined>();

  const a1 = parseAmountInput(spC1Amount);
  const a2 = parseAmountInput(spC2Amount);
  const sum = a1 + a2;
  const diff = orderTotal - sum;
  const match =
    orderTotal > 0 && Math.round(a1 * 100) + Math.round(a2 * 100) === Math.round(orderTotal * 100);
  const short = sum < orderTotal - 0.001;
  const over = sum > orderTotal + 0.001;

  const barMax = useMemo(() => {
    if (over || orderTotal <= 0) return Math.max(a1 + a2, 0.01);
    return orderTotal;
  }, [a1, a2, over, orderTotal]);
  const w1 = orderTotal > 0 ? (a1 / barMax) * 100 : 0;
  const w2 = orderTotal > 0 ? (a2 / barMax) * 100 : 0;
  const wRem = Math.max(0, 100 - w1 - w2);

  const canPlaceOrder = useCallback(() => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !address1.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      return false;
    }
    if (paymentMethod === "card") {
      const n = cardNumber.replace(/\D/g, "");
      return n.length >= 15 && cardExpiry.length >= 4 && cardCvv.length >= 3 && nameOnCard.trim().length > 0;
    }
    if (!splitUserName || !match) return false;
    const n1 = spC1Number.replace(/\D/g, "");
    const n2 = spC2Number.replace(/\D/g, "");
    if (n1.length < 8 || n2.length < 8) return false;
    if (spC1Exp.length < 4 || spC2Exp.length < 4) return false;
    if (spC1Cvv.length < 3 || spC2Cvv.length < 3) return false;
    return true;
  }, [
    fullName,
    email,
    phone,
    address1,
    city,
    state,
    zip,
    paymentMethod,
    cardNumber,
    cardExpiry,
    cardCvv,
    nameOnCard,
    splitUserName,
    match,
    spC1Number,
    spC2Number,
    spC1Exp,
    spC2Exp,
    spC1Cvv,
    spC2Cvv,
  ]);

  const placeDisabled = !canPlaceOrder();

  const handleConnectSplitPay = async () => {
    const code = splitCode.trim();
    if (!/^\d{4}$/.test(code)) {
      setSplitCodeError("Enter a valid 4-digit code.");
      return;
    }
    setSplitConnectLoading(true);
    setSplitCodeError(null);
    try {
      const res = await fetch(`/api/verify-code?code=${encodeURIComponent(code)}`);
      const data = (await res.json()) as { valid?: boolean; name?: string; userId?: string };
      if (data.valid && data.name) {
        setSplitUserName(data.name);
        setSplitUserId(data.userId ?? null);
      } else {
        setSplitUserName(null);
        setSplitUserId(null);
        setSplitCodeError("Invalid SplitPay code. Please check and try again.");
      }
    } catch {
      setSplitCodeError("Could not reach SplitPay. Try again.");
      setSplitUserName(null);
    } finally {
      setSplitConnectLoading(false);
    }
  };

  const runSplitAnimation = useCallback(async () => {
    for (let i = 0; i < 4; i++) {
      setSplitStep(i);
      await new Promise((r) => setTimeout(r, 1000));
    }
    setSplitStep(4);
  }, []);

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder()) return;
    if (paymentMethod === "splitpay" && !match) return;

    setResult("idle");
    setOrderId(undefined);
    setErrorMessage(undefined);
    setLiveSplitpayRecorded(false);
    setSuccessHint(undefined);
    setModalOpen(true);
    setModalMode(paymentMethod);
    setSplitStep(0);
    setCardProcessing(paymentMethod === "card");

    const orderDetails = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address1: address1.trim(),
      address2: address2.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      country,
    };

    const payload: Record<string, unknown> = {
      paymentMethod,
      orderTotal,
      orderDetails,
    };

    if (paymentMethod === "card") {
      payload.cardDetails = {
        cardNumber: cardNumber.replace(/\s/g, ""),
        expiry: cardExpiry,
        cvv: cardCvv,
        nameOnCard: nameOnCard.trim(),
      };
    } else {
      payload.splitPayDetails = {
        splitCode: splitCode.trim(),
        userId: splitUserId ?? undefined,
        card1: {
          number: spC1Number.replace(/\s/g, ""),
          expiry: spC1Exp,
          cvv: spC1Cvv,
          amount: a1,
        },
        card2: {
          number: spC2Number.replace(/\s/g, ""),
          expiry: spC2Exp,
          cvv: spC2Cvv,
          amount: a2,
        },
      };
    }

    const fetchPromise = fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      const j = (await res.json()) as {
        success?: boolean;
        orderId?: string;
        error?: string;
        source?: string;
        dashboardSynced?: boolean;
        warning?: string;
      };
      return { ok: res.ok, ...j };
    });

    try {
      if (paymentMethod === "card") {
        const data = await fetchPromise;
        setCardProcessing(false);
        if (data.success && data.orderId) {
          clearCart();
          setOrderId(data.orderId);
          setResult("success");
        } else {
          setErrorMessage(data.error || "Payment failed.");
          setResult("failure");
        }
      } else {
        const [data] = await Promise.all([fetchPromise, runSplitAnimation()]);
        if (data.success && data.orderId) {
          clearCart();
          setOrderId(data.orderId);
          setLiveSplitpayRecorded(Boolean(data.dashboardSynced));
          setSuccessHint(typeof data.warning === "string" ? data.warning : undefined);
          setResult("success");
        } else {
          setErrorMessage(data.error || "Payment failed.");
          setResult("failure");
        }
      }
    } catch {
      setCardProcessing(false);
      setErrorMessage("Network error. Try again.");
      setResult("failure");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-dark-900 shadow-sm placeholder:text-zinc-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20";

  const handleTryAgain = () => {
    setModalOpen(false);
    setResult("idle");
    setCardProcessing(false);
    setSplitStep(0);
    setErrorMessage(undefined);
    setOrderId(undefined);
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setNameOnCard("");
    setSpC1Number("");
    setSpC1Exp("");
    setSpC1Cvv("");
    setSpC1Amount("");
    setSpC2Number("");
    setSpC2Exp("");
    setSpC2Cvv("");
    setSpC2Amount("");
    setSplitCode("");
    setSplitUserName(null);
    setSplitUserId(null);
    setSplitCodeError(null);
    setLiveSplitpayRecorded(false);
    setSuccessHint(undefined);
  };

  const handleContinueShopping = () => {
    setModalOpen(false);
    setResult("idle");
  };

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <h1 className="font-heading text-3xl font-bold text-dark-900">Checkout</h1>
        <p className="mt-1 text-sm text-dark-800/70">
          Secure checkout — payments are simulated. SplitPay checkout can still post to your dashboard when{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">DEMO_STORE_SECRET</code> matches on both apps.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-3 space-y-10">
            <section>
              <h2 className="font-heading text-lg font-semibold text-dark-900">Contact &amp; shipping</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-dark-800">Full name</label>
                  <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-dark-800">Email</label>
                  <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-dark-800">Phone</label>
                  <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-dark-800">Address line 1</label>
                  <input className={inputClass} value={address1} onChange={(e) => setAddress1(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-dark-800">Address line 2 (optional)</label>
                  <input className={inputClass} value={address2} onChange={(e) => setAddress2(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-dark-800">City</label>
                  <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-dark-800">State / Province</label>
                  <input className={inputClass} value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-dark-800">ZIP</label>
                  <input className={inputClass} value={zip} onChange={(e) => setZip(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-dark-800">Country</label>
                  <select className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)}>
                    {COUNTRIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-dark-900">Payment method</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition-colors",
                    paymentMethod === "card"
                      ? "border-orange-500 bg-orange-50"
                      : "border-transparent bg-store-card hover:bg-zinc-100",
                  )}
                >
                  <CreditCard className="mb-2 h-8 w-8 text-dark-800" />
                  <p className="font-heading font-semibold text-dark-900">Regular Payment</p>
                  <p className="mt-1 text-sm text-dark-800/80">Pay with debit/credit card</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("splitpay")}
                  className={cn(
                    "relative rounded-xl border-2 p-4 text-left transition-colors",
                    paymentMethod === "splitpay"
                      ? "border-orange-500 bg-orange-50"
                      : "border-transparent bg-store-card hover:bg-zinc-100",
                  )}
                >
                  <span className="absolute right-3 top-3 rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    RECOMMENDED
                  </span>
                  <div className="mb-2 flex items-baseline gap-0 font-heading text-xl font-bold">
                    <span className="text-dark-900">Split</span>
                    <span className="text-brand-orange">Pay</span>
                  </div>
                  <p className="text-sm text-dark-800/80">Split payment across 2 cards</p>
                </button>
              </div>

              {paymentMethod === "card" && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-dark-800">Card number</label>
                    <input
                      className={inputClass}
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumberDigits(e.target.value))}
                      autoComplete="cc-number"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-dark-800">Expiry (MM/YY)</label>
                    <input
                      className={inputClass}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiryMmYy(e.target.value))}
                      autoComplete="cc-exp"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-dark-800">CVV</label>
                    <input
                      className={inputClass}
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      autoComplete="cc-csc"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-dark-800">Name on card</label>
                    <input
                      className={inputClass}
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      autoComplete="cc-name"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "splitpay" && (
                <div className="mt-6 space-y-8">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark-900">
                      Enter your 4-digit SplitPay code
                    </label>
                    <input
                      className={cn(
                        inputClass,
                        "max-w-xs text-center font-mono text-2xl tracking-[0.5em]",
                      )}
                      inputMode="numeric"
                      maxLength={4}
                      value={splitCode}
                      onChange={(e) => {
                        setSplitCode(e.target.value.replace(/\D/g, "").slice(0, 4));
                        setSplitCodeError(null);
                      }}
                      placeholder="••••"
                    />
                    <button
                      type="button"
                      onClick={handleConnectSplitPay}
                      disabled={splitConnectLoading}
                      className="mt-3 rounded-lg bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
                    >
                      {splitConnectLoading ? "Connecting…" : "Connect Account"}
                    </button>
                    {splitUserName && (
                      <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        Connected: {splitUserName}&apos;s SplitPay account
                      </p>
                    )}
                    {splitCodeError && <p className="mt-2 text-sm text-red-600">{splitCodeError}</p>}
                  </div>

                  {splitUserName && (
                    <>
                      <div className="rounded-xl border border-brand-orange/30 bg-brand-orange/5 p-4">
                        <p className="font-heading text-lg font-semibold text-dark-900">
                          Total to split: {formatMoney(orderTotal)}
                        </p>
                      </div>

                      <div className="space-y-3 rounded-xl border-l-4 border-brand-orange bg-store-surface p-4 shadow-sm">
                        <p className="font-heading text-sm font-semibold text-brand-orange">Card 1</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-dark-800">Card number</label>
                            <input
                              className={inputClass}
                              value={spC1Number}
                              onChange={(e) => setSpC1Number(formatCardNumberDigits(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-dark-800">Expiry</label>
                            <input
                              className={inputClass}
                              value={spC1Exp}
                              onChange={(e) => setSpC1Exp(formatExpiryMmYy(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-dark-800">CVV</label>
                            <input
                              className={inputClass}
                              type="password"
                              inputMode="numeric"
                              maxLength={4}
                              value={spC1Cvv}
                              onChange={(e) => setSpC1Cvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-dark-800">Amount from Card 1</label>
                            <div className="relative">
                              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                                $
                              </span>
                              <input
                                className={cn(inputClass, "pl-7")}
                                inputMode="decimal"
                                value={spC1Amount}
                                onChange={(e) => setSpC1Amount(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 rounded-xl border-l-4 border-brand-orange bg-store-surface p-4 shadow-sm">
                        <p className="font-heading text-sm font-semibold text-brand-orange">Card 2</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-dark-800">Card number</label>
                            <input
                              className={inputClass}
                              value={spC2Number}
                              onChange={(e) => setSpC2Number(formatCardNumberDigits(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-dark-800">Expiry</label>
                            <input
                              className={inputClass}
                              value={spC2Exp}
                              onChange={(e) => setSpC2Exp(formatExpiryMmYy(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-dark-800">CVV</label>
                            <input
                              className={inputClass}
                              type="password"
                              inputMode="numeric"
                              maxLength={4}
                              value={spC2Cvv}
                              onChange={(e) => setSpC2Cvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-dark-800">Amount from Card 2</label>
                            <div className="relative">
                              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                                $
                              </span>
                              <input
                                className={cn(inputClass, "pl-7")}
                                inputMode="decimal"
                                value={spC2Amount}
                                onChange={(e) => setSpC2Amount(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-dark-800">Running total</p>
                        <div className="flex h-9 w-full overflow-hidden rounded-full bg-store-card ring-1 ring-zinc-200">
                          <div
                            className="flex min-w-0 items-center justify-center bg-brand-orange text-[10px] font-semibold text-white"
                            style={{ width: `${w1}%` }}
                          >
                            {w1 > 12 && `C1 ${formatMoney(a1)}`}
                          </div>
                          <div
                            className="flex min-w-0 items-center justify-center bg-orange-300 text-[10px] font-semibold text-dark-900"
                            style={{ width: `${w2}%` }}
                          >
                            {w2 > 12 && `C2 ${formatMoney(a2)}`}
                          </div>
                          <div
                            className="flex min-w-0 items-center justify-center bg-zinc-200 text-[10px] font-medium text-dark-800"
                            style={{ width: `${wRem}%` }}
                          >
                            {short && diff > 0 && `+${formatMoney(diff)}`}
                            {match && "✓"}
                            {over && "Over"}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 text-xs">
                          <span>
                            Card 1: <strong>{formatMoney(a1)}</strong>
                          </span>
                          <span>
                            Card 2: <strong>{formatMoney(a2)}</strong>
                          </span>
                          <span>
                            Checkout total: <strong>{formatMoney(orderTotal)}</strong>
                          </span>
                        </div>
                        {short && (
                          <p className="mt-2 text-sm text-amber-700">
                            ⚠ {formatMoney(Math.abs(diff))} still needed — amounts are short of total
                          </p>
                        )}
                        {over && (
                          <p className="mt-2 text-sm text-red-600">
                            ✗ {formatMoney(sum - orderTotal)} over total — amounts exceed checkout total
                          </p>
                        )}
                        {match && (
                          <p className="mt-2 text-sm text-emerald-700">✓ Amounts match — ready to proceed</p>
                        )}
                      </div>

                      <div className="rounded-lg bg-brand-orange/10 px-4 py-3 text-sm text-dark-900">
                        Pay with SplitPay and split across 2 cards at checkout.
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={placeDisabled}
              className="flex h-[52px] w-full items-center justify-center rounded-xl bg-brand-orange text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Place Order — {formatMoney(orderTotal)}
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-6 rounded-2xl border border-zinc-200 bg-store-surface p-6 shadow-sm">
              <h2 className="font-heading text-lg font-semibold text-dark-900">Order summary</h2>
              <ul className="max-h-[min(50vh,420px)] space-y-4 overflow-y-auto">
                {items.map((i) => (
                  <li key={i.id} className="flex gap-3 border-b border-store-card pb-4 last:border-0">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-store-card">
                      <Image src={i.image} alt={i.name} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-dark-900 line-clamp-2">{i.name}</p>
                      <p className="text-xs text-dark-800/70">Qty {i.quantity}</p>
                      <p className="text-sm font-semibold text-dark-900">{formatMoney(i.price * i.quantity)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 border-t border-store-card pt-4 text-sm">
                <div className="flex justify-between text-dark-800">
                  <span>Subtotal</span>
                  <span>{formatMoney(orderTotal)}</span>
                </div>
                <div className="flex justify-between text-dark-800">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between border-t border-store-card pt-3 font-heading text-xl font-bold text-brand-orange">
                  <span>Total</span>
                  <span>{formatMoney(orderTotal)}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-lg bg-store-card py-3 text-xs font-medium text-dark-800">
                <Lock className="h-4 w-4 text-brand-orange" />
                Secured by SplitPay
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentProcessingModal
        open={modalOpen}
        mode={modalMode}
        cardAmountC1={a1}
        cardAmountC2={a2}
        cardProcessing={cardProcessing && result === "idle"}
        splitStep={splitStep}
        result={result}
        orderId={orderId}
        orderEmail={email}
        liveSplitpayRecorded={liveSplitpayRecorded}
        successHint={successHint}
        errorMessage={errorMessage}
        onTryAgain={handleTryAgain}
        onContinueShopping={handleContinueShopping}
      />
    </>
  );
}
