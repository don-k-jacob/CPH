"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type ParticipantItem = {
  userId: string;
  userName: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  participationType: "TEAM" | "INDIVIDUAL";
  teamName: string | null;
  projectName: string;
  skills?: string[];
  teammatePreference?: string | null;
};

type ParticipantListProps = {
  participants: ParticipantItem[];
  /** When set, show "(You)" next to this participant */
  currentUserId?: string | null;
};

const TEAMMATE_PREFERENCE_LABELS: Record<string, string> = {
  solo: "Working solo",
  looking: "Looking for teammates",
  team: "Already have a team"
};

function ParticipantRow({
  participant: p,
  displayName,
  isYou
}: {
  participant: ParticipantItem;
  displayName: string;
  isYou: boolean;
}) {
  const [avatarError, setAvatarError] = useState(false);
  const skills = Array.isArray(p.skills) ? p.skills : [];
  const showAvatar = p.avatarUrl && !avatarError;

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-black/10 bg-white/70 p-4 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex min-w-0 flex-shrink-0 items-center gap-3">
        {showAvatar ? (
          <Link
            href={p.username ? `/makers/${encodeURIComponent(p.username)}` : "#"}
            className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-black/10 bg-black/5"
          >
            <Image
              src={p.avatarUrl!}
              alt=""
              width={48}
              height={48}
              className="object-cover"
              unoptimized
              onError={() => setAvatarError(true)}
            />
          </Link>
        ) : (
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/5 text-lg font-semibold text-black/50"
            aria-hidden
          >
            {displayName.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        <div className="min-w-0">
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
          </div>
          <span className="text-xs text-black/55">
            {p.participationType === "TEAM" && p.teamName ? `Team: ${p.teamName}` : p.participationType}
          </span>
          {p.teammatePreference && TEAMMATE_PREFERENCE_LABELS[p.teammatePreference] ? (
            <span className="ml-2 text-xs text-black/50">
              · {TEAMMATE_PREFERENCE_LABELS[p.teammatePreference]}
            </span>
          ) : null}
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-1 border-t border-black/10 pt-2 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0">
        {p.bio?.trim() ? (
          <p className="text-sm text-black/75">{p.bio}</p>
        ) : null}
        {skills.length > 0 ? (
          <p className="text-sm text-black/75">
            <span className="font-medium text-black/80">Skills: </span>
            {skills.join(", ")}
          </p>
        ) : null}
        {String(p.projectName ?? "").trim() ? (
          <p className="text-sm text-black/75">
            <span className="font-medium text-black/80">Project: </span>
            {p.projectName}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function ParticipantList({ participants, currentUserId }: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <p className="text-sm text-black/60">
        No participants yet. Be the first—register via the Join hackathon button above.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="section-heading text-lg font-bold text-ink">Registered participants</h3>
      {currentUserId && participants.some((p) => p.userId === currentUserId) ? (
        <p className="text-sm text-mint font-medium">You&apos;re in the list below.</p>
      ) : null}
      <ul className="space-y-3">
        {participants.map((p) => {
          const displayName = p.userName?.trim() || p.username?.trim() || "Participant";
          const isYou = currentUserId && p.userId === currentUserId;
          return (
            <ParticipantRow
              key={p.userId}
              participant={p}
              displayName={displayName}
              isYou={!!isYou}
            />
          );
        })}
      </ul>
    </div>
  );
}
