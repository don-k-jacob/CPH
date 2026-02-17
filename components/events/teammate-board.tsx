"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type TeammatePost = {
  id: string;
  userName: string;
  username: string;
  participationType: "TEAM" | "INDIVIDUAL";
  lookingFor: string[];
  message: string;
  createdAt: string;
};

type TeammateBoardProps = {
  eventSlug: string;
  isLoggedIn: boolean;
  posts: TeammatePost[];
};

export function TeammateBoard({ eventSlug, isLoggedIn, posts }: TeammateBoardProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/events/teammates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        eventSlug,
        participationType: String(formData.get("participationType") ?? "INDIVIDUAL"),
        lookingFor: String(formData.get("lookingFor") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        message: String(formData.get("message") ?? "").trim()
      })
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Unable to post teammate request.");
      setPending(false);
      return;
    }

    setPending(false);
    (event.currentTarget as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <section className="space-y-4">
      <form onSubmit={onSubmit} className="card space-y-3 p-5">
        <h3 className="section-heading text-2xl font-bold">Find a Teammate</h3>

        <div>
          <label className="mb-1 block text-sm font-semibold">I am joining as</label>
          <select name="participationType" className="input-field">
            <option value="INDIVIDUAL">Individual</option>
            <option value="TEAM">Team</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Looking for (comma separated)</label>
          <input name="lookingFor" className="input-field" placeholder="backend, ui designer, mobile dev" required />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Message</label>
          <textarea name="message" className="input-field" rows={3} placeholder="What are you building and what help do you need?" required />
        </div>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button type="submit" disabled={pending} className="btn-secondary px-5 py-2.5 text-sm disabled:opacity-50">
          {pending ? "Posting..." : "Post Request"}
        </button>
      </form>

      <div className="space-y-3">
        {posts.length === 0 ? <p className="text-sm text-black/65">No teammate requests yet. Be the first.</p> : null}
        {posts.map((post) => (
          <article key={post.id} className="card p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-black/60">
              <span className="rounded-full border border-black/15 bg-white/70 px-2 py-0.5">{post.participationType}</span>
              <span>@{post.username}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="mt-1 text-sm font-semibold">{post.userName}</p>
            <p className="mt-2 text-sm text-black/75">{post.message}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {post.lookingFor.map((tag) => (
                <span key={`${post.id}-${tag}`} className="rounded-full border border-gold/35 bg-accentSoft/60 px-2 py-0.5 text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
