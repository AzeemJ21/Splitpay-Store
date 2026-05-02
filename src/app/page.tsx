import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/data/products";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const heroImages = products.slice(0, 4);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Hero — FYP marketing shell */}
      <section className="relative min-h-[min(100vh,900px)] overflow-hidden bg-store-bg">
        <div
          className="pointer-events-none absolute -right-20 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-brand-orange/20 blur-3xl"
          aria-hidden
        />
        <div className="mx-auto grid max-w-7xl min-h-[min(100vh,900px)] grid-cols-1 items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:px-6 lg:py-20">
          <div className="z-10 max-w-xl">
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-dark-900 md:text-5xl md:leading-[1.1] md:text-[56px]">
              Shop Smarter.
              <br />
              Pay Flexibly.
            </h1>
            <p className="mt-5 text-lg text-dark-800/90">
              Use SplitPay at checkout to divide your payment across two cards. No limits.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
              >
                Shop Now
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-lg border-2 border-dark-900/15 bg-store-surface px-6 py-3 text-sm font-semibold text-dark-900 transition hover:border-brand-orange/50"
              >
                How SplitPay Works
              </Link>
            </div>
          </div>

          <div className="relative z-10">
            <div
              className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-brand-orange/15 to-transparent"
              aria-hidden
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {heroImages.map((p) => (
                <div
                  key={p.id}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-white/50 shadow-lg"
                >
                  <Image src={p.image} alt="" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category pills */}
      <section className="border-b border-store-card bg-store-surface py-4">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-dark-800/60">Browse</p>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => {
              const href = cat === "All" ? "/products" : `/products?category=${encodeURIComponent(cat)}`;
              return (
                <Link
                  key={cat}
                  href={href}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    cat === "All"
                      ? "bg-brand-orange text-white"
                      : "bg-store-card text-dark-900 hover:bg-brand-orange/10",
                  )}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured grid */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold text-dark-900 md:text-3xl">Featured Products</h2>
          <Link href="/products" className="text-sm font-semibold text-brand-orange hover:text-brand-dark">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* SplitPay strip */}
      <section className="relative overflow-hidden bg-dark-900 py-12 text-white">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-brand-orange/25 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 md:flex-row md:items-center md:px-6">
          <p className="max-w-xl font-heading text-xl font-semibold md:text-2xl">
            Pay with SplitPay — Split across 2 cards instantly
          </p>
          <Link
            href="/about"
            className="shrink-0 rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Learn More
          </Link>
        </div>
      </section>
    </div>
  );
}
