"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type NavItem = { href: string; label: string };
type User = { username: string } | null;

export function MobileNav({ nav, user }: { nav: NavItem[]; user: User }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function close() {
    setOpen(false);
    menuButtonRef.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    close();
    router.push("/login");
    router.refresh();
  }

  const drawerContent = open ? (
    <div
      className="fixed inset-0 z-[9999]"
      role="presentation"
      style={{ isolation: "isolate" }}
    >
      <div
        className="absolute inset-0 bg-black/55"
        aria-hidden
        onClick={close}
        onKeyDown={(e) => e.key === "Enter" && close()}
      />
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 flex h-full max-h-[100dvh] w-[min(100%,320px)] flex-col border-l-2 border-black/20 bg-[#f7f1e4] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="flex min-h-[56px] flex-shrink-0 items-center justify-between border-b border-black/10 px-4">
          <span className="text-base font-semibold text-ink">Menu</span>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-ink transition active:bg-black/10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav
          className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto overflow-x-hidden p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="flex min-h-[48px] min-w-0 items-center rounded-xl px-4 py-3 text-base font-medium text-ink transition active:bg-black/5"
            >
              {item.label}
            </Link>
          ))}
          <div className="my-2 border-t border-black/10" />
          <Link
            href={user ? "/submit" : "/login"}
            onClick={close}
            className="flex min-h-[48px] items-center rounded-xl bg-accent/10 px-4 py-3 text-base font-semibold text-accent transition active:bg-accent/20"
          >
            {user ? "Launch Product" : "Log in"}
          </Link>
          {user ? (
            <>
              <Link
                href={`/makers/${user.username}`}
                onClick={close}
                className="flex min-h-[48px] items-center rounded-xl px-4 py-3 text-base text-black/70 transition active:bg-black/5"
              >
                @{user.username}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-[48px] w-full min-w-0 items-center rounded-xl px-4 py-3 text-left text-base text-black/70 transition active:bg-black/5"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/signup"
              onClick={close}
              className="flex min-h-[48px] items-center rounded-xl px-4 py-3 text-base font-medium text-ink transition active:bg-black/5"
            >
              Sign up
            </Link>
          )}
        </nav>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={menuButtonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-haspopup="true"
        className="flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-full border-2 border-ink/25 bg-white text-ink shadow-sm transition active:bg-stone md:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {mounted && typeof document !== "undefined" && drawerContent
        ? createPortal(drawerContent, document.body)
        : null}
    </>
  );
}
