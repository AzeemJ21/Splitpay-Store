"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";
import { Stars } from "@/components/Stars";
import type { Product } from "@/data/products";
import { categories, products } from "@/data/products";
import { useCart } from "@/store/useCart";
import { cn } from "@/lib/utils";

type SortKey = "latest" | "price-asc" | "rating";

function formatPrice(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function ProductListing() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const [category, setCategory] = useState<string>(() => {
    const c = categoryFromUrl;
    if (c && (categories as readonly string[]).includes(c)) return c;
    return "All";
  });

  useEffect(() => {
    const c = searchParams.get("category");
    if (c && (categories as readonly string[]).includes(c)) setCategory(c);
    else setCategory("All");
  }, [searchParams]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState<SortKey>("latest");
  const [drawer, setDrawer] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const [flying, setFlying] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list: Product[] = [...products];
    if (category !== "All") {
      list = list.filter((p) => p.category === category);
    }
    const minN = priceMin ? parseFloat(priceMin) : NaN;
    const maxN = priceMax ? parseFloat(priceMax) : NaN;
    if (!Number.isNaN(minN)) list = list.filter((p) => p.price >= minN);
    if (!Number.isNaN(maxN)) list = list.filter((p) => p.price <= maxN);

    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));

    return list;
  }, [category, priceMin, priceMax, sort]);

  const handleAdd = (p: Product) => {
    addItem({ id: p.id, name: p.name, price: p.price, image: p.image });
    setFlying(p.id);
    window.setTimeout(() => setFlying(null), 600);
  };

  const Filters = (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dark-800/60">Category</p>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="category"
                checked={category === cat}
                onChange={() => setCategory(cat)}
                className="accent-brand-orange"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dark-800/60">Price range</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full rounded-lg border border-store-card bg-store-bg px-2 py-2 text-sm"
          />
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full rounded-lg border border-store-card bg-store-bg px-2 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dark-800/60">Sort</p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="w-full rounded-lg border border-store-card bg-store-bg px-3 py-2 text-sm"
        >
          <option value="latest">Latest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="rating">Rating</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-dark-900">All Products</h1>
          <p className="mt-1 text-sm text-dark-800/70">{filtered.length} items</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-store-card bg-store-surface px-4 py-2 text-sm font-medium md:hidden"
          onClick={() => setDrawer(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="flex gap-10 lg:gap-12">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-store-card bg-store-surface p-5 shadow-sm">
            {Filters}
          </div>
        </aside>

        {drawer ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button type="button" className="absolute inset-0 bg-dark-900/40" onClick={() => setDrawer(false)} aria-label="Close filters" />
            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-store-surface p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-heading font-semibold">Filters</span>
                <button type="button" onClick={() => setDrawer(false)} aria-label="Close">
                  <X className="h-6 w-6" />
                </button>
              </div>
              {Filters}
              <button
                type="button"
                className="mt-6 w-full rounded-lg bg-brand-orange py-3 text-sm font-semibold text-white"
                onClick={() => setDrawer(false)}
              >
                Apply
              </button>
            </div>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                layout
                className="group relative"
                whileHover={{ y: -2 }}
              >
                <Link href={`/products/${p.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-store-card">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-store-surface/95 px-2 py-0.5 text-xs font-medium shadow">
                      {p.category}
                    </span>
                  </div>
                  <h3 className="font-heading mt-3 text-[15px] font-semibold leading-snug text-dark-900 line-clamp-2">
                    {p.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-dark-800/80">
                    <Stars rating={p.rating} />
                    <span className="text-xs">({p.reviews})</span>
                  </div>
                  <p className="mt-2 text-lg font-bold text-dark-900">{formatPrice(p.price)}</p>
                </Link>
                <div className="mt-3 opacity-100 transition md:max-h-0 md:overflow-hidden md:opacity-0 md:group-hover:max-h-14 md:group-hover:opacity-100">
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAdd(p);
                    }}
                    className={cn(
                      "relative w-full rounded-lg bg-brand-orange py-2.5 text-sm font-semibold text-white hover:bg-brand-dark",
                      flying === p.id && "animate-fly-to-cart",
                    )}
                    whileTap={{ scale: 0.97 }}
                  >
                    Add to Cart
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
          {filtered.length === 0 ? (
            <p className="py-20 text-center text-dark-800/70">No products match your filters.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
