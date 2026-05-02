"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/store/useCart";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const count = useCart((s) => s.count());
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-store-card bg-store-surface shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="shrink-0 font-heading text-xl font-bold tracking-tight">
          <span className="text-dark-900">Split</span>
          <span className="text-brand-orange">Pay</span>
          <span className="ml-1 font-medium text-dark-800"> Store</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === l.href ? "text-brand-orange" : "text-dark-800 hover:text-brand-orange",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
          <div
            className={cn(
              "flex flex-1 items-center justify-end transition-all md:max-w-xs md:flex-initial",
              searchOpen ? "max-w-full" : "max-w-0 overflow-hidden md:max-w-xs md:overflow-visible",
            )}
          >
            <div className="relative w-full min-w-[180px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-800/50" />
              <input
                type="search"
                placeholder="Search products…"
                className="w-full rounded-lg border border-store-card bg-store-bg py-2 pl-9 pr-3 text-sm text-dark-900 placeholder:text-dark-800/40 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
                aria-label="Search"
              />
            </div>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-dark-800 hover:bg-store-card md:hidden"
            onClick={() => setSearchOpen((o) => !o)}
            aria-label={searchOpen ? "Close search" : "Open search"}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-dark-800 transition-colors hover:bg-store-card"
            aria-label={`Shopping cart, ${count} items`}
          >
            <ShoppingBag className="h-6 w-6" />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange px-1 text-[11px] font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            className="rounded-lg p-2 text-dark-800 hover:bg-store-card md:hidden"
            onClick={() => setMobileMenu((m) => !m)}
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {mobileMenu ? (
        <div className="border-t border-store-card bg-store-surface px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileMenu(false)}
                className={cn(
                  "rounded-md px-2 py-2 text-sm font-medium",
                  pathname === l.href ? "bg-brand-orange/10 text-brand-orange" : "text-dark-800",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
