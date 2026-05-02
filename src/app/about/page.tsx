import Link from "next/link";

/** FYP — marketing copy only; no live SplitPay SDK on this storefront */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-heading text-4xl font-bold text-dark-900">How SplitPay Works</h1>
      <p className="mt-6 leading-relaxed text-dark-800/90">
        SplitPay lets you divide a single purchase across two cards — perfect for rewards maximization, shared
        purchases, or staying within card limits. This storefront is a separate demo app from the SplitPay dashboard;
        checkout integration here is simulated for your FYP presentation.
      </p>
      <ul className="mt-8 list-inside list-disc space-y-2 text-dark-800/90">
        <li>Add items to your cart on this store (mock catalog).</li>
        <li>At checkout, choose SplitPay to allocate amounts across Card 1 and Card 2.</li>
        <li>No real charges occur in this prototype.</li>
      </ul>
      <Link href="/products" className="mt-10 inline-flex rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
        Shop the demo catalog
      </Link>
    </div>
  );
}
