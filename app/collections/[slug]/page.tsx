import Link from "next/link";
import { notFound } from "next/navigation";
import { BackendWarning } from "@/components/backend-warning";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getCollectionBySlug } from "@/lib/firebase-db";

export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const collection = await getCollectionBySlug(slug);

    if (!collection) {
      notFound();
    }

    return (
      <section className="space-y-4">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {String(collection.name)}
        </h1>
        <p className="text-black/70">Curated by {collection.creator?.name ?? "Unknown"}</p>
        <div className="space-y-3">
          {collection.items.map((item) => {
            const product = item.product;
            if (!product) {
              return (
                <article key={item.id} className="card p-4">
                  <p className="text-lg font-bold">Unavailable product</p>
                  <p className="text-black/70">This item is no longer available.</p>
                  {item.note ? <p className="mt-2 text-sm text-black/60">{item.note}</p> : null}
                </article>
              );
            }

            return (
              <Link key={item.id} href={`/products/${product.slug}`} className="card block p-4">
                <p className="text-lg font-bold">{product.name}</p>
                <p className="text-black/70">{product.tagline}</p>
                {item.note ? <p className="mt-2 text-sm text-black/60">{item.note}</p> : null}
              </Link>
            );
          })}
        </div>
      </section>
    );
  } catch (error) {
    return (
      <section className="space-y-4">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Collection
        </h1>
        <BackendWarning message={getBackendErrorMessage(error)} />
      </section>
    );
  }
}
