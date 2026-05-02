import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Stars } from "@/components/Stars";
import { getProductById, products } from "@/data/products";
import { ProductActions } from "./ProductActions";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

function formatPrice(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Link href="/products" className="text-sm font-medium text-brand-orange hover:text-brand-dark">
        ← Back to products
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-store-card">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {[product.image].map((src, i) => (
              <div key={i} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 border-brand-orange ring-2 ring-brand-orange/30">
                <Image src={src} alt="" fill className="object-cover" sizes="64px" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h1 className="font-heading text-3xl font-bold leading-tight text-dark-900 lg:text-[28px]">
            {product.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Stars rating={product.rating} />
            <span className="text-sm text-dark-800/80">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>
          <p className="mt-6 font-heading text-[32px] font-bold text-dark-900">{formatPrice(product.price)}</p>
          <p className="mt-4 leading-relaxed text-dark-800/90">{product.description}</p>
          <p className="mt-4 text-sm">
            <span className="font-medium text-dark-900">In stock:</span>{" "}
            <span className={product.stock < 10 ? "text-brand-dark" : "text-green-700"}>{product.stock} units</span>
          </p>

          <div className="mt-8">
            <ProductActions product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
