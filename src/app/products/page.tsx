import { Suspense } from "react";
import { ProductListing } from "./ProductListing";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-dark-800/70">Loading products…</div>
      }
    >
      <ProductListing />
    </Suspense>
  );
}
