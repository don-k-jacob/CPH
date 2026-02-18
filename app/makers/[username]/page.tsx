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
      <section className="min-w-0 space-y-6">
        <div className="card min-w-0 overflow-hidden p-4 sm:p-6">
          <h1 className="break-words text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
            {data.user.name}
          </h1>
          <p className="mt-2 text-black/70">@{data.user.username}</p>
          <p className="mt-3 break-words text-black/80">{data.user.bio ?? "No bio yet."}</p>
          {data.user.experience ? (
            <p className="mt-3 break-words text-sm text-black/75">
              <span className="font-semibold text-ink">Experience:</span> {data.user.experience}
            </p>
          ) : null}
          <p className="mt-3 text-sm text-black/60">
            {data.counts.followers} followers • {data.counts.following} following
          </p>
          {(data.user.linkedInUrl || data.user.xUrl || data.user.githubUrl || data.user.websiteUrl) ? (
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {data.user.linkedInUrl ? (
                <a href={data.user.linkedInUrl} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-accent hover:underline">
                  LinkedIn
                </a>
              ) : null}
              {data.user.xUrl ? (
                <a href={data.user.xUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">
                  X
                </a>
              ) : null}
              {data.user.githubUrl ? (
                <a href={data.user.githubUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">
                  GitHub
                </a>
              ) : null}
              {data.user.websiteUrl ? (
                <a href={data.user.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">
                  Website
                </a>
              ) : null}
            </div>
          ) : null}
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
