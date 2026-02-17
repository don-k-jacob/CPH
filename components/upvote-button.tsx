"use client";

import { useState } from "react";

type UpvoteButtonProps = {
  launchId: string;
  initialCount: number;
};

export function UpvoteButton({ launchId, initialCount }: UpvoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onUpvote() {
    if (pending) return;
    setPending(true);
    setError(null);
    const response = await fetch(`/api/launches/${launchId}/upvote`, {
      method: "POST"
    });

    if (response.ok) {
      const payload = (await response.json()) as { upvotes: number };
      setCount(payload.upvotes);
    } else if (response.status === 401) {
      setError("Log in to upvote.");
    }

    setPending(false);
  }

  return (
    <div className="space-y-1">
      <button onClick={onUpvote} disabled={pending} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-60">
        {pending ? "Voting..." : `Upvote (${count})`}
      </button>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
