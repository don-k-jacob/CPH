"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubmitForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<number>(0);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const files = formData.getAll("media").filter((value): value is File => value instanceof File && value.size > 0);

    const media: { type: "IMAGE" | "VIDEO"; url: string }[] = [];
    let done = 0;
    setUploaded(0);

    for (const file of files) {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadData
      });

      if (!uploadResponse.ok) {
        const uploadError = (await uploadResponse.json().catch(() => ({}))) as { error?: string };
        setError(uploadError.error ?? "Media upload failed.");
        setPending(false);
        return;
      }

      const uploadPayload = (await uploadResponse.json()) as { type: "IMAGE" | "VIDEO"; url: string };
      media.push(uploadPayload);
      done += 1;
      setUploaded(done);
    }

    const payload = {
      name: String(formData.get("name") ?? ""),
      tagline: String(formData.get("tagline") ?? ""),
      description: String(formData.get("description") ?? ""),
      websiteUrl: String(formData.get("websiteUrl") ?? ""),
      logoUrl: String(formData.get("logoUrl") ?? ""),
      topicNames: String(formData.get("topicNames") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
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

    const data = (await response.json()) as { slug: string };
    router.push(`/products/${data.slug}`);
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <span className="ornament">Offer Your Work</span>
      <div>
        <label className="mb-1 block text-sm font-semibold">Product name</label>
        <input name="name" required className="input-field" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Tagline</label>
        <input name="tagline" required className="input-field" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Description</label>
        <textarea name="description" required rows={4} className="input-field" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Website URL</label>
        <input name="websiteUrl" required type="url" className="input-field" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Logo URL</label>
        <input name="logoUrl" type="url" className="input-field" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Topics (comma separated)</label>
        <input name="topicNames" placeholder="Education, Charity, Family, AI" className="input-field" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Photo or video upload</label>
        <input name="media" type="file" accept="image/*,video/*" multiple className="input-field" />
        <p className="mt-1 text-xs text-black/60">Supports JPG, PNG, WEBP, GIF, MP4, WEBM, MOV. Max 25MB each.</p>
      </div>
      {pending && uploaded > 0 ? <p className="text-sm text-black/70">Uploaded {uploaded} media file(s)...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary px-6 py-3 text-sm disabled:opacity-50">
        {pending ? "Submitting..." : "Launch Product"}
      </button>
    </form>
  );
}
