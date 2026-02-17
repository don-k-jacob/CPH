import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/profile/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <section className="space-y-4">
      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
        Your profile
      </h1>
      <ProfileForm
        initial={{
          name: user.name,
          username: user.username,
          bio: user.bio ?? "",
          avatarUrl: user.avatarUrl ?? ""
        }}
      />
    </section>
  );
}
