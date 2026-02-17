import Link from "next/link";
import { BackendWarning } from "@/components/backend-warning";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getAllProductsWithCounts } from "@/lib/firebase-db";

export const dynamic = "force-dynamic";

export default async function ProductsIndexPage() {
  try {
    const products = await getAllProductsWithCounts();

    return (
      <section className="space-y-4">
        <span className="ornament">Discover Tools</span>
        <h1 className="section-heading text-4xl font-bold">
          Product listings
        </h1>
        <div className="space-y-3">
          {products.map((item) => (
            <Link key={item.product.id} href={`/products/${item.product.slug}`} className="card block p-4">
              <p className="text-lg font-bold">{item.product.name}</p>
              <p className="text-black/70">{item.product.tagline}</p>
              <p className="mt-1 text-xs text-black/60">
                by {item.maker?.name ?? "Unknown"} • {item.counts.upvotes} upvotes • {item.counts.comments} comments
              </p>
            </Link>
          ))}
        </div>
      </section>
    );
  } catch (error) {
    return (
      <section className="space-y-4">
        <h1 className="section-heading text-4xl font-bold">
          Product listings
        </h1>
        <BackendWarning message={getBackendErrorMessage(error)} />
      </section>
    );
  }
}
