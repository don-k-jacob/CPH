import { requireUser } from "@/lib/auth";
import { BackendWarning } from "@/components/backend-warning";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getNotificationsForUser } from "@/lib/firebase-db";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  try {
    const user = await requireUser();
    const notifications = await getNotificationsForUser(user.id);

    return (
      <section className="space-y-4">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Notifications
        </h1>
        <div className="space-y-3">
          {notifications.length === 0 ? <p className="text-black/60">No notifications yet.</p> : null}
          {notifications.map((item) => (
            <article key={item.id} className="card p-4">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-black/70">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    );
  } catch (error) {
    return (
      <section className="space-y-4">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Notifications
        </h1>
        <BackendWarning message={getBackendErrorMessage(error)} />
      </section>
    );
  }
}
