import Link from "next/link";
import { notFound } from "next/navigation";
import { BackendWarning } from "@/components/backend-warning";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getMakerProfile } from "@/lib/firebase-db";

export const dynamic = "force-dynamic";

export default async function MakerPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  try {
    const data = await getMakerProfile(username);

    if (!data) notFound();

    return (
      <section className="space-y-6">
        <div className="card p-6">
          <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {data.user.name}
          </h1>
          <p className="mt-2 text-black/70">@{data.user.username}</p>
          <p className="mt-3 text-black/80">{data.user.bio ?? "No bio yet."}</p>
          <p className="mt-3 text-sm text-black/60">
            {data.counts.followers} followers • {data.counts.following} following
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-bold">Products</h2>
          {data.products.map((product) => (
            <Link href={`/products/${product.slug}`} key={product.id} className="card block p-4">
              <p className="text-lg font-bold">{product.name}</p>
              <p className="text-black/70">{product.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    );
  } catch (error) {
    return (
      <section className="space-y-4">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Maker
        </h1>
        <BackendWarning message={getBackendErrorMessage(error)} />
      </section>
    );
  }
}
