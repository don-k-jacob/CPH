"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TeammatePost = {
  id: string;
  userId: string;
  userName: string;
  username: string;
  participationType: "TEAM" | "INDIVIDUAL";
  lookingFor: string[];
  message: string;
  createdAt: string;
};

type TeammateBoardProps = {
  eventSlug: string;
  eventTitle: string;
  isLoggedIn: boolean;
  currentUserId: string | null;
  isRegistered: boolean;
  posts: TeammatePost[];
};

export function TeammateBoard({
  eventSlug,
  eventTitle,
  isLoggedIn,
  currentUserId,
  isRegistered,
  posts
}: TeammateBoardProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const myPost = currentUserId ? posts.find((p) => p.userId === currentUserId) : null;
  const isUpdate = Boolean(myPost);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setPending(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      participationType: String(formData.get("participationType") ?? "INDIVIDUAL"),
      lookingFor: String(formData.get("lookingFor") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      message: String(formData.get("message") ?? "").trim()
    };

    const url = "/api/events/teammates";
    const method = isUpdate ? "PATCH" : "POST";
    const body =
      method === "PATCH" && myPost
        ? JSON.stringify({ postId: myPost.id, ...payload })
        : JSON.stringify({ eventSlug, ...payload });

    const response = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? (isUpdate ? "Unable to update request." : "Unable to post teammate request."));
      setPending(false);
      return;
    }

    setSuccess(isUpdate ? "Your request was updated." : "Your request was posted.");
    setPending(false);
    if (!isUpdate) (event.currentTarget as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <section className="min-w-0 space-y-4">
      {!isLoggedIn ? (
        <div className="rounded-xl border border-black/10 bg-white/70 p-4 text-sm text-black/75 break-words">
          Log in to post a teammate request or message others. You can still browse requests.
        </div>
      ) : !isRegistered ? (
        <div className="rounded-xl border border-gold/40 bg-accentSoft/50 p-4 text-sm text-ink break-words">
          Register for {eventTitle} first (use the Join hackathon button above), then come back here to post what you are looking for.
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="card min-w-0 space-y-3 p-4 sm:p-5">
        <h3 className="section-heading text-2xl font-bold">{isUpdate ? "Your teammate request" : "Find a teammate"}</h3>
        {isUpdate ? (
          <p className="text-sm text-black/65">Update your request below. Others can see it in the list.</p>
        ) : null}

        <div>
          <label className="mb-1 block text-sm font-semibold">I am joining as</label>
          <select name="participationType" className="input-field" defaultValue={myPost?.participationType ?? "INDIVIDUAL"}>
            <option value="INDIVIDUAL">Individual</option>
            <option value="TEAM">Team</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Looking for (comma separated)</label>
          <input
            name="lookingFor"
            className="input-field"
            placeholder="backend, ui designer, mobile dev"
            defaultValue={myPost?.lookingFor.join(", ") ?? ""}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Message</label>
          <textarea
            name="message"
            className="input-field"
            rows={3}
            placeholder="What are you building and what help do you need?"
            defaultValue={myPost?.message ?? ""}
            required
          />
        </div>

        {error ? <p className="break-words text-sm text-red-700">{error}</p> : null}
        {success ? <p className="break-words text-sm text-mint">{success}</p> : null}

        <button type="submit" disabled={pending} className="btn-secondary px-5 py-2.5 text-sm disabled:opacity-50">
          {pending ? (isUpdate ? "Updating..." : "Posting...") : isUpdate ? "Update request" : "Post request"}
        </button>
      </form>

      <div className="space-y-3">
        <h3 className="section-heading text-lg font-bold">Teammate requests</h3>
        {posts.length === 0 ? (
          <p className="text-sm text-black/65">No teammate requests yet. Be the first to post.</p>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id}>
                <article className="card min-w-0 overflow-hidden p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-black/60">
                    <span className="rounded-full border border-black/15 bg-white/70 px-2 py-0.5">{post.participationType}</span>
                    <Link
                      href={`/makers/${post.username}`}
                      className="font-medium text-accent hover:underline"
                    >
                      @{post.username}
                    </Link>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    {post.userId === currentUserId ? (
                      <span className="rounded-full border border-mint/40 bg-mint/20 px-2 py-0.5 text-mint">Your post</span>
                    ) : null}
                  </div>
                  <p className="mt-1 break-words text-sm font-semibold text-ink">{post.userName}</p>
                  <p className="mt-2 break-words text-sm text-black/75">{post.message}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {post.lookingFor.map((tag) => (
                      <span key={`${post.id}-${tag}`} className="rounded-full border border-gold/35 bg-accentSoft/60 px-2 py-0.5 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
