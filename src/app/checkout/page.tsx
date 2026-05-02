"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/store/useCart";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-14 w-14 text-dark-800/40" />
        <p className="mt-6 font-heading text-xl text-dark-900">Your cart is empty</p>
        <Link
          href="/products"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-brand-orange px-8 font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return <CheckoutClient />;
}
