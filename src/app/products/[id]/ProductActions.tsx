"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import { useCart } from "@/store/useCart";

function formatPrice(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const clearCart = useCart((s) => s.clearCart);
  const [qty, setQty] = useState(1);

  const addToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: qty,
    });
  };

  const buyNow = () => {
    clearCart();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: qty,
    });
    router.push("/checkout");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-dark-800">Quantity</span>
        <div className="flex items-center rounded-lg border border-store-card bg-store-bg">
          <button
            type="button"
            className="px-4 py-2 text-lg text-dark-900 hover:bg-store-card"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-[2rem] text-center font-mono text-sm">{qty}</span>
          <button
            type="button"
            className="px-4 py-2 text-lg text-dark-900 hover:bg-store-card"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <motion.button
          type="button"
          onClick={addToCart}
          className="flex-1 rounded-lg bg-brand-orange py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          whileTap={{ scale: 0.98 }}
        >
          Add to Cart — {formatPrice(product.price * qty)}
        </motion.button>
        <motion.button
          type="button"
          onClick={buyNow}
          className="flex-1 rounded-lg border-2 border-brand-orange bg-store-surface py-3 text-sm font-semibold text-brand-orange hover:bg-brand-orange/5"
          whileTap={{ scale: 0.98 }}
        >
          Buy Now
        </motion.button>
      </div>

      <div className="rounded-xl bg-brand-orange/10 px-4 py-3 text-sm text-dark-900">
        <strong className="text-brand-dark">SplitPay:</strong> Pay with SplitPay and split across 2 cards at checkout
        (simulated in this demo).
      </div>
    </div>
  );
}
