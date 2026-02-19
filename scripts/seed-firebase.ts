import { randomBytes, scryptSync } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import {
  FIRESTORE_SCHEMA_NAMESPACE,
  FIRESTORE_SCHEMA_VERSION,
  SCHEMA_META_COLLECTION,
  SCHEMA_META_DOC_ID,
  getVersionedCollectionName
} from "../lib/db/schema";

let firestore: any;

const collectionNames = {
  users: getVersionedCollectionName("users"),
  topics: getVersionedCollectionName("topics"),
  products: getVersionedCollectionName("products"),
  launches: getVersionedCollectionName("launches"),
  productMedia: getVersionedCollectionName("productMedia"),
  upvotes: getVersionedCollectionName("upvotes"),
  comments: getVersionedCollectionName("comments"),
  collections: getVersionedCollectionName("collections"),
  collectionItems: getVersionedCollectionName("collectionItems"),
  notifications: getVersionedCollectionName("notifications"),
  eventRegistrations: getVersionedCollectionName("eventRegistrations"),
  teammatePosts: getVersionedCollectionName("teammatePosts")
} as const;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function upsertByField(collection: string, field: string, value: string, data: Record<string, unknown>) {
  const col = firestore.collection(collection);
  const existing = await col.where(field, "==", value).limit(1).get();

  if (!existing.empty) {
    const doc = existing.docs[0]!;
    await doc.ref.set(data, { merge: true });
    return doc.id;
  }

  const doc = col.doc();
  await doc.set(data);
  return doc.id;
}

async function main() {
  loadEnvConfig(process.cwd());
  const { getFirestore } = await import("../lib/firebase-admin");
  firestore = getFirestore();
  const now = new Date().toISOString();

  const makerId = await upsertByField(collectionNames.users, "email", "maker@cph.dev", {
    email: "maker@cph.dev",
    username: "maker_maria",
    passwordHash: hashPassword("password123"),
    name: "Maria Joseph",
    bio: "Building practical tools for founders and teams.",
    avatarUrl: "https://picsum.photos/seed/maria/100/100",
    role: "ADMIN",
    createdAt: now,
    updatedAt: now
  });

  const hunterId = await upsertByField(collectionNames.users, "email", "hunter@cph.dev", {
    email: "hunter@cph.dev",
    username: "hunter_paul",
    passwordHash: hashPassword("password123"),
    name: "Paul Francis",
    bio: "I discover and launch products people actually use.",
    avatarUrl: "https://picsum.photos/seed/paul/100/100",
    role: "USER",
    createdAt: now,
    updatedAt: now
  });

  const topics = ["AI", "Developer Tools", "Productivity", "Education", "No-Code"];
  for (const topic of topics) {
    await upsertByField(collectionNames.topics, "slug", slugify(topic), {
      name: topic,
      slug: slugify(topic),
      description: null,
      createdAt: now
    });
  }

  const productSlug = "launch-liturgy";
  const productId = await upsertByField(collectionNames.products, "slug", productSlug, {
    name: "Launch Liturgy",
    slug: productSlug,
    tagline: "Plan, announce, and grow your launch with a single ritualized workflow.",
    description:
      "Launch Liturgy helps makers coordinate launch timelines, social posts, email drips, and community tasks from one place.",
    websiteUrl: "https://example.com",
    logoUrl: "https://picsum.photos/seed/launchliturgy/200/200",
    status: "LIVE",
    makerId,
    topicSlugs: ["ai", "developer-tools"],
    createdAt: now,
    updatedAt: now
  });

  await upsertByField(collectionNames.launches, "productId", productId, {
    productId,
    hunterId,
    launchDate: now,
    status: "LIVE",
    heroImageUrl: "https://picsum.photos/seed/hero/1280/720",
    galleryJson: null,
    createdAt: now
  });

  const mediaSnap = await firestore.collection(collectionNames.productMedia).where("productId", "==", productId).get();
  if (mediaSnap.empty) {
    await firestore.collection(collectionNames.productMedia).add({
      productId,
      type: "IMAGE",
      url: "https://picsum.photos/seed/cph1/900/600",
      createdAt: now
    });

    await firestore.collection(collectionNames.productMedia).add({
      productId,
      type: "VIDEO",
      url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
      createdAt: now
    });
  }

  const launchSnap = await firestore.collection(collectionNames.launches).where("productId", "==", productId).limit(1).get();
  const launchId = launchSnap.docs[0]?.id;

  if (launchId) {
    await firestore.collection(collectionNames.upvotes).doc(`${makerId}_${launchId}`).set(
      {
        userId: makerId,
        launchId,
        createdAt: now
      },
      { merge: true }
    );

    const existingComment = await firestore.collection(collectionNames.comments).where("launchId", "==", launchId).limit(1).get();
    if (existingComment.empty) {
      await firestore.collection(collectionNames.comments).add({
        launchId,
        userId: hunterId,
        body: "Excited to hunt this today. The onboarding flow is excellent.",
        parentId: null,
        createdAt: now
      });
    }
  }

  const collectionId = await upsertByField(collectionNames.collections, "slug", "launch-starters", {
    name: "Launch Starters",
    slug: "launch-starters",
    description: "Tools for planning and executing a launch week.",
    creatorId: makerId,
    createdAt: now
  });

  await upsertByField(collectionNames.collectionItems, "collectionId_productId", `${collectionId}_${productId}`, {
    collectionId,
    productId,
    note: "Great for first-time makers.",
    position: 1,
    collectionId_productId: `${collectionId}_${productId}`
  });

  const notificationSnap = await firestore.collection(collectionNames.notifications).where("userId", "==", makerId).limit(1).get();
  if (notificationSnap.empty) {
    await firestore.collection(collectionNames.notifications).add({
      userId: makerId,
      title: "Welcome to Catholic Product Hunt",
      body: "Your profile is ready. Submit your next launch and share it with the community.",
      href: "/submit",
      readAt: null,
      createdAt: now
    });
  }

  const eventSlug = "lent-hack-2026";
  await firestore.collection(collectionNames.eventRegistrations).doc(`${eventSlug}_${makerId}`).set(
    {
      eventSlug,
      userId: makerId,
      participationType: "TEAM",
      teamName: "Pilgrim Builders",
      projectName: "Parish Companion",
      skills: ["frontend", "backend", "product"],
      bio: "Building tools for parish communication and volunteer coordination.",
      userName: "Maria Joseph",
      userUsername: "maker_maria",
      userAvatarUrl: "https://picsum.photos/seed/maria/100/100",
      userBio: "Building practical tools for founders and teams.",
      createdAt: now,
      updatedAt: now
    },
    { merge: true }
  );

  await firestore.collection(collectionNames.eventRegistrations).doc(`${eventSlug}_${hunterId}`).set(
    {
      eventSlug,
      userId: hunterId,
      participationType: "INDIVIDUAL",
      teamName: null,
      projectName: "Catechism Quest",
      skills: ["design", "research", "education"],
      bio: "Looking to build an engaging catechism learning experience.",
      userName: "Paul Francis",
      userUsername: "hunter_paul",
      userAvatarUrl: "https://picsum.photos/seed/paul/100/100",
      userBio: "I discover and launch products people actually use.",
      createdAt: now,
      updatedAt: now
    },
    { merge: true }
  );

  const teammateSeed = await firestore.collection(collectionNames.teammatePosts).where("eventSlug", "==", eventSlug).limit(1).get();
  if (teammateSeed.empty) {
    await firestore.collection(collectionNames.teammatePosts).add({
      eventSlug,
      userId: hunterId,
      participationType: "INDIVIDUAL",
      lookingFor: ["frontend", "firebase", "content strategist"],
      message: "I am building Catechism Quest and looking for one frontend engineer and one content partner.",
      createdAt: now
    });
  }

  await firestore.collection(SCHEMA_META_COLLECTION).doc(SCHEMA_META_DOC_ID).set(
    {
      activeVersion: FIRESTORE_SCHEMA_VERSION,
      activeNamespace: FIRESTORE_SCHEMA_NAMESPACE,
      seededAt: now
    },
    { merge: true }
  );

  console.log("Firebase seed complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
