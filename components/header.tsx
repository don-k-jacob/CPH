import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { MobileNav } from "@/components/header/mobile-nav";

export async function Header() {
  let user = null as Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }

  const nav = [
    { href: "/", label: "Today" },
    { href: "/events", label: "Events" },
    { href: "/products", label: "Listings" },
    { href: "/upcoming", label: "Upcoming" },
    { href: "/search", label: "Search" },
    ...(user
      ? [
          { href: "/my-products", label: "My Products" },
          { href: "/profile", label: "Profile" },
          { href: "/notifications", label: "Notifications" },
          { href: "/settings", label: "Settings" }
        ]
      : [])
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-base/95 backdrop-blur-md">
      <div className="container min-w-0 py-2 sm:py-3">
        <div className="flex min-h-[44px] min-w-0 items-center justify-between gap-2">
          <Link
            href="/"
            className="group flex min-h-[44px] min-w-0 flex-1 items-center gap-2 overflow-hidden sm:flex-initial sm:gap-3"
          >
            <span className="flex-shrink-0 rounded-full border border-gold/50 bg-accentSoft px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent sm:px-3">
              CPH
            </span>
            <span className="min-w-0 overflow-hidden">
              <span
                className="block truncate text-sm font-bold text-ink sm:text-base md:text-lg"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Catholic Product Hunt
              </span>
              <span className="hidden text-xs tracking-[0.16em] text-black/55 uppercase sm:block">Launch With Purpose</span>
            </span>
          </Link>

          <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
            <MobileNav nav={nav} user={user ? { username: user.username } : null} />
            <Link
              href={user ? "/submit" : "/login"}
              className="btn-primary inline-flex min-h-[44px] min-w-[44px] items-center justify-center whitespace-nowrap px-3 py-2.5 text-sm sm:min-w-0 sm:px-4"
            >
              <span className="sm:hidden">Launch</span>
              <span className="hidden sm:inline">Launch Product</span>
            </Link>
            <div className="hidden md:flex md:items-center md:gap-2">
              {user ? (
                <>
                  <Link href={`/makers/${user.username}`} className="flex min-h-[44px] items-center text-sm text-black/70 underline">
                    @{user.username}
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login" className="flex min-h-[44px] items-center text-sm text-black/70 underline">
                    Log in
                  </Link>
                  <Link href="/signup" className="flex min-h-[44px] items-center text-sm text-black/70 underline">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <nav className="mt-3 hidden gap-2 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="min-h-[44px] flex-shrink-0 whitespace-nowrap rounded-full border border-black/10 bg-white/60 px-4 py-2.5 text-sm text-black/70 transition-colors hover:border-accent/30 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
