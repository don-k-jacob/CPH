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
            {launches.map((launch) => (
              <Link key={launch.id} href={`/products/${launch.product?.slug ?? ""}`} className="card block p-4">
                <p className="text-lg font-bold">{launch.product?.name ?? "Unknown product"}</p>
                <p className="text-black/70">{launch.product?.tagline ?? "No tagline"}</p>
                <p className="mt-1 text-xs text-black/60">Launches on {new Date(launch.launchDate).toLocaleString()}</p>
              </Link>
            ))}
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
