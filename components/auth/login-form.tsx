"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? "")
      })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Login failed");
      setPending(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto max-w-md space-y-4 p-6 md:p-7">
      <span className="ornament">Welcome Back</span>
      <h1 className="section-heading text-3xl font-bold">Log in</h1>
      <div>
        <label className="mb-1 block text-sm font-semibold">Email</label>
        <input name="email" type="email" required className="input-field" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Password</label>
        <input name="password" type="password" required className="input-field" />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">
        {pending ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-sm text-black/70">
        No account?{" "}
        <Link href="/signup" className="underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
