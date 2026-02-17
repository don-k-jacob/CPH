"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NAME_MAX = 40;
const TAGLINE_MAX = 60;
const DESCRIPTION_MAX = 500;
const SUGGESTED_TAGS = [
  "FaithTech",
  "Education",
  "Parish Ops",
  "Charity",
  "Family",
  "AI",
  "Developer Tools",
  "Productivity",
  "Community"
];

const STEPS = [
  { id: "main", label: "Main info" },
  { id: "makers", label: "Makers" },
  { id: "media", label: "Images and media" },
  { id: "review", label: "Launch checklist" }
];

export function LaunchWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [uploaded, setUploaded] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [extraLinks, setExtraLinks] = useState<string[]>([""]);
  const [isOpenSource, setIsOpenSource] = useState(false);
  const [xAccount, setXAccount] = useState("");
  const [topicNames, setTopicNames] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [firstComment, setFirstComment] = useState("");
  const [iWorkedOnThis, setIWorkedOnThis] = useState<boolean | null>(null);
  const [makerSearch, setMakerSearch] = useState("");
  const [addedMakers, setAddedMakers] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [youtubeInput, setYoutubeInput] = useState("");
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);

  function addExtraLink() {
    setExtraLinks((prev) => [...prev, ""]);
  }
  function setExtraLinkAt(i: number, v: string) {
    setExtraLinks((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  }
  function removeExtraLink(i: number) {
    setExtraLinks((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addTag(tag: string) {
    const t = tag.trim();
    if (!t || topicNames.length >= 3 || topicNames.includes(t)) return;
    setTopicNames((prev) => [...prev, t]);
    setTopicInput("");
  }
  function removeTag(t: string) {
    setTopicNames((prev) => prev.filter((x) => x !== t));
  }

  function validateStep0(): boolean {
    if (!name.trim()) {
      setValidation("Name is required.");
      return false;
    }
    if (name.length > NAME_MAX) {
      setValidation(`Name must be ${NAME_MAX} characters or fewer.`);
      return false;
    }
    if (!tagline.trim()) {
      setValidation("Tagline is required.");
      return false;
    }
    if (tagline.length > TAGLINE_MAX) {
      setValidation(`Tagline must be ${TAGLINE_MAX} characters or fewer.`);
      return false;
    }
    if (topicNames.length === 0) {
      setValidation("Select at least one launch tag.");
      return false;
    }
    if (!firstComment.trim()) {
      setValidation("First comment is required to start the discussion.");
      return false;
    }
    if (firstComment.length < 10) {
      setValidation("First comment should be at least 10 characters.");
      return false;
    }
    if (!description.trim() || description.length < 20) {
      setValidation("Description must be at least 20 characters.");
      return false;
    }
    if (description.length > DESCRIPTION_MAX) {
      setValidation(`Description must be ${DESCRIPTION_MAX} characters or fewer.`);
      return false;
    }
    if (!websiteUrl.trim()) {
      setValidation("Website URL is required.");
      return false;
    }
    try {
      new URL(websiteUrl);
    } catch {
      setValidation("Please enter a valid website URL.");
      return false;
    }
    setValidation(null);
    return true;
  }

  function goToStep(i: number) {
    setValidation(null);
    setStep(i);
  }

  function nextStep() {
    setValidation(null);
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }

  function prevStep() {
    setValidation(null);
    if (step > 0) setStep((s) => s - 1);
  }

  function addMaker() {
    const v = makerSearch.trim().replace(/^@/, "");
    if (!v || addedMakers.includes(v)) return;
    setAddedMakers((prev) => [...prev, v]);
    setMakerSearch("");
  }

  function removeMaker(m: string) {
    setAddedMakers((prev) => prev.filter((x) => x !== m));
  }

  function normalizeYoutubeUrl(input: string): string | null {
    const s = input.trim();
    if (!s) return null;
    const match =
      s.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/) ||
      s.match(/^([a-zA-Z0-9_-]{11})$/);
    if (match) return `https://www.youtube.com/watch?v=${match[1]}`;
    return null;
  }

  function addYoutubeUrl() {
    const url = normalizeYoutubeUrl(youtubeInput);
    if (!url || youtubeUrls.includes(url)) return;
    setYoutubeUrls((prev) => [...prev, url]);
    setYoutubeInput("");
  }

  function removeYoutubeUrl(url: string) {
    setYoutubeUrls((prev) => prev.filter((u) => u !== url));
  }

  async function submit() {
    setError(null);
    setValidation(null);
    if (!validateStep0()) return;

    setPending(true);

    const media: { type: "IMAGE" | "VIDEO"; url: string }[] = [];
    for (const file of imageFiles) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Media upload failed.");
        setPending(false);
        return;
      }
      const payload = (await res.json()) as { type: "IMAGE" | "VIDEO"; url: string };
      media.push(payload);
      setUploaded((n) => n + 1);
    }
    youtubeUrls.forEach((url) => media.push({ type: "VIDEO", url }));

    const payload = {
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      websiteUrl: websiteUrl.trim(),
      logoUrl: logoUrl.trim() || undefined,
      topicNames,
      media
    };

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Unable to submit launch.");
      setPending(false);
      return;
    }

    const data = (await response.json()) as { slug: string; launchId: string };
    if (data.launchId && firstComment.trim()) {
      await fetch(`/api/launches/${data.launchId}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: firstComment.trim() })
      });
    }
    setPending(false);
    router.push(`/products/${data.slug}`);
  }

  return (
    <div className="space-y-8">
      {/* Progress — all tabs clickable; scroll on small screens */}
      <nav aria-label="Launch steps" className="-mx-1 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goToStep(i)}
            aria-current={i === step ? "step" : undefined}
            className={`min-h-[44px] min-w-[44px] flex-shrink-0 rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition sm:flex-1 ${
              i === step
                ? "border-accent bg-accentSoft/50 text-ink"
                : "border-black/20 bg-white/80 text-black/70 hover:bg-white hover:border-black/30"
            }`}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {validation ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {validation}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {/* Step 0: Main info */}
      {step === 0 && (
        <div className="space-y-6">
          <p className="text-sm text-black/70">
            Tell us more about this launch. We’ll need its name, tagline, links, launch tags, and description.
          </p>

          <div>
            <label className="mb-1 block text-sm font-semibold">Name of the launch</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ClawSwitch.com"
              maxLength={NAME_MAX + 1}
              className="input-field"
            />
            <p className="mt-1 text-xs text-black/55">{name.length}/{NAME_MAX}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Tagline</label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Concise and descriptive tagline for the launch"
              maxLength={TAGLINE_MAX + 1}
              className="input-field"
            />
            <p className="mt-1 text-xs text-black/55">{tagline.length}/{TAGLINE_MAX} • Tagline is required</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Links</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://www.example.com/"
              className="input-field"
            />
            {extraLinks.map((link, i) => (
              <div key={i} className="mt-2 flex gap-2">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setExtraLinkAt(i, e.target.value)}
                  placeholder="App Store, Google Play, Steam…"
                  className="input-field flex-1"
                />
                <button type="button" onClick={() => removeExtraLink(i)} className="rounded-lg border border-black/20 px-3 text-sm">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addExtraLink} className="mt-2 text-sm font-medium text-accent hover:underline">
              + Add more links
            </button>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isOpenSource} onChange={(e) => setIsOpenSource(e.target.checked)} />
            <span className="text-sm">Is this an open source project?</span>
          </label>

          <div>
            <label className="mb-1 block text-sm font-semibold">X account of the launch</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-black/55">x.com/</span>
              <input
                value={xAccount}
                onChange={(e) => setXAccount(e.target.value.replace(/^@/, ""))}
                placeholder="@launch"
                className="input-field flex-1"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Description</label>
            <p className="mb-2 text-xs text-black/60">
              What’s new or different about your launch? Which features make it stand out?
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description of the launch"
              rows={4}
              maxLength={DESCRIPTION_MAX + 1}
              className="input-field"
            />
            <p className="mt-1 text-xs text-black/55">{description.length}/{DESCRIPTION_MAX}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Launch tags</label>
            <p className="mb-2 text-xs text-black/60">Select up to three launch tags.</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addTag(t)}
                  disabled={topicNames.length >= 3 || topicNames.includes(t)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    topicNames.includes(t) ? "border-accent bg-accentSoft text-ink" : "border-black/20 hover:bg-black/5"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {topicNames.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-accentSoft/70 px-3 py-1 text-xs">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="hover:text-red-700">×</button>
                </span>
              ))}
              {topicNames.length < 3 && (
                <input
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(topicInput))}
                  placeholder="Or type and press Enter"
                  className="w-40 rounded-lg border border-black/20 px-2 py-1 text-xs"
                />
              )}
            </div>
            <p className="mt-1 text-xs text-black/55">• Launch tag is required</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Write the first comment</label>
            <p className="mb-2 text-xs text-black/60">
              This comment will be posted upon launch. Adding a first comment helps start the discussion.
            </p>
            <textarea
              value={firstComment}
              onChange={(e) => setFirstComment(e.target.value)}
              placeholder="What inspired you to build this? What problem were you trying to solve?"
              rows={4}
              className="input-field"
            />
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={nextStep} className="btn-primary min-h-[48px] px-6 py-3 text-sm">
              Next step: Makers
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Makers */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-ink">Did you work on this launch?</h3>
            <p className="mt-1 text-sm text-black/70">It’s fine either way. Just need to know.</p>
            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/15 bg-white/80 p-4 transition hover:bg-white">
                <input
                  type="radio"
                  name="workedOn"
                  checked={iWorkedOnThis === true}
                  onChange={() => setIWorkedOnThis(true)}
                  className="mt-1"
                />
                <div>
                  <span className="font-semibold text-ink">I worked on this product</span>
                  <p className="mt-0.5 text-sm text-black/65">I’ll be listed as both Hunter and Maker of this product.</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/15 bg-white/80 p-4 transition hover:bg-white">
                <input
                  type="radio"
                  name="workedOn"
                  checked={iWorkedOnThis === false}
                  onChange={() => setIWorkedOnThis(false)}
                  className="mt-1"
                />
                <div>
                  <span className="font-semibold text-ink">I didn’t work on this product</span>
                  <p className="mt-0.5 text-sm text-black/65">I’ll be listed as Hunter of this product.</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-ink">Who worked on this launch?</h3>
            <p className="mt-1 text-sm text-black/70">You’re free to add anyone who worked on this launch.</p>
            <p className="mt-2 text-sm font-medium text-black/75">Makers</p>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={makerSearch}
                onChange={(e) => setMakerSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMaker())}
                placeholder="Add by username or email"
                className="input-field flex-1"
              />
              <button type="button" onClick={addMaker} className="btn-secondary whitespace-nowrap px-4 py-2.5 text-sm">
                Add
              </button>
            </div>
            {addedMakers.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {addedMakers.map((m) => (
                  <li key={m} className="flex items-center justify-between rounded-lg border border-black/10 bg-white/70 py-2 pl-3 pr-2">
                    <span className="text-sm font-medium">{m}</span>
                    <button type="button" onClick={() => removeMaker(m)} className="rounded p-1 text-black/60 hover:bg-black/10 hover:text-ink">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button type="button" onClick={prevStep} className="btn-secondary order-2 min-h-[48px] px-5 py-3 text-sm sm:order-1">
              Back
            </button>
            <button type="button" onClick={nextStep} className="btn-primary order-1 min-h-[48px] px-6 py-3 text-sm sm:order-2">
              Next step: Images and media
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Images and media */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-semibold">Logo URL</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://…"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Images</label>
            <p className="mb-2 text-xs text-black/60">Upload one or more images. JPG, PNG, WEBP, GIF. Max 25MB each.</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))}
              className="input-field"
            />
            {imageFiles.length > 0 ? (
              <p className="mt-2 text-sm text-black/70">{imageFiles.length} image(s) selected.</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">YouTube videos</label>
            <p className="mb-2 text-xs text-black/60">Add one or more YouTube video links.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={youtubeInput}
                onChange={(e) => setYoutubeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addYoutubeUrl())}
                placeholder="https://youtube.com/watch?v=… or youtu.be/…"
                className="input-field flex-1"
              />
              <button type="button" onClick={addYoutubeUrl} className="btn-secondary whitespace-nowrap px-4 py-2.5 text-sm">
                Add
              </button>
            </div>
            {youtubeUrls.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {youtubeUrls.map((url) => (
                  <li key={url} className="flex items-center justify-between rounded-lg border border-black/10 bg-white/70 py-2 pl-3 pr-2">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="truncate text-sm text-accent hover:underline">
                      {url}
                    </a>
                    <button type="button" onClick={() => removeYoutubeUrl(url)} className="ml-2 rounded p-1 text-black/60 hover:bg-black/10 hover:text-ink">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button type="button" onClick={prevStep} className="btn-secondary order-2 min-h-[48px] px-5 py-3 text-sm sm:order-1">
              Back
            </button>
            <button type="button" onClick={nextStep} className="btn-primary order-1 min-h-[48px] px-6 py-3 text-sm sm:order-2">
              Next step: Launch checklist
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & launch */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="card space-y-4 p-6">
            <h3 className="font-bold text-ink">Summary</h3>
            <p><span className="text-black/60">Name:</span> {name || "—"}</p>
            <p><span className="text-black/60">Tagline:</span> {tagline || "—"}</p>
            <p><span className="text-black/60">Website:</span> {websiteUrl || "—"}</p>
            <p><span className="text-black/60">Tags:</span> {topicNames.length ? topicNames.join(", ") : "—"}</p>
            <p><span className="text-black/60">Description:</span> {description.slice(0, 100)}{description.length > 100 ? "…" : ""}</p>
            <p><span className="text-black/60">First comment:</span> {firstComment.slice(0, 80)}{firstComment.length > 80 ? "…" : ""}</p>
            <p><span className="text-black/60">Role:</span> {iWorkedOnThis === true ? "Hunter + Maker" : iWorkedOnThis === false ? "Hunter only" : "—"}</p>
            {addedMakers.length > 0 ? (
              <p><span className="text-black/60">Makers:</span> {addedMakers.join(", ")}</p>
            ) : null}
            <p><span className="text-black/60">Media:</span> {imageFiles.length} image(s), {youtubeUrls.length} YouTube video(s)</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button type="button" onClick={prevStep} className="btn-secondary order-2 min-h-[48px] px-5 py-3 text-sm sm:order-1">
              Back
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="btn-primary order-1 min-h-[48px] px-6 py-3 text-sm disabled:opacity-50 sm:order-2"
            >
              {pending ? (uploaded > 0 ? `Uploading ${uploaded}…` : "Submitting…") : "Launch Product"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
