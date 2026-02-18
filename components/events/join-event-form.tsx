"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TEAMMATE_OPTIONS = [
  { value: "solo", label: "Working solo" },
  { value: "looking", label: "Looking for teammates" },
  { value: "team", label: "Already have a team" }
] as const;

const REFERRAL_OPTIONS = [
  { value: "devpost", label: "Devpost" },
  { value: "friend", label: "Friend" },
  { value: "college", label: "My college" },
  { value: "community", label: "Community or chapter" },
  { value: "other", label: "Other" }
] as const;

type JoinEventFormProps = {
  eventSlug: string;
  eventTitle: string;
  isLoggedIn: boolean;
  /** When true, user has already registered — show Profile & My projects instead of form */
  isRegistered: boolean;
  /** Prefill when editing (only used when not yet registered in this session) */
  initialRegistration?: {
    participationType?: "TEAM" | "INDIVIDUAL" | null;
    teamName?: string | null;
    projectName?: string | null;
    skills?: string[] | null;
    bio?: string | null;
    teammatePreference?: string | null;
    referralSource?: string | null;
  } | null;
  /** Current user's username for "My projects" link (e.g. /makers/username) */
  currentUserUsername?: string | null;
};

export function JoinEventForm({
  eventSlug,
  eventTitle,
  isLoggedIn,
  isRegistered,
  initialRegistration,
  currentUserUsername
}: JoinEventFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [teammatePreference, setTeammatePreference] = useState<string>(initialRegistration?.teammatePreference ?? "solo");
  const [referralSource, setReferralSource] = useState<string>(initialRegistration?.referralSource ?? "");
  const [eligibilityAgreed, setEligibilityAgreed] = useState(false);
  const [rulesAgreed, setRulesAgreed] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!eligibilityAgreed || !rulesAgreed) {
      setError("You must agree to the eligibility requirements and the Official Rules.");
      return;
    }
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          teammatePreference,
          referralSource: referralSource || "other",
          eligibilityAgreed: true,
          rulesAgreed: true
        })
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not join the hackathon.");
        return;
      }
      setSuccess(`You're in! Welcome to ${eventTitle}.`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-w-0 space-y-4">
        <p className="text-black/80">
          Create an account and click Join hackathon to participate.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/signup" className="btn-primary px-5 py-2.5 text-sm">
            Sign up
          </Link>
          <Link href="/login" className="rounded-xl border border-black/20 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-black/5">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="min-w-0 space-y-6">
        <div className="rounded-xl border border-mint/40 bg-mint/10 px-4 py-3 text-sm font-medium text-ink">
          You&apos;re registered for this event.
        </div>
        <div className="card space-y-3 p-4">
          <h4 className="section-heading text-xl font-bold text-ink">Your Project</h4>
          <div className="grid gap-2 text-sm text-black/80 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-ink">Mode:</span>{" "}
              {initialRegistration?.participationType === "TEAM" ? "Team" : "Individual"}
            </p>
            {initialRegistration?.teamName ? (
              <p>
                <span className="font-semibold text-ink">Team:</span> {initialRegistration.teamName}
              </p>
            ) : null}
            {initialRegistration?.projectName ? (
              <p className="sm:col-span-2">
                <span className="font-semibold text-ink">Project:</span> {initialRegistration.projectName}
              </p>
            ) : null}
            {initialRegistration?.skills && initialRegistration.skills.length > 0 ? (
              <p className="sm:col-span-2">
                <span className="font-semibold text-ink">Skills:</span> {initialRegistration.skills.join(", ")}
              </p>
            ) : null}
            {initialRegistration?.bio ? (
              <p className="sm:col-span-2">
                <span className="font-semibold text-ink">About:</span> {initialRegistration.bio}
              </p>
            ) : null}
          </div>
          <a href="#application" className="inline-flex text-sm font-semibold text-accent hover:underline">
            Continue to application →
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/profile"
            className="flex flex-col rounded-xl border border-black/10 bg-white/70 p-4 transition hover:border-accent/40 hover:bg-white"
          >
            <span className="font-semibold text-ink">Profile</span>
            <span className="mt-1 text-sm text-black/70">View and edit your profile</span>
          </Link>
          <Link
            href={currentUserUsername ? `/makers/${encodeURIComponent(currentUserUsername)}` : "/products"}
            className="flex flex-col rounded-xl border border-black/10 bg-white/70 p-4 transition hover:border-accent/40 hover:bg-white"
          >
            <span className="font-semibold text-ink">My projects</span>
            <span className="mt-1 text-sm text-black/70">See your products and launches</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <p className="text-sm text-black/70">Please respect our community guidelines.</p>
      <form onSubmit={onSubmit} className="card space-y-5 p-4 sm:p-6">
        <h3 className="section-heading text-xl font-bold text-ink">Register</h3>

        <div>
          <label className="mb-2 block text-sm font-semibold">Do you have teammates? *</label>
          <div className="flex flex-wrap gap-2">
            {TEAMMATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTeammatePreference(opt.value)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                  teammatePreference === opt.value
                    ? "border-accent bg-accentSoft/70 text-ink"
                    : "border-black/15 bg-white/70 text-black/80 hover:bg-black/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="referral" className="mb-1 block text-sm font-semibold">
            Who told you about {eventTitle}? *
          </label>
          <select
            id="referral"
            value={referralSource}
            onChange={(e) => setReferralSource(e.target.value)}
            className="input-field w-full"
            required
          >
            <option value="">Select one</option>
            {REFERRAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4 border-t border-black/10 pt-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={eligibilityAgreed}
              onChange={(e) => setEligibilityAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-black/30 text-accent focus:ring-accent"
            />
            <span className="text-sm text-black/85">
              <strong>Eligibility requirements *</strong> I have read and agree to the eligibility requirements for this hackathon: above legal age of majority in my country of residence; only specific countries/territories may be included where stated.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={rulesAgreed}
              onChange={(e) => setRulesAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-black/30 text-accent focus:ring-accent"
            />
            <span className="text-sm text-black/85">
              I have read and agree to be bound by the Official Rules and the Terms of Service. *
            </span>
          </label>
        </div>

        {error ? <p className="text-sm text-red-700 break-words">{error}</p> : null}
        {success ? <p className="text-sm text-mint break-words">{success}</p> : null}

        <button
          type="submit"
          disabled={pending || !eligibilityAgreed || !rulesAgreed || !referralSource}
          className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
        >
          {pending ? "Joining…" : "Join hackathon"}
        </button>
      </form>
    </div>
  );
}
