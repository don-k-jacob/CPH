"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProfileFormProps = {
  initial: {
    name: string;
    username: string;
    bio: string;
    avatarUrl: string;
    experience: string;
    linkedInUrl: string;
    xUrl: string;
    githubUrl: string;
    websiteUrl: string;
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
        avatarUrl: String(formData.get("avatarUrl") ?? ""),
        experience: String(formData.get("experience") ?? ""),
        linkedInUrl: String(formData.get("linkedInUrl") ?? ""),
        xUrl: String(formData.get("xUrl") ?? ""),
        githubUrl: String(formData.get("githubUrl") ?? ""),
        websiteUrl: String(formData.get("websiteUrl") ?? "")
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
    <form onSubmit={onSubmit} className="card max-w-2xl min-w-0 space-y-4 p-4 sm:p-6">
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
        <input defaultValue={initial.avatarUrl} name="avatarUrl" type="url" className="input-field" placeholder="https://..." />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Experience / background</label>
        <textarea
          defaultValue={initial.experience}
          name="experience"
          rows={3}
          className="input-field"
          placeholder="e.g. Full-stack developer, 5 years. Built apps for parishes."
        />
        <p className="mt-1 text-xs text-black/55">Required to join hackathons. At least 10 characters.</p>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold text-ink">Social links (at least one required for hackathon registration)</p>
        <div>
          <label className="mb-1 block text-sm font-medium text-black/75">LinkedIn</label>
          <input defaultValue={initial.linkedInUrl} name="linkedInUrl" type="url" className="input-field" placeholder="https://linkedin.com/in/..." />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-black/75">X (Twitter)</label>
          <input defaultValue={initial.xUrl} name="xUrl" type="url" className="input-field" placeholder="https://x.com/..." />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-black/75">GitHub</label>
          <input defaultValue={initial.githubUrl} name="githubUrl" type="url" className="input-field" placeholder="https://github.com/..." />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-black/75">Website</label>
          <input defaultValue={initial.websiteUrl} name="websiteUrl" type="url" className="input-field" placeholder="https://..." />
        </div>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
