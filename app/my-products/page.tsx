import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { BackendWarning } from "@/components/backend-warning";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getProductsForMaker } from "@/lib/firebase-db";

export const dynamic = "force-dynamic";

export default async function MyProductsPage() {
  try {
    const user = await requireUser();
    const products = await getProductsForMaker(user.id);

    return (
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            My products
          </h1>
          <Link href="/submit" className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white">
            New listing
          </Link>
        </div>
        <div className="space-y-3">
          {products.length === 0 ? <p className="text-black/60">You have not listed a product yet.</p> : null}
          {products.map((item) => (
            <Link key={item.product.id} href={`/products/${item.product.slug}`} className="card block p-4">
              <p className="text-lg font-bold">{item.product.name}</p>
              <p className="text-black/70">{item.product.tagline}</p>
              <p className="mt-1 text-xs text-black/60">
                {item.media.length} media • {item.counts.upvotes} upvotes • {item.counts.comments} comments
              </p>
            </Link>
          ))}
        </div>
      </section>
    );
  } catch (error) {
    return (
      <section className="space-y-4">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          My products
        </h1>
        <BackendWarning message={getBackendErrorMessage(error)} />
      </section>
    );
  }
}
