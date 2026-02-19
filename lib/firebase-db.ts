import { getLegacyCollectionName, getVersionedCollectionName, type DbCollectionKey } from "@/lib/db/schema";
import { getFirestore } from "@/lib/firebase-admin";

export type UserRecord = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  /** Short experience / background (e.g. "Full-stack dev, 5 years" or "Student, designer") */
  experience: string | null;
  linkedInUrl: string | null;
  xUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  role: "USER" | "MODERATOR" | "ADMIN";
  createdAt: string;
  updatedAt: string;
};

export type TopicRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
};

export type ProductMediaRecord = {
  id: string;
  productId: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  createdAt: string;
};

export type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  logoUrl: string | null;
  status: "DRAFT" | "SCHEDULED" | "LIVE" | "ARCHIVED";
  makerId: string;
  topicSlugs: string[];
  createdAt: string;
  updatedAt: string;
};

export type LaunchRecord = {
  id: string;
  productId: string;
  hunterId: string;
  launchDate: string;
  status: "DRAFT" | "SCHEDULED" | "LIVE" | "ARCHIVED";
  heroImageUrl: string | null;
  galleryJson: string | null;
  createdAt: string;
};

export type CommentRecord = {
  id: string;
  launchId: string;
  userId: string;
  body: string;
  parentId: string | null;
  createdAt: string;
};

export type NotificationRecord = {
  id: string;
  userId: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

/** Teammate preference from short registration form (Devpost-style). */
export type TeammatePreference = "solo" | "looking" | "team";

/** Snapshot of user display fields stored on the registration for single-query participant lists. */
export type EventRegistrationUserSnapshot = {
  userName: string;
  userUsername: string;
  userAvatarUrl: string | null;
  userBio: string | null;
};

export type EventRegistrationRecord = {
  id: string;
  eventSlug: string;
  userId: string;
  participationType: "TEAM" | "INDIVIDUAL";
  teamName: string | null;
  projectName: string;
  skills: string[];
  bio: string;
  /** From short form: Working solo / Looking for teammates / Already have a team */
  teammatePreference: TeammatePreference | null;
  /** How they heard about the event */
  referralSource: string | null;
  eligibilityAgreed: boolean;
  rulesAgreed: boolean;
  createdAt: string;
  updatedAt: string;
  /** Denormalized from users for participant list (avoids N+1 reads). Optional for backward compatibility. */
  userName?: string;
  userUsername?: string;
  userAvatarUrl?: string | null;
  userBio?: string | null;
};

export type TeammatePostRecord = {
  id: string;
  eventSlug: string;
  userId: string;
  participationType: "TEAM" | "INDIVIDUAL";
  lookingFor: string[];
  message: string;
  createdAt: string;
};

/** Team member on an event application (like YC co-founder). */
export type EventApplicationTeamMember = {
  email: string;
  userId: string | null;
  status: "invited" | "profile_incomplete" | "complete";
};

/** YC-style application sections. All fields optional for draft. */
export type EventApplicationSections = {
  // Founders / Team
  foundersKnownHowLong?: string;
  whoWritesCode?: string;
  lookingForCofounder?: string;
  founderVideoUrl?: string;
  // Company / Project
  companyName?: string;
  tagline50?: string;
  companyUrl?: string;
  demoVideoUrl?: string;
  demoFileUrl?: string;
  productLink?: string;
  productLinkCredentials?: string;
  whatWillYouMake?: string;
  location?: string;
  locationReason?: string;
  // Progress
  howFarAlong?: string;
  howLongWorking?: string;
  techStack?: string;
  codingSessionUrl?: string;
  peopleUsingProduct?: "yes" | "no";
  haveRevenue?: "yes" | "no";
  previousBatchChange?: string;
  otherIncubator?: string;
  // Idea
  whyThisIdea?: string;
  competitors?: string;
  howMakeMoney?: string;
  category?: string;
  otherIdeas?: string;
  // Equity (optional)
  legalEntity?: "yes" | "no";
  equityBreakdown?: string;
  takenInvestment?: "yes" | "no";
  currentlyFundraising?: "yes" | "no";
  // Catholic Mission
  catholicMission?: string;
  churchProblem?: string;
  catholicTeachingAlignment?: string;
  churchAudience?: string;
  faithGrowth?: string;
  // Curious
  whyApply?: string;
  howHear?: string;
  // Track
  trackPreference?: string;
};

export type EventApplicationRecord = {
  id: string;
  eventSlug: string;
  userId: string;
  status: "draft" | "submitted";
  submittedAt: string | null;
  teamMembers: EventApplicationTeamMember[];
  sections: EventApplicationSections;
  createdAt: string;
  updatedAt: string;
};

function asISOString(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: unknown }).toDate === "function") {
    const date = (value as { toDate: () => Date }).toDate();
    return date.toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function nowIso(): string {
  return new Date().toISOString();
}

function extractUserIdFromEventRegistrationDocId(docId: string, eventSlug: string): string {
  if (!docId) return "";
  const normalizedEventSlug = eventSlug.trim();
  if (normalizedEventSlug) {
    const prefix = `${normalizedEventSlug}_`;
    if (docId.startsWith(prefix) && docId.length > prefix.length) {
      return docId.slice(prefix.length);
    }
  }
  const separator = docId.indexOf("_");
  if (separator < 0 || separator >= docId.length - 1) return "";
  return docId.slice(separator + 1);
}

function normalizeUser(id: string, data: Record<string, unknown>): UserRecord {
  return {
    id,
    email: String(data.email ?? ""),
    username: String(data.username ?? ""),
    passwordHash: String(data.passwordHash ?? ""),
    name: String(data.name ?? ""),
    bio: data.bio ? String(data.bio) : null,
    avatarUrl: data.avatarUrl ? String(data.avatarUrl) : null,
    experience: data.experience ? String(data.experience) : null,
    linkedInUrl: data.linkedInUrl ? String(data.linkedInUrl) : null,
    xUrl: data.xUrl ? String(data.xUrl) : null,
    githubUrl: data.githubUrl ? String(data.githubUrl) : null,
    websiteUrl: data.websiteUrl ? String(data.websiteUrl) : null,
    role: (data.role as UserRecord["role"]) ?? "USER",
    createdAt: asISOString(data.createdAt),
    updatedAt: asISOString(data.updatedAt)
  };
}

function normalizeTopic(id: string, data: Record<string, unknown>): TopicRecord {
  return {
    id,
    name: String(data.name ?? ""),
    slug: String(data.slug ?? ""),
    description: data.description ? String(data.description) : null,
    createdAt: asISOString(data.createdAt)
  };
}

function normalizeProduct(id: string, data: Record<string, unknown>): ProductRecord {
  return {
    id,
    name: String(data.name ?? ""),
    slug: String(data.slug ?? ""),
    tagline: String(data.tagline ?? ""),
    description: String(data.description ?? ""),
    websiteUrl: String(data.websiteUrl ?? ""),
    logoUrl: data.logoUrl ? String(data.logoUrl) : null,
    status: (data.status as ProductRecord["status"]) ?? "DRAFT",
    makerId: String(data.makerId ?? ""),
    topicSlugs: Array.isArray(data.topicSlugs) ? data.topicSlugs.map(String) : [],
    createdAt: asISOString(data.createdAt),
    updatedAt: asISOString(data.updatedAt)
  };
}

function normalizeLaunch(id: string, data: Record<string, unknown>): LaunchRecord {
  return {
    id,
    productId: String(data.productId ?? ""),
    hunterId: String(data.hunterId ?? ""),
    launchDate: asISOString(data.launchDate),
    status: (data.status as LaunchRecord["status"]) ?? "LIVE",
    heroImageUrl: data.heroImageUrl ? String(data.heroImageUrl) : null,
    galleryJson: data.galleryJson ? String(data.galleryJson) : null,
    createdAt: asISOString(data.createdAt)
  };
}

function normalizeMedia(id: string, data: Record<string, unknown>): ProductMediaRecord {
  return {
    id,
    productId: String(data.productId ?? ""),
    type: (data.type as ProductMediaRecord["type"]) ?? "IMAGE",
    url: String(data.url ?? ""),
    createdAt: asISOString(data.createdAt)
  };
}

function normalizeComment(id: string, data: Record<string, unknown>): CommentRecord {
  return {
    id,
    launchId: String(data.launchId ?? ""),
    userId: String(data.userId ?? ""),
    body: String(data.body ?? ""),
    parentId: data.parentId ? String(data.parentId) : null,
    createdAt: asISOString(data.createdAt)
  };
}

function normalizeNotification(id: string, data: Record<string, unknown>): NotificationRecord {
  return {
    id,
    userId: String(data.userId ?? ""),
    title: String(data.title ?? ""),
    body: String(data.body ?? ""),
    href: data.href ? String(data.href) : null,
    readAt: data.readAt ? asISOString(data.readAt) : null,
    createdAt: asISOString(data.createdAt)
  };
}

function normalizeEventRegistration(id: string, data: Record<string, unknown>): EventRegistrationRecord {
  const teammatePreference = data.teammatePreference as TeammatePreference | undefined;
  const eventSlug = String(data.eventSlug ?? "");
  const rawUserId = String(data.userId ?? "").trim();
  const userId = rawUserId || extractUserIdFromEventRegistrationDocId(id, eventSlug);
  return {
    id,
    eventSlug,
    userId,
    participationType: (data.participationType as EventRegistrationRecord["participationType"]) ?? "INDIVIDUAL",
    teamName: data.teamName ? String(data.teamName) : null,
    projectName: String(data.projectName ?? ""),
    skills: Array.isArray(data.skills) ? data.skills.map(String) : [],
    bio: String(data.bio ?? ""),
    teammatePreference: teammatePreference === "solo" || teammatePreference === "looking" || teammatePreference === "team" ? teammatePreference : null,
    referralSource: data.referralSource ? String(data.referralSource) : null,
    eligibilityAgreed: Boolean(data.eligibilityAgreed),
    rulesAgreed: Boolean(data.rulesAgreed),
    createdAt: asISOString(data.createdAt),
    updatedAt: asISOString(data.updatedAt),
    userName: data.userName != null ? String(data.userName) : undefined,
    userUsername: data.userUsername != null ? String(data.userUsername) : undefined,
    userAvatarUrl: data.userAvatarUrl != null ? (data.userAvatarUrl ? String(data.userAvatarUrl) : null) : undefined,
    userBio: data.userBio != null ? (data.userBio ? String(data.userBio) : null) : undefined
  };
}

function normalizeTeammatePost(id: string, data: Record<string, unknown>): TeammatePostRecord {
  return {
    id,
    eventSlug: String(data.eventSlug ?? ""),
    userId: String(data.userId ?? ""),
    participationType: (data.participationType as TeammatePostRecord["participationType"]) ?? "INDIVIDUAL",
    lookingFor: Array.isArray(data.lookingFor) ? data.lookingFor.map(String) : [],
    message: String(data.message ?? ""),
    createdAt: asISOString(data.createdAt)
  };
}

function normalizeTeamMember(raw: unknown): EventApplicationTeamMember {
  if (raw && typeof raw === "object" && "email" in raw) {
    const o = raw as Record<string, unknown>;
    return {
      email: String(o.email ?? ""),
      userId: o.userId ? String(o.userId) : null,
      status: (o.status as EventApplicationTeamMember["status"]) ?? "invited"
    };
  }
  return { email: "", userId: null, status: "invited" };
}

function normalizeEventApplication(id: string, data: Record<string, unknown>): EventApplicationRecord {
  const teamMembers = Array.isArray(data.teamMembers)
    ? (data.teamMembers as unknown[]).map(normalizeTeamMember)
    : [];
  const sections = (data.sections && typeof data.sections === "object" && !Array.isArray(data.sections))
    ? (data.sections as EventApplicationSections)
    : {};
  return {
    id,
    eventSlug: String(data.eventSlug ?? ""),
    userId: String(data.userId ?? ""),
    status: (data.status as EventApplicationRecord["status"]) ?? "draft",
    submittedAt: data.submittedAt ? asISOString(data.submittedAt) : null,
    teamMembers,
    sections: sections as EventApplicationSections,
    createdAt: asISOString(data.createdAt),
    updatedAt: asISOString(data.updatedAt)
  };
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

const ENABLE_LEGACY_READ_FALLBACK = process.env.FIRESTORE_LEGACY_READ_FALLBACK !== "0";
const IN_QUERY_LIMIT = 30;

function getPrimaryCollection(key: DbCollectionKey): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData> {
  return getFirestore().collection(getVersionedCollectionName(key));
}

function getLegacyCollection(key: DbCollectionKey): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData> {
  return getFirestore().collection(getLegacyCollectionName(key));
}

async function runQueryWithLegacyFallback(
  key: DbCollectionKey,
  buildQuery: (
    collectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
  ) => FirebaseFirestore.Query<FirebaseFirestore.DocumentData>
): Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>> {
  const primary = await buildQuery(getPrimaryCollection(key)).get();
  if (!primary.empty || !ENABLE_LEGACY_READ_FALLBACK) return primary;
  return buildQuery(getLegacyCollection(key)).get();
}

async function getCountWithLegacyFallback(
  key: DbCollectionKey,
  buildQuery: (
    collectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
  ) => FirebaseFirestore.Query<FirebaseFirestore.DocumentData>
): Promise<number> {
  const primaryCount = (await buildQuery(getPrimaryCollection(key)).count().get()).data().count;
  if (primaryCount > 0 || !ENABLE_LEGACY_READ_FALLBACK) return primaryCount;
  return (await buildQuery(getLegacyCollection(key)).count().get()).data().count;
}

async function getDocWithLegacyFallback(
  key: DbCollectionKey,
  docId: string
): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>> {
  const primary = await getPrimaryCollection(key).doc(docId).get();
  if (primary.exists || !ENABLE_LEGACY_READ_FALLBACK) return primary;
  return getLegacyCollection(key).doc(docId).get();
}

function chunkArray<T>(items: T[], size: number): T[][] {
  if (items.length === 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function getDocsByIdsWithLegacyFallback(
  key: DbCollectionKey,
  ids: string[]
): Promise<FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]> {
  const uniqueIds = unique(ids.map((id) => id.trim()).filter(Boolean));
  if (uniqueIds.length === 0) return [];

  const docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[] = [];
  for (const batch of chunkArray(uniqueIds, IN_QUERY_LIMIT)) {
    const primarySnap = await getPrimaryCollection(key).where("__name__", "in", batch).get();
    docs.push(...primarySnap.docs);
    if (!ENABLE_LEGACY_READ_FALLBACK) continue;

    const foundIds = new Set(primarySnap.docs.map((doc) => doc.id));
    const missingIds = batch.filter((id) => !foundIds.has(id));
    if (missingIds.length === 0) continue;

    const legacySnap = await getLegacyCollection(key).where("__name__", "in", missingIds).get();
    docs.push(...legacySnap.docs);
  }

  return docs;
}

async function getUsersByIds(userIds: string[]): Promise<Map<string, UserRecord>> {
  const docs = await getDocsByIdsWithLegacyFallback("users", userIds);
  const users = new Map<string, UserRecord>();
  for (const doc of docs) {
    users.set(doc.id, normalizeUser(doc.id, doc.data()));
  }
  return users;
}

async function getProductsByIds(productIds: string[]): Promise<Map<string, ProductRecord>> {
  const docs = await getDocsByIdsWithLegacyFallback("products", productIds);
  const products = new Map<string, ProductRecord>();
  for (const doc of docs) {
    products.set(doc.id, normalizeProduct(doc.id, doc.data()));
  }
  return products;
}

async function getTopicsBySlugs(slugs: string[]): Promise<Map<string, TopicRecord>> {
  const uniqueSlugs = unique(slugs.map((slug) => slug.trim()).filter(Boolean));
  if (uniqueSlugs.length === 0) return new Map<string, TopicRecord>();

  const topics = new Map<string, TopicRecord>();
  for (const batch of chunkArray(uniqueSlugs, IN_QUERY_LIMIT)) {
    const primarySnap = await getPrimaryCollection("topics").where("slug", "in", batch).get();
    for (const doc of primarySnap.docs) {
      const topic = normalizeTopic(doc.id, doc.data());
      topics.set(topic.slug, topic);
    }

    if (!ENABLE_LEGACY_READ_FALLBACK) continue;
    const foundSlugs = new Set(Array.from(topics.keys()));
    const missingSlugs = batch.filter((slug) => !foundSlugs.has(slug));
    if (missingSlugs.length === 0) continue;

    const legacySnap = await getLegacyCollection("topics").where("slug", "in", missingSlugs).get();
    for (const doc of legacySnap.docs) {
      const topic = normalizeTopic(doc.id, doc.data());
      topics.set(topic.slug, topic);
    }
  }

  return topics;
}

function buildSnapshotUser(row: EventRegistrationRecord): UserRecord {
  return {
    id: row.userId,
    email: "",
    username: row.userUsername ?? "",
    passwordHash: "",
    name: row.userName ?? "",
    bio: row.userBio ?? null,
    avatarUrl: row.userAvatarUrl ?? null,
    experience: null,
    linkedInUrl: null,
    xUrl: null,
    githubUrl: null,
    websiteUrl: null,
    role: "USER",
    createdAt: "",
    updatedAt: ""
  };
}

async function hydrateEventRegistrationUsers(rows: EventRegistrationRecord[]) {
  const needsUserFetch = rows.filter((row) => row.userName == null || row.userUsername == null);
  const userIdsToFetch = unique(needsUserFetch.map((row) => row.userId));
  const usersById = await getUsersByIds(userIdsToFetch);

  return rows.map((row) => {
    if (row.userName != null && row.userUsername != null) {
      return { ...row, user: buildSnapshotUser(row) };
    }
    return { ...row, user: usersById.get(row.userId) ?? null };
  });
}

function isMissingCompositeIndexError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: unknown; message?: unknown };
  const message = typeof maybeError.message === "string" ? maybeError.message.toLowerCase() : "";
  return maybeError.code === 9 || message.includes("requires an index");
}

async function queryEventRegistrationsByEventSlug(
  collectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>,
  eventSlug: string,
  cursor: string | null,
  limitCount: number
): Promise<FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]> {
  try {
    let query = collectionRef.where("eventSlug", "==", eventSlug).orderBy("createdAt", "asc");
    if (cursor) query = query.startAfter(cursor);
    const snap = await query.limit(limitCount).get();
    return snap.docs;
  } catch (error) {
    if (!isMissingCompositeIndexError(error)) throw error;
    // Fallback path for environments where the composite index has not been deployed yet.
    const scanSnap = await collectionRef.where("eventSlug", "==", eventSlug).limit(2000).get();
    const sorted = [...scanSnap.docs].sort((a, b) => {
      const aCreatedAt = asISOString((a.data() as Record<string, unknown>).createdAt);
      const bCreatedAt = asISOString((b.data() as Record<string, unknown>).createdAt);
      return aCreatedAt.localeCompare(bCreatedAt);
    });
    const filtered = cursor
      ? sorted.filter((doc) => asISOString((doc.data() as Record<string, unknown>).createdAt) > cursor)
      : sorted;
    return filtered.slice(0, limitCount);
  }
}

function mergeDocsById(
  legacyDocs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[],
  primaryDocs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]
): FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[] {
  const merged = new Map<string, FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>>();
  for (const doc of legacyDocs) merged.set(doc.id, doc);
  for (const doc of primaryDocs) merged.set(doc.id, doc);
  return Array.from(merged.values());
}

async function getProductsByMakerIdWithFallback(
  makerId: string
): Promise<ProductRecord[]> {
  try {
    const snap = await runQueryWithLegacyFallback("products", (collectionRef) =>
      collectionRef.where("makerId", "==", makerId).orderBy("createdAt", "desc")
    );
    return snap.docs.map((doc) => normalizeProduct(doc.id, doc.data()));
  } catch (error) {
    if (!isMissingCompositeIndexError(error)) throw error;
    // Fallback when composite index is not deployed yet.
    const [primarySnap, legacySnap] = await Promise.all([
      getPrimaryCollection("products").where("makerId", "==", makerId).limit(300).get(),
      ENABLE_LEGACY_READ_FALLBACK
        ? getLegacyCollection("products").where("makerId", "==", makerId).limit(300).get()
        : Promise.resolve(null)
    ]);
    const docs = mergeDocsById(legacySnap?.docs ?? [], primarySnap.docs).sort((a, b) => {
      const aCreatedAt = asISOString((a.data() as Record<string, unknown>).createdAt);
      const bCreatedAt = asISOString((b.data() as Record<string, unknown>).createdAt);
      return bCreatedAt.localeCompare(aCreatedAt);
    });
    return docs.map((doc) => normalizeProduct(doc.id, doc.data()));
  }
}

/** Lazy refs so Firebase is not initialized at module load (build can run without env). */
const db = {
  get users() {
    return getPrimaryCollection("users");
  },
  get topics() {
    return getPrimaryCollection("topics");
  },
  get products() {
    return getPrimaryCollection("products");
  },
  get launches() {
    return getPrimaryCollection("launches");
  },
  get productMedia() {
    return getPrimaryCollection("productMedia");
  },
  get upvotes() {
    return getPrimaryCollection("upvotes");
  },
  get comments() {
    return getPrimaryCollection("comments");
  },
  get follows() {
    return getPrimaryCollection("follows");
  },
  get reports() {
    return getPrimaryCollection("reports");
  },
  get notifications() {
    return getPrimaryCollection("notifications");
  },
  get collections() {
    return getPrimaryCollection("collections");
  },
  get collectionItems() {
    return getPrimaryCollection("collectionItems");
  },
  get eventRegistrations() {
    return getPrimaryCollection("eventRegistrations");
  },
  get teammatePosts() {
    return getPrimaryCollection("teammatePosts");
  },
  get eventApplications() {
    return getPrimaryCollection("eventApplications");
  }
};

export async function getUserById(userId: string): Promise<UserRecord | null> {
  const snap = await getDocWithLegacyFallback("users", userId);
  if (!snap.exists) return null;
  return normalizeUser(snap.id, snap.data()!);
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const snap = await runQueryWithLegacyFallback("users", (collectionRef) =>
    collectionRef.where("email", "==", email.toLowerCase()).limit(1)
  );
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return normalizeUser(doc.id, doc.data());
}

export async function getUserByUsername(username: string): Promise<UserRecord | null> {
  const snap = await runQueryWithLegacyFallback("users", (collectionRef) =>
    collectionRef.where("username", "==", username.toLowerCase()).limit(1)
  );
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return normalizeUser(doc.id, doc.data());
}

export async function createUser(data: {
  email: string;
  username: string;
  passwordHash: string;
  name: string;
}): Promise<UserRecord> {
  const now = nowIso();
  const doc = db.users.doc();
  await doc.set({
    email: data.email.toLowerCase(),
    username: data.username.toLowerCase(),
    passwordHash: data.passwordHash,
    name: data.name,
    bio: null,
    avatarUrl: null,
    experience: null,
    linkedInUrl: null,
    xUrl: null,
    githubUrl: null,
    websiteUrl: null,
    role: "USER",
    createdAt: now,
    updatedAt: now
  });
  return (await getUserById(doc.id))!;
}

/** True if user has experience and at least one social link (required to register for hackathons). */
export function isProfileCompleteForHackathon(user: UserRecord): boolean {
  const experience = user.experience?.trim() ?? "";
  const hasExperience = experience.length >= 10;
  const hasSocial =
    Boolean(user.linkedInUrl?.trim()) || Boolean(user.xUrl?.trim()) || Boolean(user.githubUrl?.trim());
  return hasExperience && hasSocial;
}

export async function updateUserProfile(userId: string, data: {
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  experience: string | null;
  linkedInUrl: string | null;
  xUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
}): Promise<void> {
  await db.users.doc(userId).update({
    name: data.name,
    username: data.username.toLowerCase(),
    bio: data.bio,
    avatarUrl: data.avatarUrl,
    experience: data.experience ?? null,
    linkedInUrl: data.linkedInUrl ?? null,
    xUrl: data.xUrl ?? null,
    githubUrl: data.githubUrl ?? null,
    websiteUrl: data.websiteUrl ?? null,
    updatedAt: nowIso()
  });
}

export async function createTopicIfMissing(name: string, slug: string): Promise<TopicRecord> {
  const existing = await runQueryWithLegacyFallback("topics", (collectionRef) =>
    collectionRef.where("slug", "==", slug).limit(1)
  );
  if (!existing.empty) {
    const doc = existing.docs[0]!;
    return normalizeTopic(doc.id, doc.data());
  }

  const doc = db.topics.doc();
  await doc.set({
    name,
    slug,
    description: null,
    createdAt: nowIso()
  });
  return normalizeTopic(doc.id, (await doc.get()).data()!);
}

export async function getTopicBySlugWithProducts(slug: string) {
  const topicSnap = await runQueryWithLegacyFallback("topics", (collectionRef) =>
    collectionRef.where("slug", "==", slug).limit(1)
  );
  if (topicSnap.empty) return null;
  const topicDoc = topicSnap.docs[0]!;
  const topic = normalizeTopic(topicDoc.id, topicDoc.data());

  const productSnap = await runQueryWithLegacyFallback("products", (collectionRef) =>
    collectionRef.where("topicSlugs", "array-contains", slug).orderBy("createdAt", "desc")
  );
  const productRecords = productSnap.docs.map((d) => normalizeProduct(d.id, d.data()));
  const makerIds: string[] = unique(productRecords.map((p) => p.makerId));
  const makersMap = await getUsersByIds(makerIds);

  return {
    topic,
    products: productRecords.map((p) => ({
      ...p,
      maker: makersMap.get(p.makerId) ?? null
    }))
  };
}

export async function getCollectionBySlug(slug: string) {
  const collectionSnap = await runQueryWithLegacyFallback("collections", (collectionRef) =>
    collectionRef.where("slug", "==", slug).limit(1)
  );
  if (collectionSnap.empty) return null;
  const collectionDoc = collectionSnap.docs[0]!;
  const raw = collectionDoc.data() as Record<string, unknown>;
  const collection = {
    id: collectionDoc.id,
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    description: raw.description ? String(raw.description) : null,
    creatorId: String(raw.creatorId ?? ""),
    createdAt: asISOString(raw.createdAt)
  };

  const itemSnap = await runQueryWithLegacyFallback("collectionItems", (collectionRef) =>
    collectionRef.where("collectionId", "==", collectionDoc.id).orderBy("position", "asc")
  );

  const itemsRaw = itemSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      productId: String(data.productId ?? ""),
      note: data.note ? String(data.note) : null,
      position: Number(data.position ?? 0)
    };
  });
  const productsById = await getProductsByIds(itemsRaw.map((item) => item.productId));
  const items = itemsRaw
    .map((item) => ({
      id: item.id,
      note: item.note,
      position: item.position,
      product: productsById.get(item.productId) ?? null
    }))
    .filter((item) => item.product !== null);

  const creator = await getUserById(collection.creatorId);
  return {
    ...collection,
    creator,
    items
  };
}

export async function getProductById(productId: string): Promise<ProductRecord | null> {
  const snap = await getDocWithLegacyFallback("products", productId);
  if (!snap.exists) return null;
  return normalizeProduct(snap.id, snap.data()!);
}

export async function getProductBySlug(slug: string): Promise<ProductRecord | null> {
  const snap = await runQueryWithLegacyFallback("products", (collectionRef) =>
    collectionRef.where("slug", "==", slug).limit(1)
  );
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return normalizeProduct(doc.id, doc.data());
}

export async function getProductMedia(productId: string): Promise<ProductMediaRecord[]> {
  const snap = await runQueryWithLegacyFallback("productMedia", (collectionRef) =>
    collectionRef.where("productId", "==", productId).orderBy("createdAt", "asc")
  );
  return snap.docs.map((d) => normalizeMedia(d.id, d.data()));
}

export async function getLatestLiveLaunchForProduct(productId: string): Promise<LaunchRecord | null> {
  const snap = await runQueryWithLegacyFallback("launches", (collectionRef) =>
    collectionRef.where("productId", "==", productId).where("status", "==", "LIVE").orderBy("launchDate", "desc").limit(1)
  );
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return normalizeLaunch(doc.id, doc.data());
}

export async function getLaunchById(launchId: string): Promise<LaunchRecord | null> {
  const snap = await getDocWithLegacyFallback("launches", launchId);
  if (!snap.exists) return null;
  return normalizeLaunch(snap.id, snap.data()!);
}

export async function getLaunchCounts(launchId: string): Promise<{ upvotes: number; comments: number }> {
  const [upvotes, comments] = await Promise.all([
    getCountWithLegacyFallback("upvotes", (collectionRef) => collectionRef.where("launchId", "==", launchId)),
    getCountWithLegacyFallback("comments", (collectionRef) => collectionRef.where("launchId", "==", launchId))
  ]);

  return {
    upvotes,
    comments
  };
}

export async function getLaunchCommentsTree(launchId: string) {
  const snap = await runQueryWithLegacyFallback("comments", (collectionRef) =>
    collectionRef.where("launchId", "==", launchId).orderBy("createdAt", "desc")
  );
  const all = snap.docs.map((d) => normalizeComment(d.id, d.data()));
  const usersNeeded: string[] = unique(all.map((c) => c.userId));
  const usersMap = await getUsersByIds(usersNeeded);

  const repliesByParent = new Map<string, CommentRecord[]>();
  for (const comment of all) {
    if (!comment.parentId) continue;
    const list = repliesByParent.get(comment.parentId) ?? [];
    list.push(comment);
    repliesByParent.set(comment.parentId, list);
  }

  return all
    .filter((c) => !c.parentId)
    .map((comment) => ({
      ...comment,
      user: usersMap.get(comment.userId) ?? null,
      replies: (repliesByParent.get(comment.id) ?? []).map((reply) => ({
        ...reply,
        user: usersMap.get(reply.userId) ?? null
      }))
    }));
}

export async function createComment(data: {
  launchId: string;
  userId: string;
  body: string;
  parentId?: string;
}) {
  const doc = db.comments.doc();
  await doc.set({
    launchId: data.launchId,
    userId: data.userId,
    body: data.body,
    parentId: data.parentId ?? null,
    createdAt: nowIso()
  });
  const created = normalizeComment(doc.id, (await doc.get()).data()!);
  const user = await getUserById(data.userId);
  return { ...created, user };
}

export async function upvoteLaunch(launchId: string, userId: string): Promise<number> {
  const key = `${userId}_${launchId}`;
  const ref = db.upvotes.doc(key);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      launchId,
      userId,
      createdAt: nowIso()
    });
  }

  return getCountWithLegacyFallback("upvotes", (collectionRef) => collectionRef.where("launchId", "==", launchId));
}

export async function followUser(followerId: string, followeeId: string): Promise<number> {
  const key = `${followerId}_${followeeId}`;
  const ref = db.follows.doc(key);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      followerId,
      followeeId,
      createdAt: nowIso()
    });
  }

  return getCountWithLegacyFallback("follows", (collectionRef) => collectionRef.where("followeeId", "==", followeeId));
}

export async function createReport(data: {
  launchId: string;
  reporterId: string;
  reason: "SPAM" | "ABUSE" | "SCAM" | "OTHER";
  details?: string;
}): Promise<string> {
  const doc = db.reports.doc();
  await doc.set({
    launchId: data.launchId,
    reporterId: data.reporterId,
    reason: data.reason,
    details: data.details ?? null,
    resolved: false,
    createdAt: nowIso()
  });
  return doc.id;
}

export async function getNotificationsForUser(userId: string): Promise<NotificationRecord[]> {
  const snap = await runQueryWithLegacyFallback("notifications", (collectionRef) =>
    collectionRef.where("userId", "==", userId).orderBy("createdAt", "desc").limit(30)
  );
  return snap.docs.map((d) => normalizeNotification(d.id, d.data()));
}

export async function createProductWithLaunch(data: {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  logoUrl: string | null;
  makerId: string;
  topicNames: string[];
  launchDate: string;
  launchStatus: "SCHEDULED" | "LIVE";
  media: { type: "IMAGE" | "VIDEO"; url: string }[];
}) {
  const now = nowIso();
  const topicSlugs: string[] = [];
  for (const topicName of data.topicNames) {
    const slug = topicName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    if (!slug) continue;
    await createTopicIfMissing(topicName, slug);
    topicSlugs.push(slug);
  }

  const productRef = db.products.doc();
  await productRef.set({
    name: data.name,
    slug: data.slug,
    tagline: data.tagline,
    description: data.description,
    websiteUrl: data.websiteUrl,
    logoUrl: data.logoUrl,
    status: data.launchStatus,
    makerId: data.makerId,
    topicSlugs,
    createdAt: now,
    updatedAt: now
  });

  const launchRef = db.launches.doc();
  await launchRef.set({
    productId: productRef.id,
    hunterId: data.makerId,
    launchDate: data.launchDate,
    status: data.launchStatus,
    heroImageUrl: null,
    galleryJson: null,
    createdAt: now
  });

  await Promise.all(
    data.media.map(async (item) => {
      const mediaRef = db.productMedia.doc();
      await mediaRef.set({
        productId: productRef.id,
        type: item.type,
        url: item.url,
        createdAt: nowIso()
      });
    })
  );

  return { productId: productRef.id, launchId: launchRef.id };
}

export async function getFeedLaunches(topicSlug?: string) {
  const launchSnap = await runQueryWithLegacyFallback("launches", (collectionRef) =>
    collectionRef.where("status", "==", "LIVE").orderBy("launchDate", "desc").limit(30)
  );
  const launchRecords = launchSnap.docs.map((d) => normalizeLaunch(d.id, d.data()));

  const productIds: string[] = unique(launchRecords.map((l) => l.productId));
  const productMap = await getProductsByIds(productIds);

  const filteredLaunches = launchRecords.filter((launch) => {
    if (!topicSlug) return true;
    const product = productMap.get(launch.productId);
    return !!product && product.topicSlugs.includes(topicSlug);
  });

  const makerIds: string[] = unique(
    filteredLaunches
      .map((l) => productMap.get(l.productId)?.makerId)
      .filter((v): v is string => Boolean(v))
  );

  const makers = await getUsersByIds(makerIds);

  return Promise.all(
    filteredLaunches.map(async (launch) => {
      const product = productMap.get(launch.productId);
      if (!product) return null;
      const [counts, topicsBySlug] = await Promise.all([
        getLaunchCounts(launch.id),
        getTopicsBySlugs(product.topicSlugs)
      ]);
      const topicDocs = product.topicSlugs
        .map((slug) => topicsBySlug.get(slug))
        .filter((topic): topic is TopicRecord => Boolean(topic));

      return {
        ...launch,
        product: {
          ...product,
          maker: makers.get(product.makerId) ?? null,
          topics: topicDocs
        },
        _count: counts
      };
    })
  ).then((rows) => rows.filter((row): row is NonNullable<typeof row> => Boolean(row)));
}

export async function getProductPageBySlug(slug: string) {
  const product = await getProductBySlug(slug);
  if (!product) return null;

  const [maker, media, launch] = await Promise.all([
    getUserById(product.makerId),
    getProductMedia(product.id),
    getLatestLiveLaunchForProduct(product.id)
  ]);

  const topicsBySlug = await getTopicsBySlugs(product.topicSlugs);
  const topicDocs = product.topicSlugs
    .map((topicSlug) => topicsBySlug.get(topicSlug))
    .filter((topic): topic is TopicRecord => Boolean(topic));

  if (!launch) {
    return {
      product,
      maker,
      media,
      topics: topicDocs,
      launch: null,
      comments: [] as Awaited<ReturnType<typeof getLaunchCommentsTree>>
    };
  }

  const [counts, commentTree] = await Promise.all([getLaunchCounts(launch.id), getLaunchCommentsTree(launch.id)]);

  return {
    product,
    maker,
    media,
    topics: topicDocs,
    launch: {
      ...launch,
      _count: counts
    },
    comments: commentTree
  };
}

export async function searchAll(query: string) {
  const q = query.toLowerCase();
  const [productSnap, userSnap, topicSnap] = await Promise.all([
    runQueryWithLegacyFallback("products", (collectionRef) => collectionRef.orderBy("createdAt", "desc").limit(120)),
    runQueryWithLegacyFallback("users", (collectionRef) => collectionRef.limit(120)),
    runQueryWithLegacyFallback("topics", (collectionRef) => collectionRef.limit(120))
  ]);

  const productRows = productSnap.docs
    .map((d) => normalizeProduct(d.id, d.data()))
    .filter((p) => {
      const haystack = `${p.name} ${p.tagline} ${p.description}`.toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, 20);

  const makerIds: string[] = unique(productRows.map((p) => p.makerId));
  const makersMap = await getUsersByIds(makerIds);

  const userRows = userSnap.docs
    .map((d) => normalizeUser(d.id, d.data()))
    .filter((u) => `${u.name} ${u.username}`.toLowerCase().includes(q))
    .slice(0, 20);

  const topicRows = topicSnap.docs
    .map((d) => normalizeTopic(d.id, d.data()))
    .filter((t) => `${t.name} ${t.slug}`.toLowerCase().includes(q))
    .slice(0, 20);

  return {
    products: productRows.map((product) => ({ ...product, maker: makersMap.get(product.makerId) ?? null })),
    users: userRows,
    topics: topicRows
  };
}

export async function getMakerProfile(username: string) {
  const maker = await getUserByUsername(username);
  if (!maker) return null;

  const productRows = await getProductsByMakerIdWithFallback(maker.id);

  const [followersCount, followingCount] = await Promise.all([
    getCountWithLegacyFallback("follows", (collectionRef) => collectionRef.where("followeeId", "==", maker.id)),
    getCountWithLegacyFallback("follows", (collectionRef) => collectionRef.where("followerId", "==", maker.id))
  ]);

  return {
    user: maker,
    products: productRows,
    counts: {
      followers: followersCount,
      following: followingCount
    }
  };
}

export async function getUpcomingLaunches() {
  const snap = await runQueryWithLegacyFallback("launches", (collectionRef) =>
    collectionRef.where("status", "==", "SCHEDULED").orderBy("launchDate", "asc")
  );
  const rows = snap.docs.map((d) => normalizeLaunch(d.id, d.data()));
  return Promise.all(
    rows.map(async (launch) => ({
      ...launch,
      product: await getProductById(launch.productId)
    }))
  );
}

export async function getAllProductsWithCounts() {
  const snap = await runQueryWithLegacyFallback("products", (collectionRef) =>
    collectionRef.orderBy("createdAt", "desc").limit(150)
  );
  const rows = snap.docs.map((d) => normalizeProduct(d.id, d.data()));

  return Promise.all(
    rows.map(async (product) => {
      const [maker, launch] = await Promise.all([getUserById(product.makerId), getLatestLiveLaunchForProduct(product.id)]);
      const counts = launch ? await getLaunchCounts(launch.id) : { upvotes: 0, comments: 0 };
      return { product, maker, launch, counts };
    })
  );
}

export async function getProductsForMaker(makerId: string) {
  const rows = await getProductsByMakerIdWithFallback(makerId);
  return Promise.all(
    rows.map(async (product) => {
      const [launch, media] = await Promise.all([getLatestLiveLaunchForProduct(product.id), getProductMedia(product.id)]);
      const counts = launch ? await getLaunchCounts(launch.id) : { upvotes: 0, comments: 0 };
      return { product, launch, media, counts };
    })
  );
}

export async function findProductBySlug(slug: string): Promise<ProductRecord | null> {
  return getProductBySlug(slug);
}

export async function getEventRegistrationByUser(eventSlug: string, userId: string): Promise<EventRegistrationRecord | null> {
  const docId = `${eventSlug}_${userId}`;
  const snap = await getDocWithLegacyFallback("eventRegistrations", docId);
  if (!snap.exists) return null;
  return normalizeEventRegistration(snap.id, snap.data()!);
}

/** List all registrations for an event with user name/username for the participant list. */
export async function getEventRegistrations(eventSlug: string, limitCount = 200) {
  const { rows } = await getEventRegistrationsPage(eventSlug, { limitCount });
  return rows;
}

export async function getEventRegistrationsPage(
  eventSlug: string,
  options?: { limitCount?: number; cursor?: string | null }
) {
  const safeLimit = Math.max(1, Math.min(options?.limitCount ?? 200, 200));
  const cursor = options?.cursor?.trim() || null;
  const fetchLimit = safeLimit + 1;
  const primaryDocsPromise = queryEventRegistrationsByEventSlug(
    getPrimaryCollection("eventRegistrations"),
    eventSlug,
    cursor,
    fetchLimit
  );
  const legacyDocsPromise = ENABLE_LEGACY_READ_FALLBACK
    ? queryEventRegistrationsByEventSlug(getLegacyCollection("eventRegistrations"), eventSlug, cursor, fetchLimit)
    : Promise.resolve([] as FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]);
  const [primaryDocs, legacyDocs] = await Promise.all([primaryDocsPromise, legacyDocsPromise]);

  const mergedDocs = mergeDocsById(legacyDocs, primaryDocs).sort((a, b) => {
    const aCreatedAt = asISOString((a.data() as Record<string, unknown>).createdAt);
    const bCreatedAt = asISOString((b.data() as Record<string, unknown>).createdAt);
    return aCreatedAt.localeCompare(bCreatedAt);
  });
  const hasMore = mergedDocs.length > safeLimit;
  const pageDocs = hasMore ? mergedDocs.slice(0, safeLimit) : mergedDocs;
  const rows = pageDocs
    .map((doc) => {
      const data = doc.data();
      return data ? normalizeEventRegistration(doc.id, data) : null;
    })
    .filter((row): row is EventRegistrationRecord => row !== null);
  const hydratedRows = await hydrateEventRegistrationUsers(rows);
  const nextCursor = hasMore && hydratedRows.length > 0
    ? hydratedRows[hydratedRows.length - 1]!.createdAt
    : null;

  return {
    rows: hydratedRows,
    hasMore,
    nextCursor
  };
}

export async function upsertEventRegistration(data: {
  eventSlug: string;
  userId: string;
  participationType?: "TEAM" | "INDIVIDUAL";
  teamName?: string | null;
  projectName?: string;
  skills?: string[];
  bio?: string;
  teammatePreference?: TeammatePreference | null;
  referralSource?: string | null;
  eligibilityAgreed?: boolean;
  rulesAgreed?: boolean;
  /** Snapshot of user display fields for participant list (avoids N+1 reads). */
  userSnapshot?: EventRegistrationUserSnapshot;
}) {
  const docId = `${data.eventSlug}_${data.userId}`;
  const now = nowIso();
  const ref = db.eventRegistrations.doc(docId);
  const primaryExisting = await ref.get();
  const fallbackExisting = !primaryExisting.exists && ENABLE_LEGACY_READ_FALLBACK
    ? await getLegacyCollection("eventRegistrations").doc(docId).get()
    : null;
  const existingData = primaryExisting.exists
    ? primaryExisting.data()
    : fallbackExisting?.exists
      ? fallbackExisting.data()
      : null;
  const hasExistingRecord = existingData != null;
  const participationType =
    data.participationType ??
    (data.teammatePreference === "team" ? "TEAM" : "INDIVIDUAL") as "TEAM" | "INDIVIDUAL";

  const payload: Record<string, unknown> = {
    eventSlug: data.eventSlug,
    userId: data.userId,
    participationType,
    teamName: data.teamName ?? (existingData?.teamName ?? null),
    projectName: data.projectName ?? existingData?.projectName ?? "",
    skills: data.skills ?? existingData?.skills ?? [],
    bio: data.bio ?? existingData?.bio ?? "",
    teammatePreference: data.teammatePreference ?? existingData?.teammatePreference ?? null,
    referralSource: data.referralSource ?? existingData?.referralSource ?? null,
    eligibilityAgreed: data.eligibilityAgreed ?? existingData?.eligibilityAgreed ?? false,
    rulesAgreed: data.rulesAgreed ?? existingData?.rulesAgreed ?? false,
    createdAt: hasExistingRecord ? existingData?.createdAt ?? now : now,
    updatedAt: now
  };

  if (data.userSnapshot) {
    payload.userName = data.userSnapshot.userName;
    payload.userUsername = data.userSnapshot.userUsername;
    payload.userAvatarUrl = data.userSnapshot.userAvatarUrl ?? null;
    payload.userBio = data.userSnapshot.userBio ?? null;
  }

  await ref.set(payload, { merge: true });

  return (await ref.get()).data();
}

/** Update user display snapshot on all event registrations for this user (e.g. after profile update). */
export async function updateEventRegistrationsUserSnapshot(
  userId: string,
  snapshot: EventRegistrationUserSnapshot
): Promise<void> {
  const snap = await runQueryWithLegacyFallback("eventRegistrations", (collectionRef) =>
    collectionRef.where("userId", "==", userId)
  );
  const batch = getFirestore().batch();
  for (const doc of snap.docs) {
    batch.update(doc.ref, {
      userName: snapshot.userName,
      userUsername: snapshot.userUsername,
      userAvatarUrl: snapshot.userAvatarUrl ?? null,
      userBio: snapshot.userBio ?? null,
      updatedAt: nowIso()
    });
  }
  if (snap.docs.length > 0) await batch.commit();
}

export async function getEventApplicationByUser(eventSlug: string, userId: string): Promise<EventApplicationRecord | null> {
  const docId = `${eventSlug}_${userId}`;
  const snap = await getDocWithLegacyFallback("eventApplications", docId);
  if (!snap.exists) return null;
  return normalizeEventApplication(snap.id, snap.data()!);
}

/** Refresh team member statuses (invited / profile_incomplete / complete) from current user data. */
export async function refreshEventApplicationTeamStatuses(
  teamMembers: EventApplicationTeamMember[]
): Promise<EventApplicationTeamMember[]> {
  return Promise.all(
    teamMembers.map(async (m) => {
      if (!m.email) return m;
      const user = await getUserByEmail(m.email);
      const status: EventApplicationTeamMember["status"] = !user
        ? "invited"
        : isProfileCompleteForHackathon(user)
          ? "complete"
          : "profile_incomplete";
      return { ...m, userId: user?.id ?? null, status };
    })
  );
}

export async function upsertEventApplicationDraft(data: {
  eventSlug: string;
  userId: string;
  teamMembers: EventApplicationTeamMember[];
  sections: EventApplicationSections;
}): Promise<EventApplicationRecord> {
  const docId = `${data.eventSlug}_${data.userId}`;
  const now = nowIso();
  const ref = db.eventApplications.doc(docId);
  const existing = await ref.get();
  const existingData = existing.exists ? existing.data() : null;
  const status = existingData?.status === "submitted" ? "submitted" : "draft";
  const submittedAt = existingData?.submittedAt ?? null;

  await ref.set(
    {
      eventSlug: data.eventSlug,
      userId: data.userId,
      status,
      submittedAt,
      teamMembers: data.teamMembers,
      sections: data.sections,
      createdAt: existing.exists ? existingData?.createdAt ?? now : now,
      updatedAt: now
    },
    { merge: true }
  );
  const updated = await ref.get();
  return normalizeEventApplication(updated.id, updated.data()!);
}

export async function submitEventApplication(eventSlug: string, userId: string): Promise<{ ok: true } | { error: string }> {
  const docId = `${eventSlug}_${userId}`;
  const snap = await getDocWithLegacyFallback("eventApplications", docId);
  if (!snap.exists) {
    return { error: "Application not found. Save a draft first." };
  }
  const app = normalizeEventApplication(snap.id, snap.data()!);
  if (app.status === "submitted") {
    return { ok: true };
  }
  const incomplete = app.teamMembers.filter((m) => m.status !== "complete" && m.userId);
  if (incomplete.length > 0) {
    const emails = incomplete.map((m) => m.email).join(", ");
    return { error: `${emails} still need to complete their profiles. All team members must complete their profiles to submit.` };
  }
  const now = nowIso();
  await db.eventApplications.doc(docId).update({ status: "submitted", submittedAt: now, updatedAt: now });
  return { ok: true };
}

export async function addEventApplicationTeamMember(
  eventSlug: string,
  userId: string,
  email: string
): Promise<{ ok: true; member: EventApplicationTeamMember } | { error: string }> {
  const docId = `${eventSlug}_${userId}`;
  const ref = db.eventApplications.doc(docId);
  const snap = await ref.get();
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return { error: "Email is required." };

  const existingUser = await getUserByEmail(normalizedEmail);
  const status: EventApplicationTeamMember["status"] = !existingUser
    ? "invited"
    : isProfileCompleteForHackathon(existingUser)
      ? "complete"
      : "profile_incomplete";

  const member: EventApplicationTeamMember = {
    email: normalizedEmail,
    userId: existingUser?.id ?? null,
    status
  };

  if (!snap.exists) {
    const now = nowIso();
    await ref.set({
      eventSlug,
      userId,
      status: "draft",
      submittedAt: null,
      teamMembers: [member],
      sections: {},
      createdAt: now,
      updatedAt: now
    });
  } else {
    const data = snap.data()!;
    const teamMembers = Array.isArray(data.teamMembers)
      ? (data.teamMembers as unknown[]).map(normalizeTeamMember)
      : [];
    if (teamMembers.some((m) => m.email === normalizedEmail)) {
      return { error: "This person is already added." };
    }
    teamMembers.push(member);
    await ref.update({ teamMembers, updatedAt: nowIso() });
  }

  return { ok: true, member };
}

export async function removeEventApplicationTeamMember(
  eventSlug: string,
  userId: string,
  email: string
): Promise<void> {
  const docId = `${eventSlug}_${userId}`;
  const ref = db.eventApplications.doc(docId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const data = snap.data()!;
  const teamMembers = Array.isArray(data.teamMembers)
    ? (data.teamMembers as unknown[]).map(normalizeTeamMember)
    : [];
  const filtered = teamMembers.filter((m) => m.email !== email.trim().toLowerCase());
  await ref.update({ teamMembers: filtered, updatedAt: nowIso() });
}

export async function createTeammatePost(data: {
  eventSlug: string;
  userId: string;
  participationType: "TEAM" | "INDIVIDUAL";
  lookingFor: string[];
  message: string;
}) {
  const ref = db.teammatePosts.doc();
  await ref.set({
    eventSlug: data.eventSlug,
    userId: data.userId,
    participationType: data.participationType,
    lookingFor: data.lookingFor,
    message: data.message,
    createdAt: nowIso()
  });
  const created = await ref.get();
  return normalizeTeammatePost(created.id, created.data()!);
}

export async function updateTeammatePost(
  postId: string,
  userId: string,
  data: { participationType: "TEAM" | "INDIVIDUAL"; lookingFor: string[]; message: string }
) {
  const ref = db.teammatePosts.doc(postId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.userId !== userId) {
    throw new Error("Teammate post not found or you can only update your own post.");
  }
  await ref.update({
    participationType: data.participationType,
    lookingFor: data.lookingFor,
    message: data.message.trim()
  });
  const updated = await ref.get();
  return normalizeTeammatePost(updated.id, updated.data()!);
}

export async function getTeammatePosts(eventSlug: string, limitCount = 30) {
  const snap = await runQueryWithLegacyFallback("teammatePosts", (collectionRef) =>
    collectionRef.where("eventSlug", "==", eventSlug).orderBy("createdAt", "desc").limit(limitCount)
  );
  const rows = snap.docs
    .map((doc) => {
      const data = doc.data();
      return data ? normalizeTeammatePost(doc.id, data) : null;
    })
    .filter((row): row is TeammatePostRecord => row !== null);
  const userIds: string[] = unique(rows.map((row) => row.userId));
  const usersMap = await getUsersByIds(userIds);

  return rows.map((row) => ({
    ...row,
    user: usersMap.get(row.userId) ?? null
  }));
}

export async function getEventStats(eventSlug: string) {
  const [primaryRegistrations, legacyRegistrations, primaryTeammatePosts, legacyTeammatePosts] = await Promise.all([
    getPrimaryCollection("eventRegistrations").where("eventSlug", "==", eventSlug).limit(5000).get(),
    ENABLE_LEGACY_READ_FALLBACK
      ? getLegacyCollection("eventRegistrations").where("eventSlug", "==", eventSlug).limit(5000).get()
      : Promise.resolve(null),
    getPrimaryCollection("teammatePosts").where("eventSlug", "==", eventSlug).limit(5000).get(),
    ENABLE_LEGACY_READ_FALLBACK
      ? getLegacyCollection("teammatePosts").where("eventSlug", "==", eventSlug).limit(5000).get()
      : Promise.resolve(null)
  ]);

  const registrationDocs = mergeDocsById(legacyRegistrations?.docs ?? [], primaryRegistrations.docs);
  const teammatePostDocs = mergeDocsById(legacyTeammatePosts?.docs ?? [], primaryTeammatePosts.docs);
  const registrationRows = registrationDocs.map((doc) => normalizeEventRegistration(doc.id, doc.data()));
  const teams = registrationRows.filter((row) => row.participationType === "TEAM").length;
  const individuals = registrationRows.filter((row) => row.participationType === "INDIVIDUAL").length;

  return {
    registrations: registrationRows.length,
    teammatePosts: teammatePostDocs.length,
    teams,
    individuals
  };
}

export async function getAdminOverview() {
  const [users, products, launches, comments, upvotes, eventRegistrations, teammatePosts] =
    await Promise.all([
      getCountWithLegacyFallback("users", (collectionRef) => collectionRef),
      getCountWithLegacyFallback("products", (collectionRef) => collectionRef),
      getCountWithLegacyFallback("launches", (collectionRef) => collectionRef),
      getCountWithLegacyFallback("comments", (collectionRef) => collectionRef),
      getCountWithLegacyFallback("upvotes", (collectionRef) => collectionRef),
      getCountWithLegacyFallback("eventRegistrations", (collectionRef) => collectionRef),
      getCountWithLegacyFallback("teammatePosts", (collectionRef) => collectionRef)
    ]);

  return {
    users,
    products,
    launches,
    comments,
    upvotes,
    eventRegistrations,
    teammatePosts
  };
}
