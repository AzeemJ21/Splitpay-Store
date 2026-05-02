"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

type SplitStep = { id: string; label: string; sub?: string };

type Props = {
  open: boolean;
  mode: "card" | "splitpay" | null;
  cardAmountC1: number;
  cardAmountC2: number;
  onTryAgain: () => void;
  onContinueShopping: () => void;
  /** When true, card flow is waiting on API */
  cardProcessing: boolean;
  /** SplitPay step index 0-3 = current animated step, 4 = all steps done, waiting for API */
  splitStep: number;
  result: "idle" | "success" | "failure";
  orderId?: string;
  orderEmail?: string;
  errorMessage?: string;
};

function CheckmarkIcon() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setDone(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return (
    <motion.svg
      viewBox="0 0 52 52"
      className="mx-auto h-20 w-20 text-emerald-500"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: done ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 27l8 8 16-16"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: done ? 1 : 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
      />
    </motion.svg>
  );
}

export function PaymentProcessingModal({
  open,
  mode,
  cardAmountC1,
  cardAmountC2,
  onTryAgain,
  onContinueShopping,
  cardProcessing,
  splitStep,
  result,
  orderId,
  orderEmail,
  errorMessage,
}: Props) {
  const splitSteps: SplitStep[] = [
    { id: "s1", label: "Connecting to SplitPay...", sub: "SplitPay Connected" },
    { id: "s2", label: `Charging Card 1 (${formatMoney(cardAmountC1)})...`, sub: "Card 1 charged" },
    { id: "s3", label: `Charging Card 2 (${formatMoney(cardAmountC2)})...`, sub: "Card 2 charged" },
    { id: "s4", label: "Moving funds to merchant...", sub: "Payment complete" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-dark-900 p-8 text-white shadow-2xl"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            {result === "idle" && mode === "card" && cardProcessing && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-brand-orange" />
                <p className="font-heading text-xl font-semibold">Processing payment...</p>
                <p className="text-sm text-white/70">Please do not close this window.</p>
              </div>
            )}

            {result === "idle" && mode === "splitpay" && (
              <div className="space-y-4">
                <p className="text-center font-heading text-lg font-semibold text-white">SplitPay</p>
                <ul className="space-y-3">
                  {splitSteps.map((s, i) => {
                    const complete = splitStep > i;
                    const active = splitStep === i && splitStep < 4;
                    return (
                      <li
                        key={s.id}
                        className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                          complete
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                            : active
                              ? "border-brand-orange bg-brand-orange/15 text-white"
                              : "border-white/10 bg-white/5 text-white/40"
                        }`}
                      >
                        <span className="mt-0.5 shrink-0">
                          {complete ? (
                            <span className="text-lg text-emerald-400">✓</span>
                          ) : active ? (
                            <Loader2 className="h-5 w-5 animate-spin text-brand-orange" />
                          ) : (
                            <span className="inline-block h-5 w-5 rounded-full border border-white/20" />
                          )}
                        </span>
                        <span
                          className={
                            complete ? "text-emerald-200/90" : active ? "font-semibold text-white" : "text-white/40"
                          }
                        >
                          {complete ? s.sub : s.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {splitStep >= 4 && (
                  <div className="flex items-center justify-center gap-2 pt-2 text-sm text-white/70">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-orange" />
                    Finalizing order...
                  </div>
                )}
              </div>
            )}

            {result === "success" && (
              <div className="space-y-5 text-center">
                <CheckmarkIcon />
                <h2 className="font-heading text-[32px] font-bold leading-tight text-white">Order Confirmed!</h2>
                {orderId && (
                  <p className="font-mono text-lg text-brand-orange">{orderId}</p>
                )}
                {orderEmail && (
                  <p className="text-sm text-white/75">
                    A confirmation has been sent to <span className="text-white">{orderEmail}</span>
                  </p>
                )}
                <Link
                  href="/products"
                  onClick={onContinueShopping}
                  className="mt-2 inline-flex h-[52px] w-full items-center justify-center rounded-xl bg-brand-orange text-base font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  Continue Shopping
                </Link>
              </div>
            )}

            {result === "failure" && (
              <div className="space-y-5 text-center">
                <XCircle className="mx-auto h-16 w-16 text-red-500" />
                <h2 className="font-heading text-2xl font-bold text-white">Payment Failed</h2>
                <p className="text-sm text-red-200/90">{errorMessage || "Something went wrong."}</p>
                <button
                  type="button"
                  onClick={onTryAgain}
                  className="h-[52px] w-full rounded-xl border border-white/20 bg-white/5 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
