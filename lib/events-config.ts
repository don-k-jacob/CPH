/**
 * Event metadata by slug. Registration, stats, and teammate posts are stored in Firestore
 * and keyed by eventSlug. Config drives visible content — Devpost-style layout.
 */
export type EventConfig = {
  slug: string;
  title: string;
  description: string;
  tagline?: string;
  dateRange: string;
  tags: string[];
  imagePath?: string;
  imageAlt?: string;
  sections: { title: string; body: string }[];
  timeline: string[];
  /** Devpost-style: location e.g. "Hong Kong" or "Online" */
  location?: string;
  /** e.g. "Public", "Hybrid", "In-person" */
  format?: string;
  /** Track labels e.g. ["FaithTech", "Education"] */
  tracks?: string[];
  /** Longer about / challenge description (paragraphs) */
  about?: string[];
  /** What to build */
  whatToBuild?: string;
  /** What to submit (list or paragraph) */
  whatToSubmit?: string[];
  /** Full rules URL */
  rulesUrl?: string;
  /** Schedule / calendar URL */
  scheduleUrl?: string;
  /** Who can participate (short line) */
  whoCanParticipate?: string;
  /** Sponsor name + optional URL */
  sponsors?: { name: string; url?: string }[];
  /** Prize label, e.g. "Community showcase" or "$X in prizes" */
  prizes?: { label: string; detail?: string }[];
  /** Judge name + role */
  judges?: { name: string; role?: string }[];
  /** Judging criteria */
  judgingCriteria?: { name: string; description: string }[];
};

const EVENTS: EventConfig[] = [
  {
    slug: "lent-hack-2026",
    title: "Lent Hack 2026",
    description:
      "A Catholic product sprint where makers commit to build one meaningful feature or one complete tool in the spirit of discipline, service, and excellence.",
    tagline: "This Lent... Don't Just Fast. Build.",
    dateRange: "March 2, 2026 - April 12, 2026",
    tags: ["Hybrid sessions + Discord", "Team or Individual"],
    imagePath: "/lent-hack-logo.png",
    imageAlt: "Lent Hack — This Lent... Don't Just Fast. Build.",
    location: "Hybrid",
    format: "Public",
    tracks: ["FaithTech", "Education", "Parish Ops", "Charity"],
    whoCanParticipate: "Team or individual. All builders welcome.",
    about: [
      "Lent Hack is a product sprint where makers commit to build one meaningful feature or one complete tool in the spirit of discipline, service, and excellence.",
      "Create tools for parish life, catechesis, outreach, and family formation. Weekly office hours from Catholic product leaders and engineers. Pitch your build at the final showcase."
    ],
    whatToBuild: "One meaningful feature or one complete tool for mission: parish life, catechesis, education, or charity infrastructure.",
    whatToSubmit: ["Project name and short description", "Link to repo or demo", "Optional 2-minute demo video"],
    sections: [
      ["Build for Mission", "Create tools for parish life, catechesis, outreach, and family formation."],
      ["Mentorship", "Weekly office hours from Catholic product leaders and engineers."],
      ["Tracks", "FaithTech, Education, Parish Ops, and Charity Infrastructure."],
      ["Final Showcase", "Pitch your build to judges and the broader community."]
    ].map(([title, body]) => ({ title, body })),
    timeline: [
      "Applications Open: February 20, 2026",
      "Team Matching Sprint: February 24 - March 1",
      "Kickoff Session: March 2",
      "Build Weeks: March 3 - April 6",
      "Mentor Reviews: Every Saturday",
      "Final Demo Day: April 12"
    ],
    prizes: [{ label: "Community showcase", detail: "Featured on Catholic Product Hunt" }],
    judgingCriteria: [
      { name: "Impact & relevance", description: "Solves a real need for users and mission." },
      { name: "Technical quality", description: "Clean implementation and sensible architecture." },
      { name: "Presentation", description: "Clear demo and communication." }
    ]
  }
];

const bySlug = new Map<string, EventConfig>(EVENTS.map((e) => [e.slug, e]));

export function getEventBySlug(slug: string): EventConfig | null {
  return bySlug.get(slug) ?? null;
}

export function getAllEventSlugs(): string[] {
  return EVENTS.map((e) => e.slug);
}

export function getAllEvents(): EventConfig[] {
  return [...EVENTS];
}
