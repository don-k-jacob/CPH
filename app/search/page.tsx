import Link from "next/link";
import { BackendWarning } from "@/components/backend-warning";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { searchAll } from "@/lib/firebase-db";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  try {
    const data = query ? await searchAll(query) : { products: [], users: [], topics: [] };

    return (
      <section className="space-y-6">
        <div>
          <span className="ornament">Find With Intention</span>
          <h1 className="section-heading mt-2 text-4xl font-bold">
            Search
          </h1>
          <form className="mt-4">
            <input
              defaultValue={query}
              name="q"
              placeholder="Search products, makers, categories"
              className="input-field max-w-2xl rounded-full px-5 py-3"
            />
          </form>
        </div>

        <div className="space-y-3">
          {query.length === 0 ? <p className="text-black/60">Type a query to search.</p> : null}
          {query.length > 0 && data.products.length === 0 ? <p className="text-black/60">No matches for “{query}”.</p> : null}
          {data.products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="card block p-4">
              <p className="text-lg font-bold">{product.name}</p>
              <p className="text-black/70">{product.tagline}</p>
              <p className="mt-1 text-xs text-black/60">by {product.maker?.name ?? "Unknown maker"}</p>
            </Link>
          ))}
        </div>
      </section>
    );
  } catch (error) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="section-heading text-4xl font-bold">
            Search
          </h1>
        </div>
        <BackendWarning message={getBackendErrorMessage(error)} />
      </section>
    );
  }
}
