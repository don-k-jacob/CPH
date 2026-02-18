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
      "A 50-day challenge for developers, designers, and innovators to build products that help people grow spiritually or help the Church take its next leap into the future.",
    tagline: "Build What's Eternal. This Lent, don't just give up something. Build something.",
    dateRange: "February 18, 2026 – Easter Week 2026",
    tags: ["50-day challenge", "Team or Individual", "WhatsApp Community"],
    imagePath: "/lent-hack-logo.png",
    imageAlt: "Lent Hack — Build What's Eternal.",
    location: "Online",
    format: "Public",
    tracks: ["FaithTech", "Education", "Parish Ops", "Digital Mission"],
    whoCanParticipate: "Developers, designers, and innovators. Team or individual. All builders welcome.",
    about: [
      "We are calling all developers, designers, and innovators to a 50-day challenge. Our mission? To create products that help people grow spiritually or help the Church take its next giant leap into the future.",
      "The prompt is simple: Build a NEW product or tool in 50 days. Whether it's an AI-powered prayer assistant, a community coordination platform, a liturgical tool, or a digital mission experience—if it serves the Kingdom, we want to see it."
    ],
    whatToBuild:
      "Build a NEW product or tool in 50 days. Examples: AI-powered prayer assistant, community coordination platform, liturgical tool, or digital mission experience. If it serves the Kingdom, we want to see it.",
    whatToSubmit: [
      "Phase 1 (Ideation): Submit a Problem Statement or Product Concept to the Ideation Board.",
      "Phase 2 (The Build): Form teams, join Discord/WhatsApp technical channels, develop your MVP. Weekly check-in calls and mentorship from Tech Mission team.",
      "Phase 3 (Submission): Submit your GitHub repo, deployed website or app, and a 3-minute demo video on how the app works. Deadline: Easter Week."
    ],
    sections: [
      [
        "Why Participate?",
        "Purpose-Driven Code: Shift your focus from deprivation to creation. Use your professional skills for a higher mission. Community: Connect with like-minded Catholic/Christian techies who share your passion for faith and innovation. Impact: Your project could be the tool that helps thousands of people pray better or helps a parish run more effectively."
      ],
      [
        "Phase 1: Ideation (The Seed)",
        "Identify the Need. Don't have a team or a line of code yet? No problem. Submit a Problem Statement or a Product Concept to our Ideation Board. Goal: Surface the most impactful ideas that developers can then choose to build."
      ],
      [
        "Phase 2: The Build (The Growth)",
        "Build the Solution. This is the 50-day sprint. Pick an idea from the Ideation Phase—or bring your own—and start crafting. Form teams, join the Discord/WhatsApp technical channels, and develop your MVP. Support: Weekly check-in calls and mentorship from the Tech Mission team."
      ],
      [
        "Phase 3: Submission (The Harvest)",
        "Easter Week: Show the Fruit. Finalize your code, record your demo, and show the world what can be built in 50 days of prayer and work. Submit your GitHub repo, deployed website or app, and a 3-minute demo video on how the app works."
      ],
      [
        "Ready to Start?",
        "The journey begins on Ash Wednesday. Join the WhatsApp Community for more information and weekly check-ins. Scan the QR code (on the event page or community) to join."
      ]
    ].map(([title, body]) => ({ title, body })),
    timeline: [
      "Launch: Ash Wednesday (February 18, 2026)",
      "The Build: 50 Days of Innovation",
      "Submission Deadline: Easter Week"
    ],
    prizes: [{ label: "Community showcase", detail: "Featured on Catholic Product Hunt and the broader community." }],
    judgingCriteria: [
      { name: "Impact & relevance", description: "Serves the Kingdom; helps people grow spiritually or the Church move forward." },
      { name: "Technical quality", description: "Solid implementation and sensible architecture." },
      { name: "Presentation", description: "Clear 3-minute demo and communication." }
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
