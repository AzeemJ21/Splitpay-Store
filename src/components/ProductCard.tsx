"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/store/useCart";
import { cn } from "@/lib/utils";
import { Stars } from "./Stars";

type ProductCardProps = {
  product: Product;
  className?: string;
};

function formatPrice(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCart((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 800);
  };

  return (
    <motion.div
      layout
      className={cn("group relative", className)}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-store-card">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <span className="absolute left-2 top-2 rounded-full bg-store-surface/90 px-2 py-0.5 text-xs font-medium text-dark-800 shadow-sm">
            {product.category}
          </span>
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="font-heading text-[15px] font-semibold leading-snug text-dark-900 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-dark-800/80">
            <Stars rating={product.rating} className="!gap-0" />
            <span className="text-xs">({product.reviews})</span>
          </div>
          <p className="text-lg font-bold text-dark-900">{formatPrice(product.price)}</p>
        </div>
      </Link>
      <div
        className={cn(
          "mt-3 transition-all duration-200 md:max-h-0 md:overflow-hidden md:opacity-0 md:group-hover:max-h-14 md:group-hover:opacity-100",
          "max-h-14 opacity-100",
        )}
      >
        <motion.button
          type="button"
          onClick={handleAdd}
          className={cn(
            "w-full rounded-lg bg-brand-orange py-2.5 text-sm font-semibold text-white transition-colors",
            "hover:bg-brand-dark",
            justAdded && "ring-2 ring-brand-orange ring-offset-2",
          )}
          whileTap={{ scale: 0.98 }}
        >
          {justAdded ? "Added!" : "Add to Cart"}
        </motion.button>
      </div>
    </motion.div>
  );
}
