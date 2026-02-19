export const FIRESTORE_SCHEMA_VERSION = "v1" as const;

export const FIRESTORE_SCHEMA_NAMESPACE = `cph_${FIRESTORE_SCHEMA_VERSION}`;

const LEGACY_COLLECTIONS = {
  users: "users",
  topics: "topics",
  products: "products",
  launches: "launches",
  productMedia: "productMedia",
  upvotes: "upvotes",
  comments: "comments",
  follows: "follows",
  reports: "reports",
  notifications: "notifications",
  collections: "collections",
  collectionItems: "collectionItems",
  eventRegistrations: "eventRegistrations",
  teammatePosts: "teammatePosts",
  eventApplications: "eventApplications"
} as const;

export type DbCollectionKey = keyof typeof LEGACY_COLLECTIONS;

export const VERSIONED_COLLECTIONS: Record<DbCollectionKey, string> = {
  users: `${FIRESTORE_SCHEMA_NAMESPACE}_users`,
  topics: `${FIRESTORE_SCHEMA_NAMESPACE}_topics`,
  products: `${FIRESTORE_SCHEMA_NAMESPACE}_products`,
  launches: `${FIRESTORE_SCHEMA_NAMESPACE}_launches`,
  productMedia: `${FIRESTORE_SCHEMA_NAMESPACE}_productMedia`,
  upvotes: `${FIRESTORE_SCHEMA_NAMESPACE}_upvotes`,
  comments: `${FIRESTORE_SCHEMA_NAMESPACE}_comments`,
  follows: `${FIRESTORE_SCHEMA_NAMESPACE}_follows`,
  reports: `${FIRESTORE_SCHEMA_NAMESPACE}_reports`,
  notifications: `${FIRESTORE_SCHEMA_NAMESPACE}_notifications`,
  collections: `${FIRESTORE_SCHEMA_NAMESPACE}_collections`,
  collectionItems: `${FIRESTORE_SCHEMA_NAMESPACE}_collectionItems`,
  eventRegistrations: `${FIRESTORE_SCHEMA_NAMESPACE}_eventRegistrations`,
  teammatePosts: `${FIRESTORE_SCHEMA_NAMESPACE}_teammatePosts`,
  eventApplications: `${FIRESTORE_SCHEMA_NAMESPACE}_eventApplications`
};

export const SCHEMA_META_COLLECTION = "cph_schema_meta";
export const SCHEMA_META_DOC_ID = "active";

export function getLegacyCollectionName(key: DbCollectionKey): string {
  return LEGACY_COLLECTIONS[key];
}

export function getVersionedCollectionName(key: DbCollectionKey): string {
  return VERSIONED_COLLECTIONS[key];
}

export function getAllDbCollectionKeys(): DbCollectionKey[] {
  return Object.keys(LEGACY_COLLECTIONS) as DbCollectionKey[];
}
