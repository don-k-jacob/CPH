import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { EventSessionCard } from "@/components/events/event-session-card";
import { BackendWarning } from "@/components/backend-warning";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getFeedLaunches } from "@/lib/firebase-db";
import { rankLaunches } from "@/lib/ranking";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let launches = [] as Awaited<ReturnType<typeof getFeedLaunches>>;
  let backendError: string | null = null;

  try {
    launches = await getFeedLaunches();
  } catch (error) {
    backendError = getBackendErrorMessage(error);
  }

  const ranked = rankLaunches(
    launches.map((launch) => ({
      id: launch.id,
      launchDate: launch.launchDate,
      product: {
        id: launch.product.id,
        slug: launch.product.slug,
        name: launch.product.name,
        tagline: launch.product.tagline,
        maker: launch.product.maker
          ? {
              id: launch.product.maker.id,
              name: launch.product.maker.name,
              username: launch.product.maker.username
            }
          : null,
        topics: launch.product.topics.map((topic) => ({
          id: topic.id,
          name: topic.name,
          slug: topic.slug
        }))
      },
      _count: launch._count
    }))
  );

  return (
    <section className="min-w-0 space-y-6">
      <div className="card min-w-0 overflow-hidden p-4 sm:p-6 md:p-10">
        <span className="ornament">Daily Discernment</span>
        <h1 className="section-heading mt-3 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          Discover and launch products that serve the common good.
        </h1>
        <p className="mt-4 max-w-2xl text-black/70">
          A Catholic maker community for honest feedback, thoughtful launches, and technology built with dignity.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/submit" className="btn-primary inline-flex min-h-[48px] items-center justify-center px-5 py-3 text-sm">
            Submit Launch
          </Link>
          <Link href="/products" className="btn-secondary inline-flex min-h-[48px] items-center justify-center px-5 py-3 text-sm">
            Browse Listings
          </Link>
        </div>
      </div>

      {backendError ? <BackendWarning title="Backend setup required" message={backendError} /> : null}

      <EventSessionCard />

      <div className="min-w-0 space-y-4">
        {ranked.map((item, index) => (
          <ProductCard
            key={item.launch.id}
            rank={index + 1}
            launchId={item.launch.id}
            productSlug={item.launch.product.slug}
            name={item.launch.product.name}
            tagline={item.launch.product.tagline}
            makerName={item.launch.product.maker?.name ?? "Unknown maker"}
            topics={item.launch.product.topics.map((entry) => ({ name: entry.name, slug: entry.slug }))}
            upvotes={item.launch._count.upvotes}
            comments={item.launch._count.comments}
            score={item.score}
          />
        ))}
      </div>
    </section>
  );
}
