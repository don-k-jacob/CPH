"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { EventApplicationSections, EventApplicationTeamMember } from "@/lib/firebase-db";

type EventApplicationFormProps = {
  eventSlug: string;
  tracks?: string[];
  initialApplication?: {
    status: string;
    submittedAt: string | null;
    teamMembers: EventApplicationTeamMember[];
    sections: EventApplicationSections;
  } | null;
};

export function EventApplicationForm({
  eventSlug,
  tracks = [],
  initialApplication
}: EventApplicationFormProps) {
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<EventApplicationTeamMember[]>(initialApplication?.teamMembers ?? []);
  const [sections, setSections] = useState<EventApplicationSections>(initialApplication?.sections ?? {});
  const [status, setStatus] = useState<"draft" | "submitted">(
    initialApplication?.status === "submitted" ? "submitted" : "draft"
  );
  const [pending, setPending] = useState(false);
  const [submitPending, setSubmitPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [addEmail, setAddEmail] = useState("");
  const [addPending, setAddPending] = useState(false);

  useEffect(() => {
    if (initialApplication) {
      setTeamMembers(initialApplication.teamMembers);
      setSections(initialApplication.sections);
      setStatus(initialApplication.status as "draft" | "submitted");
    }
  }, [initialApplication]);

  const updateSection = <K extends keyof EventApplicationSections>(key: K, value: EventApplicationSections[K]) => {
    setSections((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = async () => {
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(eventSlug)}/application`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamMembers, sections })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to save draft.");
        return;
      }
      setSuccess("Draft saved.");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitPending(true);
    setError(null);
    setSuccess(null);
    try {
      await handleSaveDraft();
      const res = await fetch(`/api/events/${encodeURIComponent(eventSlug)}/application/submit`, {
        method: "POST"
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to submit application.");
        return;
      }
      setSuccess("Application submitted.");
      setStatus("submitted");
      router.refresh();
    } finally {
      setSubmitPending(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = addEmail.trim().toLowerCase();
    if (!email) return;
    setAddPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(eventSlug)}/application/team`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not add team member.");
        return;
      }
      if (data.member) setTeamMembers((prev) => [...prev, data.member]);
      setAddEmail("");
      router.refresh();
    } finally {
      setAddPending(false);
    }
  };

  const handleRemoveMember = async (email: string) => {
    try {
      await fetch(
        `/api/events/${encodeURIComponent(eventSlug)}/application/team?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );
      setTeamMembers((prev) => prev.filter((m) => m.email !== email));
      router.refresh();
    } catch {
      setError("Could not remove team member.");
    }
  };

  const uploadFile = async (type: "founder-video" | "demo" | "coding-session", file: File): Promise<string | null> => {
    const form = new FormData();
    form.set("file", file);
    form.set("type", type);
    const res = await fetch(`/api/events/${encodeURIComponent(eventSlug)}/application/upload`, {
      method: "POST",
      body: form
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return data.url ?? null;
  };

  const isSubmitted = status === "submitted";

  return (
    <div className="min-w-0 space-y-8">
      {isSubmitted && (
        <div className="rounded-xl border border-mint/40 bg-mint/10 px-4 py-3 text-sm font-medium text-ink">
          Your application has been submitted. You can still edit certain sections (e.g. founder video, demo, progress) by saving draft again.
        </div>
      )}

      {/* Founders / Team */}
      <section className="card space-y-4 p-4 sm:p-6">
        <h3 className="section-heading text-lg font-bold text-ink">Founders / Team</h3>
        <div className="space-y-2">
          {teamMembers.map((m) => (
            <div key={m.email} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-black/10 bg-white/50 px-3 py-2">
              <span className="font-medium text-ink">{m.email}</span>
              <span className="text-xs text-black/60">
                {m.status === "complete" ? "Profile complete" : m.status === "profile_incomplete" ? "Profile incomplete" : "Invited"}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveMember(m.email)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddMember} className="flex flex-wrap gap-2">
          <input
            type="email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            placeholder="Co-founder email"
            className="input-field flex-1 min-w-[180px]"
          />
          <button type="submit" disabled={addPending} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
            {addPending ? "Adding…" : "+ Add a co-founder"}
          </button>
        </form>
        <p className="text-xs text-black/60">
          Team members must have an account and complete their profile (experience + one social link) before you can submit.
        </p>

        <div>
          <label className="mb-1 block text-sm font-semibold">How long have the founders known one another and how did you meet? Have any not met in person?</label>
          <textarea
            value={sections.foundersKnownHowLong ?? ""}
            onChange={(e) => updateSection("foundersKnownHowLong", e.target.value)}
            className="input-field"
            rows={3}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Who writes code, or does other technical work on your product? Was any of it done by a non-founder?</label>
          <textarea
            value={sections.whoWritesCode ?? ""}
            onChange={(e) => updateSection("whoWritesCode", e.target.value)}
            className="input-field"
            rows={2}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Are you looking for a cofounder?</label>
          <textarea
            value={sections.lookingForCofounder ?? ""}
            onChange={(e) => updateSection("lookingForCofounder", e.target.value)}
            className="input-field"
            rows={2}
          />
        </div>
      </section>

      {/* Founder Video */}
      <section className="card space-y-4 p-4 sm:p-6">
        <h3 className="section-heading text-lg font-bold text-ink">Founder Video</h3>
        <p className="text-sm text-black/70">Optional: one minute video introducing the founder(s). Max 100 MB.</p>
        <FileUpload
          accept="video/mp4,video/webm,video/quicktime"
          label="Drop here or browse"
          currentUrl={sections.founderVideoUrl}
          onUpload={(file) => uploadFile("founder-video", file)}
          onUrlChange={(url) => updateSection("founderVideoUrl", url)}
        />
      </section>

      {/* Company / Project */}
      <section className="card space-y-4 p-4 sm:p-6">
        <h3 className="section-heading text-lg font-bold text-ink">Company / Project</h3>
        <div>
          <label className="mb-1 block text-sm font-semibold">Company or project name *</label>
          <input
            value={sections.companyName ?? ""}
            onChange={(e) => updateSection("companyName", e.target.value)}
            className="input-field"
            placeholder="Your project name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Describe what your company does in 50 characters or less</label>
          <input
            value={sections.tagline50 ?? ""}
            onChange={(e) => updateSection("tagline50", e.target.value.slice(0, 50))}
            className="input-field"
            maxLength={50}
            placeholder="Short tagline"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Company URL, if any</label>
          <input
            type="url"
            value={sections.companyUrl ?? ""}
            onChange={(e) => updateSection("companyUrl", e.target.value)}
            className="input-field"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">If you have a demo, attach it below (video, max 100 MB)</label>
          <FileUpload
            accept="video/mp4,video/webm,video/quicktime"
            label="Drop here or browse"
            currentUrl={sections.demoVideoUrl ?? sections.demoFileUrl}
            onUpload={(file) => uploadFile("demo", file)}
            onUrlChange={(url) => {
              updateSection("demoVideoUrl", url);
              updateSection("demoFileUrl", url);
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Link to the product, if any</label>
          <input
            type="url"
            value={sections.productLink ?? ""}
            onChange={(e) => updateSection("productLink", e.target.value)}
            className="input-field"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">If login credentials are required for the link above, enter them here</label>
          <input
            value={sections.productLinkCredentials ?? ""}
            onChange={(e) => updateSection("productLinkCredentials", e.target.value)}
            className="input-field"
            placeholder="username / password or instructions"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">What is your company going to make? Describe your product.</label>
          <textarea
            value={sections.whatWillYouMake ?? ""}
            onChange={(e) => updateSection("whatWillYouMake", e.target.value)}
            className="input-field"
            rows={4}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Where do you live now, and where would the company be based? (City, Country)</label>
          <input
            value={sections.location ?? ""}
            onChange={(e) => updateSection("location", e.target.value)}
            className="input-field"
            placeholder="City A, Country A / City B, Country B"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Explain your decision regarding location</label>
          <textarea
            value={sections.locationReason ?? ""}
            onChange={(e) => updateSection("locationReason", e.target.value)}
            className="input-field"
            rows={2}
          />
        </div>
      </section>

      {/* Progress */}
      <section className="card space-y-4 p-4 sm:p-6">
        <h3 className="section-heading text-lg font-bold text-ink">Progress</h3>
        <div>
          <label className="mb-1 block text-sm font-semibold">How far along are you?</label>
          <textarea
            value={sections.howFarAlong ?? ""}
            onChange={(e) => updateSection("howFarAlong", e.target.value)}
            className="input-field"
            rows={2}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">How long have you been working on this? How much full-time?</label>
          <textarea
            value={sections.howLongWorking ?? ""}
            onChange={(e) => updateSection("howLongWorking", e.target.value)}
            className="input-field"
            rows={2}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">What tech stack are you using or planning to use? Include AI tools if any.</label>
          <textarea
            value={sections.techStack ?? ""}
            onChange={(e) => updateSection("techStack", e.target.value)}
            className="input-field"
            rows={2}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Optional: attach a coding agent session you&apos;re proud of (.md or .txt, max 10 MB)</label>
          <FileUpload
            accept=".md,.txt,text/markdown,text/plain"
            label="Click or drag to upload .md or .txt"
            currentUrl={sections.codingSessionUrl}
            onUpload={(file) => uploadFile("coding-session", file)}
            onUrlChange={(url) => updateSection("codingSessionUrl", url)}
          />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <span className="text-sm font-semibold">Are people using your product?</span>
            <select
              value={sections.peopleUsingProduct ?? ""}
              onChange={(e) => updateSection("peopleUsingProduct", (e.target.value as "yes" | "no") || undefined)}
              className="input-field w-auto"
            >
              <option value="">—</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm font-semibold">Do you have revenue?</span>
            <select
              value={sections.haveRevenue ?? ""}
              onChange={(e) => updateSection("haveRevenue", (e.target.value as "yes" | "no") || undefined)}
              className="input-field w-auto"
            >
              <option value="">—</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">If you applied before with the same idea, did anything change? If you pivoted, what did you learn?</label>
          <textarea
            value={sections.previousBatchChange ?? ""}
            onChange={(e) => updateSection("previousBatchChange", e.target.value)}
            className="input-field"
            rows={2}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">If you have participated in another incubator or accelerator, please tell us</label>
          <textarea
            value={sections.otherIncubator ?? ""}
            onChange={(e) => updateSection("otherIncubator", e.target.value)}
            className="input-field"
            rows={2}
          />
        </div>
      </section>

      {/* Idea */}
      <section className="card space-y-4 p-4 sm:p-6">
        <h3 className="section-heading text-lg font-bold text-ink">Idea</h3>
        <div>
          <label className="mb-1 block text-sm font-semibold">Why did you pick this idea? Do you have domain expertise? How do you know people need this?</label>
          <textarea
            value={sections.whyThisIdea ?? ""}
            onChange={(e) => updateSection("whyThisIdea", e.target.value)}
            className="input-field"
            rows={3}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Who are your competitors? What do you understand that they don&apos;t?</label>
          <textarea
            value={sections.competitors ?? ""}
            onChange={(e) => updateSection("competitors", e.target.value)}
            className="input-field"
            rows={2}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">How do or will you make money? Rough estimate if possible.</label>
          <textarea
            value={sections.howMakeMoney ?? ""}
            onChange={(e) => updateSection("howMakeMoney", e.target.value)}
            className="input-field"
            rows={2}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Which category best applies?</label>
          <input
            value={sections.category ?? ""}
            onChange={(e) => updateSection("category", e.target.value)}
            className="input-field"
            placeholder="e.g. FaithTech, Education"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Other ideas you considered? List them.</label>
          <textarea
            value={sections.otherIdeas ?? ""}
            onChange={(e) => updateSection("otherIdeas", e.target.value)}
            className="input-field"
            rows={2}
          />
        </div>
      </section>

      {/* Catholic Mission */}
      <section className="card space-y-4 border-accent/20 bg-accentSoft/10 p-4 sm:p-6">
        <h3 className="section-heading text-lg font-bold text-ink">Catholic Mission</h3>
        <p className="text-sm text-black/70">
          This hackathon is about building products that serve the Kingdom. Help us understand how your project connects to the Catholic/Christian mission.
        </p>
        <div>
          <label className="mb-1 block text-sm font-semibold">How does your product serve the Catholic/Christian mission? *</label>
          <textarea
            value={sections.catholicMission ?? ""}
            onChange={(e) => updateSection("catholicMission", e.target.value)}
            className="input-field"
            rows={3}
            placeholder="Describe how your product advances the mission of the Church or helps people live out their faith..."
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">What specific problem in the Church or faith community does this solve?</label>
          <textarea
            value={sections.churchProblem ?? ""}
            onChange={(e) => updateSection("churchProblem", e.target.value)}
            className="input-field"
            rows={3}
            placeholder="e.g. Parishes struggle to coordinate volunteers, Catholics lack accessible tools for daily prayer, youth don't have engaging faith formation resources..."
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">How does your product align with Catholic teaching or values?</label>
          <textarea
            value={sections.catholicTeachingAlignment ?? ""}
            onChange={(e) => updateSection("catholicTeachingAlignment", e.target.value)}
            className="input-field"
            rows={2}
            placeholder="Describe how your product respects and upholds Catholic doctrine, moral teaching, or the social teaching of the Church..."
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Who in the Church community will benefit most from your product?</label>
          <textarea
            value={sections.churchAudience ?? ""}
            onChange={(e) => updateSection("churchAudience", e.target.value)}
            className="input-field"
            rows={2}
            placeholder="e.g. Parish staff, seminarians, catechists, youth groups, religious orders, lay faithful, RCIA candidates, families..."
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">How will your product help people grow in their faith or relationship with God?</label>
          <textarea
            value={sections.faithGrowth ?? ""}
            onChange={(e) => updateSection("faithGrowth", e.target.value)}
            className="input-field"
            rows={3}
            placeholder="Describe the spiritual impact you hope your product will have..."
          />
        </div>
      </section>

      {/* Equity (optional) */}
      <section className="card space-y-4 p-4 sm:p-6">
        <h3 className="section-heading text-lg font-bold text-ink">Equity (optional)</h3>
        <div>
          <label className="mb-1 block text-sm font-semibold">Have you formed any legal entity yet?</label>
          <select
            value={sections.legalEntity ?? ""}
            onChange={(e) => updateSection("legalEntity", (e.target.value as "yes" | "no") || undefined)}
            className="input-field w-auto"
          >
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Planned equity ownership breakdown among founders</label>
          <textarea
            value={sections.equityBreakdown ?? ""}
            onChange={(e) => updateSection("equityBreakdown", e.target.value)}
            className="input-field"
            rows={2}
          />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <span className="text-sm font-semibold">Have you taken any investment?</span>
            <select
              value={sections.takenInvestment ?? ""}
              onChange={(e) => updateSection("takenInvestment", (e.target.value as "yes" | "no") || undefined)}
              className="input-field w-auto"
            >
              <option value="">—</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm font-semibold">Currently fundraising?</span>
            <select
              value={sections.currentlyFundraising ?? ""}
              onChange={(e) => updateSection("currentlyFundraising", (e.target.value as "yes" | "no") || undefined)}
              className="input-field w-auto"
            >
              <option value="">—</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        </div>
      </section>

      {/* Curious */}
      <section className="card space-y-4 p-4 sm:p-6">
        <h3 className="section-heading text-lg font-bold text-ink">Curious</h3>
        <div>
          <label className="mb-1 block text-sm font-semibold">What convinced you to apply to this hackathon? Did someone encourage you?</label>
          <textarea
            value={sections.whyApply ?? ""}
            onChange={(e) => updateSection("whyApply", e.target.value)}
            className="input-field"
            rows={2}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">How did you hear about us?</label>
          <input
            value={sections.howHear ?? ""}
            onChange={(e) => updateSection("howHear", e.target.value)}
            className="input-field"
          />
        </div>
      </section>

      {/* Track */}
      {tracks.length > 0 && (
        <section className="card space-y-4 p-4 sm:p-6">
          <h3 className="section-heading text-lg font-bold text-ink">Track preference</h3>
          <select
            value={sections.trackPreference ?? ""}
            onChange={(e) => updateSection("trackPreference", e.target.value)}
            className="input-field w-auto"
          >
            <option value="">Select a track</option>
            {tracks.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </section>
      )}

      {error ? <p className="text-sm text-red-700 break-words">{error}</p> : null}
      {success ? <p className="text-sm text-mint break-words">{success}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={pending}
          className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save draft"}
        </button>
        {!isSubmitted && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitPending || pending}
            className="rounded-xl border border-accent bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-50"
          >
            {submitPending ? "Submitting…" : "Submit application"}
          </button>
        )}
      </div>

      <p className="text-xs text-black/60">
        After submitting, you can still edit certain sections (founder profiles, founder video, demo, progress). Refresh the page to load the latest.
      </p>
    </div>
  );
}

function FileUpload({
  accept,
  label,
  currentUrl,
  onUpload,
  onUrlChange
}: {
  accept: string;
  label: string;
  currentUrl?: string;
  onUpload: (file: File) => Promise<string | null>;
  onUrlChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await onUpload(file);
      if (url) onUrlChange(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        <label className="cursor-pointer rounded-xl border border-black/20 bg-white/70 px-4 py-2 text-sm font-medium hover:bg-black/5">
          {uploading ? "Uploading…" : label}
          <input
            type="file"
            accept={accept}
            onChange={handleFile}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {currentUrl ? (
          <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
            View uploaded file
          </a>
        ) : null}
      </div>
      {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
    </div>
  );
}
