import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <section className="space-y-4">
      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
        Settings
      </h1>
      <p className="text-black/70">Logged in as {user.email}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="card p-4">
          <p className="font-semibold">Profile</p>
          <p className="text-sm text-black/70">Manage name, username, bio, and avatar.</p>
        </div>
        <div className="card p-4">
          <p className="font-semibold">Notifications</p>
          <p className="text-sm text-black/70">Configure in-app and digest preferences.</p>
        </div>
      </div>
    </section>
  );
}
