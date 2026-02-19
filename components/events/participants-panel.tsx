"use client";

import { useEffect, useState } from "react";
import type { ParticipantItem } from "./participant-list";
import { ParticipantList } from "./participant-list";

type ParticipantsPanelProps = {
  eventSlug: string;
  initialParticipants: ParticipantItem[];
  currentUserId: string | null;
};

export function ParticipantsPanel({
  eventSlug,
  initialParticipants,
  currentUserId
}: ParticipantsPanelProps) {
  const [participants, setParticipants] = useState<ParticipantItem[]>(initialParticipants);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialParticipants.length > 0) return;
    setLoading(true);
    fetch(`/api/events/${encodeURIComponent(eventSlug)}/participants`)
      .then((res) => res.json())
      .then((data: { participants?: ParticipantItem[]; error?: string }) => {
        if (Array.isArray(data.participants)) setParticipants(data.participants);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventSlug, initialParticipants.length]);

  if (loading && participants.length === 0) {
    return <p className="text-sm text-black/60">Loading participants…</p>;
  }

  return (
    <ParticipantList
      participants={participants}
      currentUserId={currentUserId}
    />
  );
}
