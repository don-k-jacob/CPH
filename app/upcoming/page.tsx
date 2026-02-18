import Link from "next/link";
import { BackendWarning } from "@/components/backend-warning";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getUpcomingLaunches } from "@/lib/firebase-db";

export const dynamic = "force-dynamic";

export default async function UpcomingPage() {
  try {
    const launches = await getUpcomingLaunches();

    return (
      <section className="space-y-4">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Upcoming Launches
        </h1>
        {launches.length === 0 ? (
          <p className="text-black/60">No upcoming launches scheduled yet.</p>
        ) : (
          <div className="space-y-3">
            {launches.map((launch) => {
              const productSlug = launch.product?.slug;
              const hasProduct = Boolean(productSlug);
              const content = (
                <>
                  <p className="text-lg font-bold">{launch.product?.name ?? "Unknown product"}</p>
                  <p className="text-black/70">{launch.product?.tagline ?? "No tagline"}</p>
                  <p className="mt-1 text-xs text-black/60">Launches on {new Date(launch.launchDate).toLocaleString()}</p>
                </>
              );

              if (!hasProduct) {
                return (
                  <article key={launch.id} className="card p-4">
                    {content}
                  </article>
                );
              }

              return (
                <Link key={launch.id} href={`/products/${productSlug}`} className="card block p-4">
                  {content}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    );
  } catch (error) {
    return (
      <section className="space-y-4">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Upcoming Launches
        </h1>
        <BackendWarning message={getBackendErrorMessage(error)} />
      </section>
    );
  }
}
