import { BackendWarning } from "@/components/backend-warning";
import { requireUser } from "@/lib/auth";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getAdminOverview } from "@/lib/firebase-db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    const user = await requireUser();
    if (user.role !== "ADMIN") {
      return (
        <section className="space-y-4">
          <h1 className="section-heading text-4xl font-bold">Admin Console</h1>
          <BackendWarning title="Access restricted" message="Only admin accounts can access this page." />
        </section>
      );
    }

    const overview = await getAdminOverview();

    const cards = [
      ["Users", overview.users],
      ["Products", overview.products],
      ["Launches", overview.launches],
      ["Comments", overview.comments],
      ["Upvotes", overview.upvotes],
      ["Event Registrations", overview.eventRegistrations],
      ["Teammate Posts", overview.teammatePosts]
    ] as const;

    return (
      <section className="space-y-4">
        <h1 className="section-heading text-4xl font-bold">Admin Console</h1>
        <p className="text-black/70">Operational overview of the platform and event activity.</p>

        <div className="grid gap-3 md:grid-cols-3">
          {cards.map(([label, value]) => (
            <article key={label} className="card p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-black/55">{label}</p>
              <p className="mt-2 text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {value}
              </p>
            </article>
          ))}
        </div>
      </section>
    );
  } catch (error) {
    return (
      <section className="space-y-4">
        <h1 className="section-heading text-4xl font-bold">Admin Console</h1>
        <BackendWarning message={getBackendErrorMessage(error)} />
      </section>
    );
  }
}
