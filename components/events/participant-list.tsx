"use client";

import Link from "next/link";

export type ParticipantItem = {
  userId: string;
  userName: string;
  username: string;
  participationType: "TEAM" | "INDIVIDUAL";
  teamName: string | null;
  projectName: string;
};

type ParticipantListProps = {
  participants: ParticipantItem[];
  /** When set, show "(You)" next to this participant */
  currentUserId?: string | null;
};

export function ParticipantList({ participants, currentUserId }: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <p className="text-sm text-black/60">
        No participants yet. Be the first—register in the Register tab.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="section-heading text-lg font-bold text-ink">Registered participants</h3>
      {currentUserId && participants.some((p) => p.userId === currentUserId) ? (
        <p className="text-sm text-mint font-medium">You&apos;re in the list below.</p>
      ) : null}
      <ul className="space-y-2">
        {participants.map((p) => {
          const displayName = p.userName?.trim() || p.username?.trim() || "Participant";
          const isYou = currentUserId && p.userId === currentUserId;
          return (
            <li
              key={p.userId}
              className="flex flex-col gap-0.5 rounded-xl border border-black/10 bg-white/70 px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                {p.username ? (
                  <Link
                    href={`/makers/${encodeURIComponent(p.username)}`}
                    className="font-semibold text-ink hover:text-accent hover:underline"
                  >
                    {displayName}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink">{displayName}</span>
                )}
                {isYou ? <span className="text-xs font-medium text-accent">(You)</span> : null}
                <span className="text-xs text-black/55">
                  {p.participationType === "TEAM" && p.teamName ? `Team: ${p.teamName}` : p.participationType}
                </span>
              </div>
              {p.projectName?.trim() ? (
                <p className="text-sm text-black/70">{p.projectName}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
