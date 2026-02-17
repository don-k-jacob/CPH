import { firestore } from "@/lib/firebase-admin";

export type UserRecord = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
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

export type EventRegistrationRecord = {
  id: string;
  eventSlug: string;
  userId: string;
  participationType: "TEAM" | "INDIVIDUAL";
  teamName: string | null;
  projectName: string;
  skills: string[];
  bio: string;
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
  return {
    id,
    eventSlug: String(data.eventSlug ?? ""),
    userId: String(data.userId ?? ""),
    participationType: (data.participationType as EventRegistrationRecord["participationType"]) ?? "INDIVIDUAL",
    teamName: data.teamName ? String(data.teamName) : null,
    projectName: String(data.projectName ?? ""),
    skills: Array.isArray(data.skills) ? data.skills.map(String) : [],
    bio: String(data.bio ?? ""),
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

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

const users = firestore.collection("users");
const topics = firestore.collection("topics");
const products = firestore.collection("products");
const launches = firestore.collection("launches");
const productMedia = firestore.collection("productMedia");
const upvotes = firestore.collection("upvotes");
const comments = firestore.collection("comments");
const follows = firestore.collection("follows");
const reports = firestore.collection("reports");
const notifications = firestore.collection("notifications");
const collections = firestore.collection("collections");
const collectionItems = firestore.collection("collectionItems");
const eventRegistrations = firestore.collection("eventRegistrations");
const teammatePosts = firestore.collection("teammatePosts");

export async function getUserById(userId: string): Promise<UserRecord | null> {
  const snap = await users.doc(userId).get();
  if (!snap.exists) return null;
  return normalizeUser(snap.id, snap.data()!);
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const snap = await users.where("email", "==", email.toLowerCase()).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return normalizeUser(doc.id, doc.data());
}

export async function getUserByUsername(username: string): Promise<UserRecord | null> {
  const snap = await users.where("username", "==", username.toLowerCase()).limit(1).get();
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
  const doc = users.doc();
  await doc.set({
    email: data.email.toLowerCase(),
    username: data.username.toLowerCase(),
    passwordHash: data.passwordHash,
    name: data.name,
    bio: null,
    avatarUrl: null,
    role: "USER",
    createdAt: now,
    updatedAt: now
  });
  return (await getUserById(doc.id))!;
}

export async function updateUserProfile(userId: string, data: {
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
}): Promise<void> {
  await users.doc(userId).update({
    name: data.name,
    username: data.username.toLowerCase(),
    bio: data.bio,
    avatarUrl: data.avatarUrl,
    updatedAt: nowIso()
  });
}

export async function createTopicIfMissing(name: string, slug: string): Promise<TopicRecord> {
  const existing = await topics.where("slug", "==", slug).limit(1).get();
  if (!existing.empty) {
    const doc = existing.docs[0]!;
    return normalizeTopic(doc.id, doc.data());
  }

  const doc = topics.doc();
  await doc.set({
    name,
    slug,
    description: null,
    createdAt: nowIso()
  });
  return normalizeTopic(doc.id, (await doc.get()).data()!);
}

export async function getTopicBySlugWithProducts(slug: string) {
  const topicSnap = await topics.where("slug", "==", slug).limit(1).get();
  if (topicSnap.empty) return null;
  const topicDoc = topicSnap.docs[0]!;
  const topic = normalizeTopic(topicDoc.id, topicDoc.data());

  const productSnap = await products.where("topicSlugs", "array-contains", slug).orderBy("createdAt", "desc").get();
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
  const collectionSnap = await collections.where("slug", "==", slug).limit(1).get();
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

  const itemSnap = await collectionItems
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
  const snap = await products.doc(productId).get();
  if (!snap.exists) return null;
  return normalizeProduct(snap.id, snap.data()!);
}

export async function getProductBySlug(slug: string): Promise<ProductRecord | null> {
  const snap = await products.where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return normalizeProduct(doc.id, doc.data());
}

export async function getProductMedia(productId: string): Promise<ProductMediaRecord[]> {
  const snap = await productMedia.where("productId", "==", productId).orderBy("createdAt", "asc").get();
  return snap.docs.map((d) => normalizeMedia(d.id, d.data()));
}

export async function getLatestLiveLaunchForProduct(productId: string): Promise<LaunchRecord | null> {
  const snap = await launches
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
  const snap = await launches.doc(launchId).get();
  if (!snap.exists) return null;
  return normalizeLaunch(snap.id, snap.data()!);
}

export async function getLaunchCounts(launchId: string): Promise<{ upvotes: number; comments: number }> {
  const [upvoteSnap, commentSnap] = await Promise.all([
    upvotes.where("launchId", "==", launchId).count().get(),
    comments.where("launchId", "==", launchId).count().get()
  ]);

  return {
    upvotes: upvoteSnap.data().count,
    comments: commentSnap.data().count
  };
}

export async function getLaunchCommentsTree(launchId: string) {
  const snap = await comments.where("launchId", "==", launchId).orderBy("createdAt", "desc").get();
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
  const doc = comments.doc();
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
  const ref = upvotes.doc(key);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      launchId,
      userId,
      createdAt: nowIso()
    });
  }

  const countSnap = await upvotes.where("launchId", "==", launchId).count().get();
  return countSnap.data().count;
}

export async function followUser(followerId: string, followeeId: string): Promise<number> {
  const key = `${followerId}_${followeeId}`;
  const ref = follows.doc(key);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      followerId,
      followeeId,
      createdAt: nowIso()
    });
  }

  const countSnap = await follows.where("followeeId", "==", followeeId).count().get();
  return countSnap.data().count;
}

export async function createReport(data: {
  launchId: string;
  reporterId: string;
  reason: "SPAM" | "ABUSE" | "SCAM" | "OTHER";
  details?: string;
}): Promise<string> {
  const doc = reports.doc();
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
  const snap = await notifications.where("userId", "==", userId).orderBy("createdAt", "desc").limit(30).get();
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

  const productRef = products.doc();
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

  const launchRef = launches.doc();
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
      const mediaRef = productMedia.doc();
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
  const launchSnap = await launches.where("status", "==", "LIVE").orderBy("launchDate", "desc").limit(30).get();
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
          const snap = await topics.where("slug", "==", slug).limit(1).get();
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
      const snap = await topics.where("slug", "==", topicSlug).limit(1).get();
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
    products.orderBy("createdAt", "desc").limit(120).get(),
    users.limit(120).get(),
    topics.limit(120).get()
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

  const productsSnap = await products.where("makerId", "==", maker.id).orderBy("createdAt", "desc").get();
  const productRows = productsSnap.docs.map((d) => normalizeProduct(d.id, d.data()));

  const [followersSnap, followingSnap] = await Promise.all([
    follows.where("followeeId", "==", maker.id).count().get(),
    follows.where("followerId", "==", maker.id).count().get()
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
  const snap = await launches.where("status", "==", "SCHEDULED").orderBy("launchDate", "asc").get();
  const rows = snap.docs.map((d) => normalizeLaunch(d.id, d.data()));
  return Promise.all(
    rows.map(async (launch) => ({
      ...launch,
      product: await getProductById(launch.productId)
    }))
  );
}

export async function getAllProductsWithCounts() {
  const snap = await products.orderBy("createdAt", "desc").limit(150).get();
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
  const snap = await products.where("makerId", "==", makerId).orderBy("createdAt", "desc").get();
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
  const snap = await eventRegistrations.doc(docId).get();
  if (!snap.exists) return null;
  return normalizeEventRegistration(snap.id, snap.data()!);
}

export async function upsertEventRegistration(data: {
  eventSlug: string;
  userId: string;
  participationType: "TEAM" | "INDIVIDUAL";
  teamName?: string | null;
  projectName: string;
  skills: string[];
  bio: string;
}) {
  const docId = `${data.eventSlug}_${data.userId}`;
  const now = nowIso();
  const ref = eventRegistrations.doc(docId);
  const existing = await ref.get();

  await ref.set(
    {
      eventSlug: data.eventSlug,
      userId: data.userId,
      participationType: data.participationType,
      teamName: data.participationType === "TEAM" ? data.teamName ?? null : null,
      projectName: data.projectName,
      skills: data.skills,
      bio: data.bio,
      createdAt: existing.exists ? existing.data()?.createdAt ?? now : now,
      updatedAt: now
    },
    { merge: true }
  );

  return (await ref.get()).data();
}

export async function createTeammatePost(data: {
  eventSlug: string;
  userId: string;
  participationType: "TEAM" | "INDIVIDUAL";
  lookingFor: string[];
  message: string;
}) {
  const ref = teammatePosts.doc();
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

export async function getTeammatePosts(eventSlug: string, limitCount = 30) {
  const snap = await teammatePosts.where("eventSlug", "==", eventSlug).orderBy("createdAt", "desc").limit(limitCount).get();
  const rows = snap.docs.map((doc) => normalizeTeammatePost(doc.id, doc.data()));
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
    eventRegistrations.where("eventSlug", "==", eventSlug).count().get(),
    teammatePosts.where("eventSlug", "==", eventSlug).count().get(),
    eventRegistrations.where("eventSlug", "==", eventSlug).where("participationType", "==", "TEAM").count().get(),
    eventRegistrations.where("eventSlug", "==", eventSlug).where("participationType", "==", "INDIVIDUAL").count().get()
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
      users.count().get(),
      products.count().get(),
      launches.count().get(),
      comments.count().get(),
      upvotes.count().get(),
      eventRegistrations.count().get(),
      teammatePosts.count().get()
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
