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
  return {
    id,
    eventSlug: String(data.eventSlug ?? ""),
    userId: String(data.userId ?? ""),
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
    updatedAt: asISOString(data.updatedAt)
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

/** Lazy refs so Firebase is not initialized at module load (build can run without env). */
const db = {
  get users() {
    return getFirestore().collection("users");
  },
  get topics() {
    return getFirestore().collection("topics");
  },
  get products() {
    return getFirestore().collection("products");
  },
  get launches() {
    return getFirestore().collection("launches");
  },
  get productMedia() {
    return getFirestore().collection("productMedia");
  },
  get upvotes() {
    return getFirestore().collection("upvotes");
  },
  get comments() {
    return getFirestore().collection("comments");
  },
  get follows() {
    return getFirestore().collection("follows");
  },
  get reports() {
    return getFirestore().collection("reports");
  },
  get notifications() {
    return getFirestore().collection("notifications");
  },
  get collections() {
    return getFirestore().collection("collections");
  },
  get collectionItems() {
    return getFirestore().collection("collectionItems");
  },
  get eventRegistrations() {
    return getFirestore().collection("eventRegistrations");
  },
  get teammatePosts() {
    return getFirestore().collection("teammatePosts");
  },
  get eventApplications() {
    return getFirestore().collection("eventApplications");
  }
};

export async function getUserById(userId: string): Promise<UserRecord | null> {
  const snap = await db.users.doc(userId).get();
  if (!snap.exists) return null;
  return normalizeUser(snap.id, snap.data()!);
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const snap = await db.users.where("email", "==", email.toLowerCase()).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return normalizeUser(doc.id, doc.data());
}

export async function getUserByUsername(username: string): Promise<UserRecord | null> {
  const snap = await db.users.where("username", "==", username.toLowerCase()).limit(1).get();
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
  const existing = await db.topics.where("slug", "==", slug).limit(1).get();
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
  const topicSnap = await db.topics.where("slug", "==", slug).limit(1).get();
  if (topicSnap.empty) return null;
  const topicDoc = topicSnap.docs[0]!;
  const topic = normalizeTopic(topicDoc.id, topicDoc.data());

  const productSnap = await db.products.where("topicSlugs", "array-contains", slug).orderBy("createdAt", "desc").get();
  const productRecords = productSnap.docs.map((d) => normalizeProduct(d.id, d.data()));

  const makerIds: string[] = unique(productRecords.map((p) => p.makerId));
  const makersMap = new Map<string, UserRecord>();
  await Promise.all(
    makerIds.map(async (id) => {
      const maker = await getUserById(id);
      if (maker) makersMap.set(id, maker);
    })
  );

  return {
    topic,
    products: productRecords.map((p) => ({
      ...p,
      maker: makersMap.get(p.makerId) ?? null
    }))
  };
}

export async function getCollectionBySlug(slug: string) {
  const collectionSnap = await db.collections.where("slug", "==", slug).limit(1).get();
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

  const itemSnap = await db.collectionItems
    .where("collectionId", "==", collectionDoc.id)
    .orderBy("position", "asc")
    .get();

  const items = await Promise.all(
    itemSnap.docs.map(async (doc) => {
      const data = doc.data();
      const productId = String(data.productId ?? "");
      const product = await getProductById(productId);
      return {
        id: doc.id,
        note: data.note ? String(data.note) : null,
        position: Number(data.position ?? 0),
        product
      };
    })
  );

  const creator = await getUserById(collection.creatorId);
  return {
    ...collection,
    creator,
    items: items.filter((item) => item.product)
  };
}

export async function getProductById(productId: string): Promise<ProductRecord | null> {
  const snap = await db.products.doc(productId).get();
  if (!snap.exists) return null;
  return normalizeProduct(snap.id, snap.data()!);
}

export async function getProductBySlug(slug: string): Promise<ProductRecord | null> {
  const snap = await db.products.where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return normalizeProduct(doc.id, doc.data());
}

export async function getProductMedia(productId: string): Promise<ProductMediaRecord[]> {
  const snap = await db.productMedia.where("productId", "==", productId).orderBy("createdAt", "asc").get();
  return snap.docs.map((d) => normalizeMedia(d.id, d.data()));
}

export async function getLatestLiveLaunchForProduct(productId: string): Promise<LaunchRecord | null> {
  const snap = await db.launches
    .where("productId", "==", productId)
    .where("status", "==", "LIVE")
    .orderBy("launchDate", "desc")
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return normalizeLaunch(doc.id, doc.data());
}

export async function getLaunchById(launchId: string): Promise<LaunchRecord | null> {
  const snap = await db.launches.doc(launchId).get();
  if (!snap.exists) return null;
  return normalizeLaunch(snap.id, snap.data()!);
}

export async function getLaunchCounts(launchId: string): Promise<{ upvotes: number; comments: number }> {
  const [upvoteSnap, commentSnap] = await Promise.all([
    db.upvotes.where("launchId", "==", launchId).count().get(),
    db.comments.where("launchId", "==", launchId).count().get()
  ]);

  return {
    upvotes: upvoteSnap.data().count,
    comments: commentSnap.data().count
  };
}

export async function getLaunchCommentsTree(launchId: string) {
  const snap = await db.comments.where("launchId", "==", launchId).orderBy("createdAt", "desc").get();
  const all = snap.docs.map((d) => normalizeComment(d.id, d.data()));
  const usersNeeded: string[] = unique(all.map((c) => c.userId));
  const usersMap = new Map<string, UserRecord>();
  await Promise.all(
    usersNeeded.map(async (id) => {
      const user = await getUserById(id);
      if (user) usersMap.set(id, user);
    })
  );

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

  const countSnap = await db.upvotes.where("launchId", "==", launchId).count().get();
  return countSnap.data().count;
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

  const countSnap = await db.follows.where("followeeId", "==", followeeId).count().get();
  return countSnap.data().count;
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
  const snap = await db.notifications.where("userId", "==", userId).orderBy("createdAt", "desc").limit(30).get();
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
  const launchSnap = await db.launches.where("status", "==", "LIVE").orderBy("launchDate", "desc").limit(30).get();
  const launchRecords = launchSnap.docs.map((d) => normalizeLaunch(d.id, d.data()));

  const productIds: string[] = unique(launchRecords.map((l) => l.productId));
  const productMap = new Map<string, ProductRecord>();
  await Promise.all(
    productIds.map(async (productId) => {
      const product = await getProductById(productId);
      if (product) productMap.set(productId, product);
    })
  );

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

  const makers = new Map<string, UserRecord>();
  await Promise.all(
    makerIds.map(async (id) => {
      const user = await getUserById(id);
      if (user) makers.set(id, user);
    })
  );

  return Promise.all(
    filteredLaunches.map(async (launch) => {
      const product = productMap.get(launch.productId);
      if (!product) return null;
      const [counts, topicDocs] = await Promise.all([
        getLaunchCounts(launch.id),
        Promise.all(product.topicSlugs.map(async (slug) => {
          const snap = await db.topics.where("slug", "==", slug).limit(1).get();
          if (snap.empty) return null;
          const d = snap.docs[0]!;
          return normalizeTopic(d.id, d.data());
        }))
      ]);

      return {
        ...launch,
        product: {
          ...product,
          maker: makers.get(product.makerId) ?? null,
          topics: topicDocs.filter((t): t is TopicRecord => Boolean(t))
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

  const topicDocs = await Promise.all(
    product.topicSlugs.map(async (topicSlug) => {
      const snap = await db.topics.where("slug", "==", topicSlug).limit(1).get();
      if (snap.empty) return null;
      const d = snap.docs[0]!;
      return normalizeTopic(d.id, d.data());
    })
  );

  if (!launch) {
    return {
      product,
      maker,
      media,
      topics: topicDocs.filter((t): t is TopicRecord => Boolean(t)),
      launch: null,
      comments: [] as Awaited<ReturnType<typeof getLaunchCommentsTree>>
    };
  }

  const [counts, commentTree] = await Promise.all([getLaunchCounts(launch.id), getLaunchCommentsTree(launch.id)]);

  return {
    product,
    maker,
    media,
    topics: topicDocs.filter((t): t is TopicRecord => Boolean(t)),
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
    db.products.orderBy("createdAt", "desc").limit(120).get(),
    db.users.limit(120).get(),
    db.topics.limit(120).get()
  ]);

  const productRows = productSnap.docs
    .map((d) => normalizeProduct(d.id, d.data()))
    .filter((p) => {
      const haystack = `${p.name} ${p.tagline} ${p.description}`.toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, 20);

  const makerIds: string[] = unique(productRows.map((p) => p.makerId));
  const makersMap = new Map<string, UserRecord>();
  await Promise.all(
    makerIds.map(async (id) => {
      const maker = await getUserById(id);
      if (maker) makersMap.set(id, maker);
    })
  );

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

  const productsSnap = await db.products.where("makerId", "==", maker.id).orderBy("createdAt", "desc").get();
  const productRows = productsSnap.docs.map((d) => normalizeProduct(d.id, d.data()));

  const [followersSnap, followingSnap] = await Promise.all([
    db.follows.where("followeeId", "==", maker.id).count().get(),
    db.follows.where("followerId", "==", maker.id).count().get()
  ]);

  return {
    user: maker,
    products: productRows,
    counts: {
      followers: followersSnap.data().count,
      following: followingSnap.data().count
    }
  };
}

export async function getUpcomingLaunches() {
  const snap = await db.launches.where("status", "==", "SCHEDULED").orderBy("launchDate", "asc").get();
  const rows = snap.docs.map((d) => normalizeLaunch(d.id, d.data()));
  return Promise.all(
    rows.map(async (launch) => ({
      ...launch,
      product: await getProductById(launch.productId)
    }))
  );
}

export async function getAllProductsWithCounts() {
  const snap = await db.products.orderBy("createdAt", "desc").limit(150).get();
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
  const snap = await db.products.where("makerId", "==", makerId).orderBy("createdAt", "desc").get();
  const rows = snap.docs.map((d) => normalizeProduct(d.id, d.data()));
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
  const snap = await db.eventRegistrations.doc(docId).get();
  if (!snap.exists) return null;
  return normalizeEventRegistration(snap.id, snap.data()!);
}

/** List all registrations for an event with user name/username for the participant list. */
export async function getEventRegistrations(eventSlug: string, limitCount = 200) {
  const snap = await db.eventRegistrations
    .where("eventSlug", "==", eventSlug)
    .orderBy("createdAt", "asc")
    .limit(limitCount)
    .get();
  const rows = snap.docs
    .map((doc) => {
      const data = doc.data();
      return data ? normalizeEventRegistration(doc.id, data) : null;
    })
    .filter((r): r is EventRegistrationRecord => r !== null);
  const userIds: string[] = unique(rows.map((r) => r.userId));
  const usersMap = new Map<string, UserRecord>();
  await Promise.all(
    userIds.map(async (id) => {
      const user = await getUserById(id);
      if (user) usersMap.set(id, user);
    })
  );
  return rows.map((row) => ({
    ...row,
    user: usersMap.get(row.userId) ?? null
  }));
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
}) {
  const docId = `${data.eventSlug}_${data.userId}`;
  const now = nowIso();
  const ref = db.eventRegistrations.doc(docId);
  const existing = await ref.get();
  const existingData = existing.exists ? existing.data() : null;
  const participationType =
    data.participationType ??
    (data.teammatePreference === "team" ? "TEAM" : "INDIVIDUAL") as "TEAM" | "INDIVIDUAL";

  await ref.set(
    {
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
      createdAt: existing.exists ? existingData?.createdAt ?? now : now,
      updatedAt: now
    },
    { merge: true }
  );

  return (await ref.get()).data();
}

export async function getEventApplicationByUser(eventSlug: string, userId: string): Promise<EventApplicationRecord | null> {
  const docId = `${eventSlug}_${userId}`;
  const snap = await db.eventApplications.doc(docId).get();
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
  const snap = await db.eventApplications.doc(docId).get();
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
  const snap = await db.teammatePosts.where("eventSlug", "==", eventSlug).orderBy("createdAt", "desc").limit(limitCount).get();
  const rows = snap.docs
    .map((doc) => {
      const data = doc.data();
      return data ? normalizeTeammatePost(doc.id, data) : null;
    })
    .filter((row): row is TeammatePostRecord => row !== null);
  const userIds: string[] = unique(rows.map((row) => row.userId));
  const usersMap = new Map<string, UserRecord>();

  await Promise.all(
    userIds.map(async (id) => {
      const user = await getUserById(id);
      if (user) usersMap.set(id, user);
    })
  );

  return rows.map((row) => ({
    ...row,
    user: usersMap.get(row.userId) ?? null
  }));
}

export async function getEventStats(eventSlug: string) {
  const [registrationsSnap, teammatesSnap, teamSnap, individualSnap] = await Promise.all([
    db.eventRegistrations.where("eventSlug", "==", eventSlug).count().get(),
    db.teammatePosts.where("eventSlug", "==", eventSlug).count().get(),
    db.eventRegistrations.where("eventSlug", "==", eventSlug).where("participationType", "==", "TEAM").count().get(),
    db.eventRegistrations.where("eventSlug", "==", eventSlug).where("participationType", "==", "INDIVIDUAL").count().get()
  ]);

  return {
    registrations: registrationsSnap.data().count,
    teammatePosts: teammatesSnap.data().count,
    teams: teamSnap.data().count,
    individuals: individualSnap.data().count
  };
}

export async function getAdminOverview() {
  const [usersCount, productsCount, launchesCount, commentsCount, upvotesCount, registrationsCount, teammatePostsCount] =
    await Promise.all([
      db.users.count().get(),
      db.products.count().get(),
      db.launches.count().get(),
      db.comments.count().get(),
      db.upvotes.count().get(),
      db.eventRegistrations.count().get(),
      db.teammatePosts.count().get()
    ]);

  return {
    users: usersCount.data().count,
    products: productsCount.data().count,
    launches: launchesCount.data().count,
    comments: commentsCount.data().count,
    upvotes: upvotesCount.data().count,
    eventRegistrations: registrationsCount.data().count,
    teammatePosts: teammatePostsCount.data().count
  };
}
