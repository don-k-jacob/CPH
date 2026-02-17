"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CommentFormProps = {
  launchId: string;
};

export function CommentForm({ launchId }: CommentFormProps) {
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim() || pending) return;

    setPending(true);
    setError(null);

    const response = await fetch(`/api/launches/${launchId}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body })
    });

    if (response.ok) {
      setBody("");
      router.refresh();
    } else if (response.status === 401) {
      setError("Log in to comment.");
    }

    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Share what you think about this launch"
        rows={4}
        className="input-field"
      />
      <button type="submit" disabled={pending} className="btn-secondary px-5 py-2.5 text-sm disabled:opacity-50">
        {pending ? "Posting..." : "Post Comment"}
      </button>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </form>
  );
}
