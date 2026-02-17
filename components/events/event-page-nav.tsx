"use client";

type NavItem = { id: string; label: string };

type EventPageNavProps = {
  items: NavItem[];
};

export function EventPageNav({ items }: EventPageNavProps) {
  return (
    <nav
      className="sticky top-[calc(var(--header-offset,0)+0.5rem)] z-10 -mx-1 flex flex-wrap gap-1 rounded-xl border border-black/10 bg-white/90 px-2 py-2 shadow-sm backdrop-blur sm:top-[calc(var(--header-offset,0)+1rem)]"
      aria-label="Event sections"
    >
      {items.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          className="rounded-lg px-3 py-2 text-sm font-medium text-black/75 transition-colors hover:bg-black/5 hover:text-ink"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
