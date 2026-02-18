"use client";

import { Children, isValidElement, useEffect, useState } from "react";

type TabItem = { id: string; label: string };

type EventPageTabsProps = {
  tabs: TabItem[];
  children: React.ReactNode;
};

export function EventPageTabs({ tabs, children }: EventPageTabsProps) {
  const [activeIndex, setActiveIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    const hash = window.location.hash.replace("#", "");
    const idx = tabs.findIndex((t) => t.id === hash);
    return idx >= 0 ? idx : 0;
  });
  const panels = Children.toArray(children).filter(isValidElement);

  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.replace("#", "");
      const idx = tabs.findIndex((t) => t.id === hash);
      if (idx >= 0) setActiveIndex(idx);
    }
    window.addEventListener("hashchange", onHashChange);
    // Also handle initial hash on mount
    onHashChange();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [tabs]);

  return (
    <div className="space-y-0">
      {/* Tab bar — scroll horizontally on mobile */}
      <nav
        className="flex gap-0 overflow-x-auto border-b border-black/15 bg-white/70 [-webkit-overflow-scrolling:touch]"
        aria-label="Event sections"
        role="tablist"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => {
              setActiveIndex(index);
              window.history.replaceState(null, "", `#${tab.id}`);
            }}
            className={`min-h-[48px] min-w-[44px] flex-shrink-0 rounded-t-xl border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeIndex === index
                ? "border-accent bg-white text-ink shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
                : "border-transparent text-black/60 hover:bg-black/5 hover:text-ink active:bg-black/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Active panel */}
      <div
        role="tabpanel"
        id={`panel-${tabs[activeIndex]?.id}`}
        aria-labelledby={`tab-${tabs[activeIndex]?.id}`}
        className="min-h-[280px] min-w-0 overflow-x-auto rounded-b-xl border border-t-0 border-black/10 bg-white/50 p-4 shadow-sm sm:p-6 break-words"
      >
        {panels[activeIndex] ?? null}
      </div>
    </div>
  );
}
