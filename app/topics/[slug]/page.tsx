import Link from "next/link";
import { notFound } from "next/navigation";
import { BackendWarning } from "@/components/backend-warning";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getTopicBySlugWithProducts } from "@/lib/firebase-db";

export const dynamic = "force-dynamic";

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const topicData = await getTopicBySlugWithProducts(slug);

    if (!topicData) notFound();

    return (
      <section className="space-y-4">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {topicData.topic.name}
        </h1>
        <p className="text-black/70">Products tagged in this topic.</p>
        <div className="space-y-3">
          {topicData.products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="card block p-4">
              <p className="text-lg font-bold">{product.name}</p>
              <p className="text-sm text-black/70">{product.tagline}</p>
              <p className="mt-1 text-xs text-black/60">by {product.maker?.name ?? "Unknown maker"}</p>
            </Link>
          ))}
        </div>
      </section>
    );
  } catch (error) {
    return (
      <section className="space-y-4">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Topic
        </h1>
        <BackendWarning message={getBackendErrorMessage(error)} />
      </section>
    );
  }
}
