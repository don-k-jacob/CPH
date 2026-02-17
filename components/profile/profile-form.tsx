"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProfileFormProps = {
  initial: {
    name: string;
    username: string;
    bio: string;
    avatarUrl: string;
  };
};

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        username: String(formData.get("username") ?? ""),
        bio: String(formData.get("bio") ?? ""),
        avatarUrl: String(formData.get("avatarUrl") ?? "")
      })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Unable to save profile");
      setPending(false);
      return;
    }

    router.refresh();
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-2xl space-y-4 p-6">
      <span className="ornament">Steward Your Presence</span>
      <div>
        <label className="mb-1 block text-sm font-semibold">Name</label>
        <input defaultValue={initial.name} name="name" required className="input-field" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Username</label>
        <input defaultValue={initial.username} name="username" required className="input-field" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Bio</label>
        <textarea defaultValue={initial.bio} name="bio" rows={4} className="input-field" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Avatar URL</label>
        <input defaultValue={initial.avatarUrl} name="avatarUrl" type="url" className="input-field" />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
