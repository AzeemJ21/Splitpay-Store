"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/store/useCart";

function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function CartPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const getTotal = useCart((s) => s.total);

  const subtotal = getTotal();
  const shipping = 0;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-store-card" strokeWidth={1.25} />
        <h1 className="mt-6 font-heading text-2xl font-bold text-dark-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-dark-800/70">Add something you love — SplitPay works at checkout.</p>
        <Link
          href="/products"
          className="mt-8 rounded-lg bg-brand-orange px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="font-heading text-3xl font-bold text-dark-900">Cart</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <motion.li
              layout
              key={item.id}
              className="flex gap-4 rounded-xl border border-store-card bg-store-surface p-4 shadow-sm"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-store-card">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${item.id}`} className="font-heading font-semibold text-dark-900 hover:text-brand-orange">
                  {item.name}
                </Link>
                <p className="mt-1 text-sm font-medium text-dark-900">{formatMoney(item.price)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-lg border border-store-card">
                    <button
                      type="button"
                      className="px-3 py-1.5 text-dark-900 hover:bg-store-bg"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      className="px-3 py-1.5 text-dark-900 hover:bg-store-bg"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right font-semibold text-dark-900">{formatMoney(item.price * item.quantity)}</div>
            </motion.li>
          ))}
        </ul>

        <div className="h-fit rounded-xl border border-store-card bg-store-surface p-6 shadow-sm lg:sticky lg:top-28">
          <h2 className="font-heading text-lg font-semibold text-dark-900">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-dark-800">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between text-dark-800">
              <span>Shipping</span>
              <span className="text-green-700">Free</span>
            </div>
            <div className="flex justify-between border-t border-store-card pt-3 font-heading text-lg font-bold text-dark-900">
              <span>Total</span>
              <span>{formatMoney(subtotal + shipping)}</span>
            </div>
          </div>
          <motion.button
            type="button"
            onClick={() => router.push("/checkout")}
            className="mt-6 w-full rounded-lg bg-brand-orange py-3 text-sm font-semibold text-white hover:bg-brand-dark"
            whileTap={{ scale: 0.98 }}
          >
            Proceed to Checkout
          </motion.button>
          <p className="mt-3 text-center text-xs text-dark-800/60">
            FYP demo — no real payment is processed.
          </p>
        </div>
      </div>
    </div>
  );
}
