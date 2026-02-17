"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type JoinEventFormProps = {
  eventSlug: string;
  isLoggedIn: boolean;
  initialRegistration?: {
    participationType: "TEAM" | "INDIVIDUAL";
    teamName: string | null;
    projectName: string;
    skills: string[];
    bio: string;
  } | null;
};

export function JoinEventForm({ eventSlug, isLoggedIn, initialRegistration }: JoinEventFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<"TEAM" | "INDIVIDUAL">(initialRegistration?.participationType ?? "INDIVIDUAL");

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

    const response = await fetch("/api/events/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        eventSlug,
        participationType: mode,
        teamName: String(formData.get("teamName") ?? "").trim(),
        projectName: String(formData.get("projectName") ?? "").trim(),
        skills: String(formData.get("skills") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        bio: String(formData.get("bio") ?? "").trim()
      })
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Could not register for the event.");
      setPending(false);
      return;
    }

    setSuccess("Registration saved. You are in for Lent Hack.");
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      <h3 className="section-heading text-2xl font-bold">Join Event</h3>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("INDIVIDUAL")}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
            mode === "INDIVIDUAL" ? "border-accent bg-accentSoft/70" : "border-black/15 bg-white/70"
          }`}
        >
          Join as Individual
        </button>
        <button
          type="button"
          onClick={() => setMode("TEAM")}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
            mode === "TEAM" ? "border-accent bg-accentSoft/70" : "border-black/15 bg-white/70"
          }`}
        >
          Join as Team
        </button>
      </div>

      {mode === "TEAM" ? (
        <div>
          <label className="mb-1 block text-sm font-semibold">Team name</label>
          <input name="teamName" defaultValue={initialRegistration?.teamName ?? ""} className="input-field" required={mode === "TEAM"} />
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-semibold">Project idea</label>
        <input name="projectName" defaultValue={initialRegistration?.projectName ?? ""} className="input-field" required />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Skills (comma separated)</label>
        <input
          name="skills"
          defaultValue={(initialRegistration?.skills ?? []).join(", ")}
          placeholder="frontend, backend, ui, ai"
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Short bio</label>
        <textarea name="bio" defaultValue={initialRegistration?.bio ?? ""} className="input-field" rows={3} required />
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {success ? <p className="text-sm text-mint">{success}</p> : null}

      <button type="submit" disabled={pending} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">
        {pending ? "Saving..." : "Confirm Registration"}
      </button>
    </form>
  );
}
